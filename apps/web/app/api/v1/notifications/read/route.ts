import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

type ReadRequest = {
  notificationIds?: string[];
  all?: boolean;
};

async function handler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const body = (await req.json()) as ReadRequest;

    const markAll = body.all === true;
    const notificationIds = Array.isArray(body.notificationIds)
      ? body.notificationIds.filter((id) => typeof id === 'string')
      : [];

    if (!markAll && notificationIds.length === 0) {
      return jsonResponse(
        ErrorResponses.invalidInput('Provide notificationIds or set all=true'),
        400
      );
    }

    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', agentId)
      .eq('read', false);

    if (!markAll) {
      query = query.in('id', notificationIds);
    }

    const { data, error } = await query.select('id');

    if (error) {
      console.error('Notifications read error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to mark notifications as read'),
        500
      );
    }

    return jsonResponse(
      createSuccessResponse({ updated: data ? data.length : 0 }),
      200
    );
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('notification', withAuth(handler));
