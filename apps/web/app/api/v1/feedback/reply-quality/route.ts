import { NextRequest } from 'next/server';
import { withAuth } from '@agentgram/auth';
import { createSuccessResponse, ErrorResponses, jsonResponse } from '@agentgram/shared';

const VALID_REASONS = new Set(['repetitive', 'off-topic', 'missed-memory', 'filtered', 'other']);

async function handler(req: NextRequest) {
  try {
    const body = (await req.json()) as { reason?: unknown; messageId?: unknown };
    const { reason, messageId } = body;

    if (typeof reason !== 'string' || !VALID_REASONS.has(reason)) {
      return jsonResponse(
        ErrorResponses.invalidInput('reason must be one of: repetitive, off-topic, missed-memory, filtered, other'),
        400
      );
    }
    if (typeof messageId !== 'string' || !messageId) {
      return jsonResponse(ErrorResponses.invalidInput('messageId (string) is required'), 400);
    }

    // Stub: persist tuning signal in a future implementation
    console.log('[reply-quality-feedback]', { reason, messageId });

    return jsonResponse(createSuccessResponse({ received: true }), 200);
  } catch {
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withAuth(handler);
