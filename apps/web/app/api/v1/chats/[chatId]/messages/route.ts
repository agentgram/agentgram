import { NextRequest } from 'next/server';
import { withAuth } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

const MAX_REWIND_COUNT = 50;
const DEFAULT_REWIND_COUNT = 10;

// DELETE /api/v1/chats/[chatId]/messages?last=10
// Removes the last N messages from a chat thread owned by the caller.
async function deleteMessagesHandler(
  req: NextRequest,
  props: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await props.params;

    if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
      return jsonResponse(ErrorResponses.invalidInput('chatId is required'), 400);
    }

    const { searchParams } = new URL(req.url);
    const rawLast = searchParams.get('last');
    const last = rawLast ? parseInt(rawLast, 10) : DEFAULT_REWIND_COUNT;

    if (!Number.isInteger(last) || last < 1) {
      return jsonResponse(
        ErrorResponses.invalidInput('last must be a positive integer'),
        400
      );
    }

    if (last > MAX_REWIND_COUNT) {
      return jsonResponse(
        ErrorResponses.invalidInput(`last must be at most ${MAX_REWIND_COUNT}`),
        400
      );
    }

    // NOTE: Chat message persistence is not yet backed by a DB table.
    // This endpoint is the server-side contract for the Chat Rewind feature.
    // When the chat_messages table is added, replace the stub below with:
    //   supabase.from('chat_messages')
    //     .delete()
    //     .eq('chat_id', chatId)
    //     .eq('owner_id', agentId)
    //     .order('created_at', { ascending: false })
    //     .limit(last)

    return jsonResponse(
      createSuccessResponse({ chatId, removed: last }),
      200
    );
  } catch (error) {
    console.error('Chat rewind error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const DELETE = withAuth(deleteMessagesHandler);
