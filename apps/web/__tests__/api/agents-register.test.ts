import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * POST /api/v1/agents/register — response contract tests.
 *
 * Verifies the register endpoint returns agent, apiKey, nextStep,
 * and claimFlow onboarding metadata that guides callers through the
 * verification handoff.
 */

const mockAgentInsert = vi.fn();
const mockAgentPersonaInsert = vi.fn();
const mockSelectSingle = vi.fn();
const mockDeleteEq = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: (table: string) => {
      if (table === 'agents') {
        return {
          select: () => ({
            eq: () => ({
              single: mockSelectSingle,
            }),
          }),
          insert: mockAgentInsert,
          delete: () => ({ eq: mockDeleteEq }),
        };
      }
      if (table === 'agent_personas') {
        return {
          insert: mockAgentPersonaInsert,
        };
      }
      if (table === 'developers') {
        return {
          insert: () => ({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'dev-1' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'api_keys') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    },
  }),
}));

vi.mock('@agentgram/auth', () => ({
  generateApiKey: () => 'ag_test_key_123456',
  withRateLimit: (_type: unknown, handler: unknown) => handler,
  redis: null,
}));

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed') },
}));

describe('POST /api/v1/agents/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Agent name not taken
    mockSelectSingle.mockResolvedValue({ data: null, error: null });
    // Agent insert succeeds
    mockAgentInsert.mockReturnValue({
      select: () => ({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'agent-1',
            name: 'test-agent',
            display_name: 'test-agent',
            description: '',
            trust_score: 0.5,
            created_at: '2026-01-01T00:00:00Z',
          },
          error: null,
        }),
      }),
    });
    mockAgentPersonaInsert.mockResolvedValue({ error: null });
  });

  async function registerAgent(
    body: Record<string, unknown> = { name: 'test-agent' }
  ) {
    const { POST } = await import('../../app/api/v1/agents/register/route');
    const request = new Request('http://localhost/api/v1/agents/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(request as Parameters<typeof POST>[0]);
  }

  it('should return 201 with agent, apiKey, nextStep, and claimFlow', async () => {
    const response = await registerAgent();
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.agent).toBeDefined();
    expect(json.data.apiKey).toBe('ag_test_key_123456');
    expect(json.data.nextStep).toBeDefined();
    expect(json.data.claimFlow).toBeDefined();
  });

  it('nextStep and claimFlow should point to the claim endpoints', async () => {
    const response = await registerAgent();
    const json = await response.json();
    const { nextStep, claimFlow } = json.data;

    expect(nextStep.path).toBe('/api/v1/agents/claim-token');
    expect(nextStep.method).toBe('POST');
    expect(claimFlow.steps).toHaveLength(2);
    expect(claimFlow.steps[0].step).toBe(1);
    expect(claimFlow.steps[0].path).toBe('/api/v1/agents/claim-token');
    expect(claimFlow.steps[0].method).toBe('POST');
    expect(claimFlow.steps[1].step).toBe(2);
    expect(claimFlow.steps[1].path).toBe('/api/v1/developers/claim-agent');
    expect(claimFlow.steps[1].method).toBe('POST');
  });

  it('nextStep and claimFlow step 1 auth should reference the returned apiKey', async () => {
    const response = await registerAgent();
    const json = await response.json();
    const nextStep = json.data.nextStep;
    const step1 = json.data.claimFlow.steps[0];

    expect(nextStep.auth).toContain('Bearer');
    expect(nextStep.auth).toContain('apiKey');
    expect(step1.auth).toContain('Bearer');
    expect(step1.auth).toContain('apiKey');
  });

  it('claimFlow step 2 body should expect claimToken', async () => {
    const response = await registerAgent();
    const json = await response.json();
    const step2 = json.data.claimFlow.steps[1];

    expect(step2.body).toBeDefined();
    expect(step2.body).toHaveProperty('claimToken');
  });

  it('claimFlow description should be a non-empty string', async () => {
    const response = await registerAgent();
    const json = await response.json();

    expect(typeof json.data.claimFlow.description).toBe('string');
    expect(json.data.claimFlow.description.length).toBeGreaterThan(0);
  });

  it('creates an active starter persona when relationshipPreset is provided', async () => {
    const response = await registerAgent({
      name: 'test-agent',
      relationshipPreset: 'mentor',
    });

    expect(response.status).toBe(201);
    expect(mockAgentPersonaInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        agent_id: 'agent-1',
        is_active: true,
        role: 'Guiding mentor',
      })
    );
  });

  it('rejects unknown relationshipPreset values', async () => {
    const response = await registerAgent({
      name: 'test-agent',
      relationshipPreset: 'coach',
    });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.message).toMatch(/relationshipPreset/i);
    expect(mockAgentPersonaInsert).not.toHaveBeenCalled();
  });
});
