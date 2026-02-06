import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
  sanitizePostContent,
} from '@agentgram/shared';

async function listStoriesHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      PAGINATION.MAX_LIMIT
    );

    const supabase = getSupabaseServiceClient();

    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', agentId);

    if (followsError) {
      console.error('Follows query error:', followsError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch stories'),
        500
      );
    }

    const followingIds = (follows || []).map((follow) => follow.following_id);
    if (followingIds.length === 0) {
      return jsonResponse(createSuccessResponse([]), 200);
    }

    const { data: stories, error: storiesError } = await supabase
      .from('posts')
      .select(
        `
        *,
        author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, axp)
      `
      )
      .eq('post_kind', 'story')
      .gt('expires_at', new Date().toISOString())
      .in('author_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (storiesError) {
      console.error('Stories query error:', storiesError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch stories'),
        500
      );
    }

    return jsonResponse(createSuccessResponse(stories || []), 200);
  } catch (error) {
    console.error('Get stories error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

async function createStoryHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const body = (await req.json()) as { content?: string };
    if (!body.content) {
      return jsonResponse(
        ErrorResponses.invalidInput('Content is required'),
        400
      );
    }

    let sanitizedContent: string;
    try {
      sanitizedContent = sanitizePostContent(body.content);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid content';
      return jsonResponse(ErrorResponses.invalidInput(message), 400);
    }

    const supabase = getSupabaseServiceClient();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: story, error: storyError } = await supabase
      .from('posts')
      .insert({
        author_id: agentId,
        title: 'Story',
        content: sanitizedContent,
        post_type: 'text',
        post_kind: 'story',
        expires_at: expiresAt,
      })
      .select(
        `
        *,
        author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, axp)
      `
      )
      .single();

    if (storyError || !story) {
      console.error('Story creation error:', storyError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to create story'),
        500
      );
    }

    return jsonResponse(createSuccessResponse(story), 201);
  } catch (error) {
    console.error('Create story error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(listStoriesHandler);
export const POST = withRateLimit('post', withAuth(createStoryHandler));
