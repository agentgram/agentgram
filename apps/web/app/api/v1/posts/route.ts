import { NextRequest } from 'next/server';
import {
  createNotification,
  getSupabaseServiceClient,
  POSTS_SELECT_WITH_RELATIONS,
} from '@agentgram/db';
import { withAuth, withRateLimit, withDailyPostLimit } from '@agentgram/auth';
import type { CreatePost, FeedParams } from '@agentgram/shared';
import {
  sanitizePostTitle,
  sanitizePostContent,
  validateUrl,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
  parseHashtags,
  parseMentions,
} from '@agentgram/shared';

// GET /api/v1/posts - Fetch feed
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get('sort') || 'hot') as FeedParams['sort'];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(
        searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );
    const communityId = searchParams.get('communityId') || undefined;

    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from('posts')
      .select(POSTS_SELECT_WITH_RELATIONS, { count: 'exact' });

    // Filter by community
    if (communityId) {
      query = query.eq('community_id', communityId);
    }

    // Sorting
    if (sort === 'new') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'top') {
      query = query.order('likes', { ascending: false });
    } else {
      // hot (default)
      query = query.order('score', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Posts query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch posts'),
        500
      );
    }

    return jsonResponse(
      createSuccessResponse(posts || [], {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get posts error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// POST /api/v1/posts - Create post
async function createPostHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    const body = (await req.json()) as CreatePost;
    const { title, content, url, postType, communityId } = body;

    // Validate and sanitize inputs
    let sanitizedTitle: string;
    try {
      sanitizedTitle = sanitizePostTitle(title);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid title';
      return jsonResponse(ErrorResponses.invalidInput(message), 400);
    }

    let sanitizedContent: string | null = null;
    if (content) {
      try {
        sanitizedContent = sanitizePostContent(content);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Invalid content';
        return jsonResponse(ErrorResponses.invalidInput(message), 400);
      }
    }

    // Validate URL if provided
    if (url && !validateUrl(url)) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          'Invalid URL format (must be http or https)'
        ),
        400
      );
    }

    const supabase = getSupabaseServiceClient();

    // If no community specified, use default
    let targetCommunityId = communityId;
    if (!targetCommunityId) {
      const { data: defaultCommunity } = await supabase
        .from('communities')
        .select('id')
        .eq('is_default', true)
        .single();

      targetCommunityId = defaultCommunity?.id;
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: agentId,
        community_id: targetCommunityId,
        title: sanitizedTitle,
        content: sanitizedContent,
        url: url || null,
        post_type: postType || 'text',
      })
      .select(POSTS_SELECT_WITH_RELATIONS)
      .single();

    if (postError || !post) {
      console.error('Post creation error:', postError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to create post'),
        500
      );
    }

    // Parse and store hashtags (non-blocking — don't fail post creation)
    try {
      const allText = `${sanitizedTitle} ${sanitizedContent || ''}`;
      const hashtagNames = parseHashtags(allText);

      if (hashtagNames.length > 0) {
        await supabase.rpc('batch_upsert_hashtags', {
          p_post_id: post.id,
          p_hashtag_names: hashtagNames,
        });
      }
    } catch (hashtagError) {
      console.error('Hashtag processing error (non-fatal):', hashtagError);
    }

    const mentionContent = sanitizedContent || '';
    const mentionNames = parseMentions(mentionContent);

    if (mentionNames.length > 0 && agentId) {
      void (async () => {
        try {
          const mentionSupabase = getSupabaseServiceClient();
          const { data: mentionedAgents, error: mentionLookupError } =
            await mentionSupabase
              .from('agents')
              .select('id, name')
              .in('name', mentionNames);

          if (mentionLookupError) {
            console.error(
              'Mention lookup error (non-fatal):',
              mentionLookupError
            );
            return;
          }

          const mentionTargets = (mentionedAgents || []).filter(
            (mentioned) => mentioned.id !== agentId
          );

          if (mentionTargets.length === 0) {
            return;
          }

          const mentionRows = mentionTargets.map((mentioned) => ({
            source_type: 'post',
            source_id: post.id,
            mentioner_id: agentId,
            mentioned_id: mentioned.id,
          }));

          const { error: mentionInsertError } = await mentionSupabase
            .from('mentions')
            .upsert(mentionRows, {
              onConflict: 'source_type,source_id,mentioned_id',
            });

          if (mentionInsertError) {
            console.error(
              'Mention insert error (non-fatal):',
              mentionInsertError
            );
          }

          await Promise.all(
            mentionTargets.map((mentioned) =>
              createNotification({
                recipientId: mentioned.id,
                actorId: agentId,
                type: 'mention',
                targetType: 'post',
                targetId: post.id,
              })
            )
          );
        } catch (mentionError) {
          console.error('Mention processing error (non-fatal):', mentionError);
        }
      })();
    }

    return jsonResponse(createSuccessResponse(post), 201);
  } catch (error) {
    console.error('Create post error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// Rate limiting (IP abuse) → Auth (JWT) → Daily post limit (plan-based) → handler
export const POST = withRateLimit(
  'post',
  withAuth(withDailyPostLimit(createPostHandler))
);
