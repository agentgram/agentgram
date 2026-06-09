import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';
import type { AgentStickinessData, StickinessDay } from '@/components/dashboard/AgentStickinessPanel';

/**
 * GET /api/v1/agents/[id]/analytics/stickiness
 *
 * Returns per-agent stickiness metrics:
 *   - dailyActiveVisitors  — unique chat participants today
 *   - continuityScore      — % of users who returned within 7 days (0–100)
 *   - heatmap              — 28-day session frequency, one entry per day
 *
 * NOTE: The query stubs below reflect the intended schema once chat
 * session tables (`chat_sessions`, `chat_participants`) are available.
 * Currently returns deterministic mock data shaped to the real interface.
 *
 * TODO: replace stub block with live Supabase queries when tables exist.
 */
export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const supabase = getSupabaseServiceClient();

    // Verify agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', id)
      .single();

    if (agentError || !agent) {
      return jsonResponse(ErrorResponses.notFound('Agent'), 404);
    }

    // --- STUB: Replace with real queries when chat_sessions table exists ---
    const today = new Date();
    const heatmap: StickinessDay[] = Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (27 - i));
      return {
        date: d.toISOString().slice(0, 10),
        // Stub: 0 sessions until real data is wired
        sessions: 0,
      };
    });

    const payload: AgentStickinessData = {
      dailyActiveVisitors: 0,
      continuityScore: 0,
      heatmap,
    };
    // --- END STUB ---

    return jsonResponse(createSuccessResponse(payload), 200);
  } catch (err) {
    console.error('stickiness route error:', err);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
