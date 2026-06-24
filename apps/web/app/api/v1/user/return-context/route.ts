import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { jsonResponse, createSuccessResponse, createErrorResponse } from '@agentgram/shared';

export interface ReturnContextPayload {
  lastVisitedAt: string;
  streakDays: number;
  companionName: string | null;
  latestMilestone: string | null;
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse(
      createErrorResponse('UNAUTHORIZED', 'Authentication required.'),
      401
    );
  }

  // Stub: real implementation would derive these from user session / DB rows.
  const payload: ReturnContextPayload = {
    lastVisitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    streakDays: 0,
    companionName: null,
    latestMilestone: null,
  };

  return jsonResponse(createSuccessResponse(payload), 200);
}
