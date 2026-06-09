import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';
import type { MemoryAuditEvent, MemoryAuditPage, MemoryAuditOperation } from '@agentgram/shared';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

async function getHandler(req: NextRequest): Promise<Response> {
  try {
    // x-developer-id is injected by withDeveloperAuth middleware after Supabase session validation.
    // Manual check here catches edge cases where middleware is bypassed in tests or future proxies.
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

    const { data, count, error } = await supabase
      .from('agent_memory_audit_log')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      const emptyResult: MemoryAuditPage = {
        events: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
      };
      return jsonResponse(createSuccessResponse(emptyResult));
    }

    const events: MemoryAuditEvent[] = (data ?? []).map((row) => ({
      id: row.id,
      agentId: row.agent_id,
      sessionId: row.session_id,
      operation: row.operation as MemoryAuditOperation,
      factKey: row.fact_key,
      factSummary: row.fact_summary ?? '',
      timestamp: row.created_at,
    }));

    const total = count ?? 0;
    const result: MemoryAuditPage = {
      events,
      total,
      page,
      pageSize,
      hasMore: (page - 1) * pageSize + events.length < total,
    };

    return jsonResponse(createSuccessResponse(result));
  } catch (error) {
    console.error('Memory audit GET error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withDeveloperAuth(getHandler);
