import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';
import type { MemoryAuditEvent, MemoryAuditPage, MemoryAuditOperation } from '@agentgram/shared';

// TODO: DB migration required — add `agent_memory_audit_log` table:
//   CREATE TABLE agent_memory_audit_log (
//     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
//     session_id text NOT NULL,
//     operation text NOT NULL CHECK (operation IN ('read', 'write', 'delete')),
//     fact_key text NOT NULL,
//     fact_summary text NOT NULL DEFAULT '',
//     created_at timestamptz NOT NULL DEFAULT now()
//   );
//   CREATE INDEX ON agent_memory_audit_log (agent_id, created_at DESC);
// Until the migration runs, this route returns mock data.

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const MOCK_TOTAL = 47;
const MOCK_KEYS = [
  'user_name', 'user_preference_tone', 'last_topic',
  'relationship_status', 'user_location', 'chat_style',
];
const MOCK_OPS: MemoryAuditOperation[] = ['read', 'write', 'delete'];

function buildMockEvents(agentId: string): MemoryAuditEvent[] {
  const now = Date.now();
  return Array.from({ length: MOCK_TOTAL }, (_, i) => ({
    id: `mock-audit-${i}`,
    agentId,
    sessionId: `session-${String(Math.floor(i / 3)).padStart(4, '0')}`,
    operation: MOCK_OPS[i % 3],
    factKey: MOCK_KEYS[i % MOCK_KEYS.length],
    factSummary: `${MOCK_OPS[i % 3]} "${MOCK_KEYS[i % MOCK_KEYS.length]}"`,
    timestamp: new Date(now - i * 60_000).toISOString(),
  }));
}

async function getHandler(req: NextRequest): Promise<Response> {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const url = new URL(req.url);
    const agentId = url.searchParams.get('agentId');
    if (!agentId) {
      return jsonResponse(
        ErrorResponses.invalidInput('agentId query param is required'),
        400
      );
    }

    const rawPage = parseInt(url.searchParams.get('page') ?? '1', 10);
    const rawPageSize = parseInt(
      url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE),
      10
    );
    const page = Math.max(1, Number.isFinite(rawPage) ? rawPage : 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.isFinite(rawPageSize) ? rawPageSize : DEFAULT_PAGE_SIZE)
    );

    // Verify agent ownership — only the owning developer may view audit logs
    const supabase = getSupabaseServiceClient();
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, developer_id')
      .eq('id', agentId)
      .eq('developer_id', developerId)
      .single();

    if (agentError || !agent) {
      return jsonResponse(ErrorResponses.forbidden(), 403);
    }

    // TODO: replace mock below with real DB query after migration:
    //   const { data, count, error } = await supabase
    //     .from('agent_memory_audit_log')
    //     .select('*', { count: 'exact' })
    //     .eq('agent_id', agentId)
    //     .order('created_at', { ascending: false })
    //     .range((page - 1) * pageSize, page * pageSize - 1);
    const allEvents = buildMockEvents(agentId);
    const start = (page - 1) * pageSize;
    const events = allEvents.slice(start, start + pageSize);

    const result: MemoryAuditPage = {
      events,
      total: MOCK_TOTAL,
      page,
      pageSize,
      hasMore: start + pageSize < MOCK_TOTAL,
    };

    return jsonResponse(createSuccessResponse(result));
  } catch (error) {
    console.error('Memory audit GET error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withDeveloperAuth(getHandler);
