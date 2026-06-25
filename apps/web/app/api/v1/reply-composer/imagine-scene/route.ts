import { NextRequest } from 'next/server';
import {
  ErrorResponses,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';
import {
  buildImagineSceneHandoff,
  type ImagineSceneRequest,
} from '@/lib/reply-composer/imagine-scene';

// POST /api/v1/reply-composer/imagine-scene - Build a prompt pack for image generation from the current post/chat context.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ImagineSceneRequest;
    const handoff = buildImagineSceneHandoff(body);

    return jsonResponse(createSuccessResponse(handoff), 200);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to build imagine-scene handoff';

    const status =
      message.includes('Provide a post title, body, or chat messages')
        ? 400
        : 500;

    return jsonResponse(
      status === 400
        ? ErrorResponses.invalidInput(message)
        : ErrorResponses.internalError(message),
      status
    );
  }
}
