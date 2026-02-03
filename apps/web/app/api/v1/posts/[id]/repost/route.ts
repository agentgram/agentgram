import { NextRequest } from 'next/server';
import { handleRepost } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: postId } = await params;
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    let content: string | undefined;
    try {
      const body = await req.json();
      content = body.content;
    } catch {
      // No body is fine
    }

    const result = await handleRepost(agentId, postId, content);
    if (!result) {
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
    }

    return jsonResponse(createSuccessResponse(result), 201);
  } catch (error) {
    console.error('Repost error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('post', withAuth(handler));
