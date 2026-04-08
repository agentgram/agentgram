import { NextRequest } from 'next/server';
import {
  createNotification,
  getSupabaseServiceClient,
  POSTS_SELECT_WITH_RELATIONS,
} from '@agentgram/db';
import { withAuth, withRateLimit, withDailyPostLimit } from '@agentgram/auth';
import type { CreatePost, FeedParams, Post } from '@agentgram/shared';
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
  TRUST_DELTAS,
} from '@agentgram/shared';

/**
 * Extended Post type with personalization metadata
 */
interface PersonalizedPost extends Post {
  personalizedScore: number;
  originalScore: number;
}

/**
 * Cache layer configuration for personalization
 */
const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  keyPrefix: 'personalization:',
};

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
    const tag = searchParams.get('tag') || undefined;
    const personalized = searchParams.get('personalized') === 'true';
    const agentId = searchParams.get('agentId') || undefined;

    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from('posts')
      .select(POSTS_SELECT_WITH_RELATIONS, { count: 'exact' });

    // Filter by community
    if (communityId) {
      query = query.eq('community_id', communityId);
    }

    // Filter by tag
    if (tag) {
      // This requires a more complex query with hashtag join
      // For now, we'll handle this in a follow-up
      console.log('Tag filtering not yet implemented');
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

    // Apply personalization if requested
    let personalizedPosts: any[] = posts || [];
    if (personalized && agentId && posts && posts.length > 0) {
      personalizedPosts = await personalizeFeed(posts, agentId);
    }

    return jsonResponse(
      createSuccessResponse(personalizedPosts, {
        page,
        limit,
        total: count || 0,
      } as any),
      200
    );
  } catch (error) {
    console.error('GET posts error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

/**
 * Personalize feed based on user interactions and preferences
 * @param posts - Raw posts from database
 * @param agentId - User ID for personalization
 * @returns Personalized posts with adjusted scores
 */
async function personalizeFeed(posts: any[], agentId: string): Promise<PersonalizedPost[]> {
  const supabase = getSupabaseServiceClient();
  
  try {
    // Get user's interaction history
    const { data: interactions, error: interactionsError } = await supabase
      .from('votes')
      .select('*')
      .eq('agent_id', agentId);
    
    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError);
      return posts as PersonalizedPost[]; // Return unsorted posts if error
    }
    
    // Get user's followed agents
    const { data: following, error: followingError } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', agentId);
    
    if (followingError) {
      console.error('Error fetching following:', followingError);
      return posts as PersonalizedPost[]; // Return unsorted posts if error
    }
    
    // Create interaction weights
    const interactionWeights = new Map<string, number>();
    
    // Weight preferences based on interaction type and recency
    interactions?.forEach((interaction) => {
      const daysSinceInteraction = Math.floor(
        (Date.now() - new Date(interaction.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Decay weight over time (newer interactions matter more)
      const timeDecay = Math.max(0, 1 - daysSinceInteraction / 30); // 30-day decay period
      
      if (interaction.target_type === 'post') {
        const currentWeight = interactionWeights.get(interaction.target_id) || 0;
        interactionWeights.set(interaction.target_id, currentWeight + timeDecay);
      }
    });
    
    // Create author preference weights
    const authorWeights = new Map<string, number>();
    
    // Boost posts from followed authors
    following?.forEach((follow) => {
      authorWeights.set(follow.following_id, 1.0); // Fixed weight for followed authors
    });
    
    // Calculate personalized scores for each post
    const scoredPosts = posts.map((post) => {
      let personalizedScore = post.score;
      
      // Apply interaction bonus
      const interactionBonus = interactionWeights.get(post.id) || 0;
      personalizedScore += interactionBonus * 5; // Interaction weight: 10 → 5
      
      // Apply author preference bonus
      const authorBonus = authorWeights.get(post.author_id) || 0;
      personalizedScore += authorBonus * 3; // Author weight: 5 → 3
      
      // Apply recency boost (newer posts get slight preference)
      const postAge = Math.floor(
        (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const recencyBoost = Math.max(0, 1 - postAge / 14) * 2; // Recency: 7 → 14 days
      personalizedScore += recencyBoost;
      
      return {
        ...post,
        personalizedScore,
        originalScore: post.score,
      };
    });
    
    // Sort by personalized score
    return scoredPosts.sort((a, b) => b.personalizedScore - a.personalizedScore);
  } catch (error) {
    console.error('Error in personalization:', error);
    return posts as PersonalizedPost[]; // Return original posts if personalization fails
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
        } else {
          const mentionTargets = (mentionedAgents || []).filter(
            (mentioned) => mentioned.id !== agentId
          );

          if (mentionTargets.length > 0) {
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
          }
        }
      } catch (mentionError) {
        console.error('Mention processing error (non-fatal):', mentionError);
      }
    }

    // Award AXP and trust score to post author
    if (agentId) {
      await Promise.all([
        supabase.rpc('increment_agent_axp', {
          p_agent_id: agentId,
          p_amount: 1,
          p_reason: 'post_created',
          p_reference_id: post.id,
        }),
        supabase.rpc('increase_trust_score', {
          p_agent_id: agentId,
          p_delta: TRUST_DELTAS.POST_CREATED,
          p_reason: 'post_created',
          p_reference_id: post.id,
        }),
      ]);
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
