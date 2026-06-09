import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const DEVELOPER_ID = 'dev-test-001';
const AGENT_ID = 'agent-test-001';
const OTHER_DEVELOPER_ID = 'dev-other-999';

// Simulated DB rows returned by agent_memory_audit_log (newest first)
const DB_EVENTS = Array.from({ length: 15 }, (_, i) => ({
  id: `audit-${i}`,
  agent_id: AGENT_ID,
  session_id: `session-${i}`,
  developer_id: DEVELOPER_ID,
  operation: ['read', 'write', 'delete'][i % 3] as string,
  fact_key: `key_${i}`,
  fact_summary: `summary_${i}`,
  created_at: new Date(Date.now() - i * 60_000).toISOString(),
}));

// DB mock state — agents table
const mockAgentSingle = vi.fn();
const mockAgentEq2 = vi.fn();
const mockAgentEq1 = vi.fn();
const mockAgentSelect = vi.fn();
const mockFrom = vi.fn();

// DB mock state — agent_memory_audit_log table
const mockAuditRange = vi.fn();
const mockAuditOrder = vi.fn();
const mockAuditEq = vi.fn();
const mockAuditSelect = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({ from: mockFrom }),
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

function makeReq(
  url: string,
  developerId: string | null = DEVELOPER_ID
): NextRequest {
  const req = new NextRequest(url);
  if (developerId) req.headers.set('x-developer-id', developerId);
  return req;
}

function setupOwnershipSuccess() {
  mockAgentSingle.mockResolvedValue({
    data: { id: AGENT_ID, developer_id: DEVELOPER_ID },
    error: null,
  });
  mockAgentEq2.mockReturnValue({ single: mockAgentSingle });
  mockAgentEq1.mockReturnValue({ eq: mockAgentEq2 });
  mockAgentSelect.mockReturnValue({ eq: mockAgentEq1 });

  // Simulates DB pagination: slices DB_EVENTS by the requested range
  mockAuditRange.mockImplementation((from: number, to: number) =>
    Promise.resolve({
      data: DB_EVENTS.slice(from, to + 1),
      count: DB_EVENTS.length,
      error: null,
    })
  );
  mockAuditOrder.mockReturnValue({ range: mockAuditRange });
  mockAuditEq.mockReturnValue({ order: mockAuditOrder });
  mockAuditSelect.mockReturnValue({ eq: mockAuditEq });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'agents') return { select: mockAgentSelect };
    if (table === 'agent_memory_audit_log') return { select: mockAuditSelect };
    return {};
  });
}

function setupOwnershipFail() {
  mockAgentSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
  mockAgentEq2.mockReturnValue({ single: mockAgentSingle });
  mockAgentEq1.mockReturnValue({ eq: mockAgentEq2 });
  mockAgentSelect.mockReturnValue({ eq: mockAgentEq1 });
  mockFrom.mockImplementation((table: string) => {
    if (table === 'agents') return { select: mockAgentSelect };
    return {};
  });
}

describe('GET /api/v1/agents/me/memory-audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Auth gate: missing developer-id header → 401
  it('returns 401 when x-developer-id header is absent', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}`,
      null
    );
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  // 2. Missing agentId param → 400
  it('returns 400 when agentId query param is missing', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    const req = makeReq('http://localhost/api/v1/agents/me/memory-audit');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('agentId');
  });

  // 3. Non-owner agent access → 403 (ownership check fails)
  it('returns 403 when developer does not own the requested agent', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipFail();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}`,
      OTHER_DEVELOPER_ID
    );
    const res = await GET(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe('FORBIDDEN');
  });

  // 4. Ownership DB check uses both agent_id and developer_id constraints
  it('queries agents table with both agent id and developer id', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}`
    );
    await GET(req);
    expect(mockAgentEq1).toHaveBeenCalledWith('id', AGENT_ID);
    expect(mockAgentEq2).toHaveBeenCalledWith('developer_id', DEVELOPER_ID);
  });

  // 5. Successful response shape
  it('returns 200 with correct MemoryAuditPage shape on success', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}`
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      events: expect.any(Array),
      total: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      hasMore: expect.any(Boolean),
    });
  });

  // 6. MemoryAuditEvent shape in events array
  it('each event has required MemoryAuditEvent fields', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}`
    );
    const res = await GET(req);
    const json = await res.json();
    const event = json.data.events[0];
    expect(event).toMatchObject({
      id: expect.any(String),
      agentId: AGENT_ID,
      sessionId: expect.any(String),
      operation: expect.stringMatching(/^(read|write|delete)$/),
      factKey: expect.any(String),
      factSummary: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  // 7. Pagination — page=2 returns different offset
  it('returns page 2 events correctly', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}&page=2&pageSize=10`
    );
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.page).toBe(2);
    expect(json.data.pageSize).toBe(10);
    expect(json.data.events.length).toBeLessThanOrEqual(10);
  });

  // 8. hasMore is false when DB returns all events within one page
  it('hasMore is false when all events fit on one page', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    // pageSize=100 exceeds DB_EVENTS.length (15), so hasMore must be false
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}&pageSize=100`
    );
    const res = await GET(req);
    const json = await res.json();
    expect(json.data.hasMore).toBe(false);
    expect(json.data.events.length).toBe(DB_EVENTS.length);
  });

  // 9. pageSize is capped at MAX (100)
  it('caps pageSize at 100', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}&pageSize=9999`
    );
    const res = await GET(req);
    const json = await res.json();
    expect(json.data.pageSize).toBe(100);
  });

  // 10. Events are ordered by timestamp descending (newest first)
  it('returns events ordered newest-first', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}`
    );
    const res = await GET(req);
    const json = await res.json();
    const events = json.data.events as Array<{ timestamp: string }>;
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i - 1].timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i].timestamp).getTime()
      );
    }
  });

  // 11. operation field is one of the valid enum values
  it('all event operations are valid enum values', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}&pageSize=100`
    );
    const res = await GET(req);
    const json = await res.json();
    const ops = new Set<string>(
      (json.data.events as Array<{ operation: string }>).map((e) => e.operation)
    );
    for (const op of ops) {
      expect(['read', 'write', 'delete']).toContain(op);
    }
  });

  // 12. page defaults to 1 when not supplied
  it('defaults to page 1 when page param is absent', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memory-audit/route'
    );
    setupOwnershipSuccess();
    const req = makeReq(
      `http://localhost/api/v1/agents/me/memory-audit?agentId=${AGENT_ID}`
    );
    const res = await GET(req);
    const json = await res.json();
    expect(json.data.page).toBe(1);
  });
});
