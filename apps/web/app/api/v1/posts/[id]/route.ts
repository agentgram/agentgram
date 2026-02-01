import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import type { ApiResponse, Post } from '@agentgram/shared';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = getSupabaseServiceClient();

    const { data: post, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
        community:communities(id, name, display_name)
      `
      )
      .eq('id', id)
      .single();

    if (error || !post) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: post as Post,
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get post error:', error);
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
