import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  signRequest,
} from '@agentgram/auth/src/request-signature';
import { generateAgentKeypair } from '@agentgram/auth/src/ed25519';

const mockVerifyApiKey = vi.fn();

vi.mock('@agentgram/auth/src/api-key', () => ({
  extractApiKey: (authorization: string | null) =>
    authorization?.replace('Bearer ', '') ?? null,
  verifyApiKey: mockVerifyApiKey,
}));

function makeRequest(headers?: HeadersInit) {
  return new NextRequest('http://localhost/api/v1/batch', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ag_test_key',
      ...headers,
    },
    body: JSON.stringify({ requests: [] }),
  });
}

async function makeSignedRequest(secretKey: string) {
  const body = JSON.stringify({ requests: [] });
  const timestamp = String(Date.now());
  const signature = await signRequest(secretKey, {
    method: 'POST',
    path: '/api/v1/batch',
    timestamp,
    body,
  });

  return new NextRequest('http://localhost/api/v1/batch', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ag_test_key',
      [SIGNATURE_HEADER]: signature,
      [TIMESTAMP_HEADER]: timestamp,
    },
    body,
  });
}

describe('withAuth request-signature coverage', () => {
  it('rejects incomplete signed requests before any authenticated API handler runs', async () => {
    mockVerifyApiKey.mockResolvedValueOnce({
      agentId: 'agent-1',
      name: 'Verified Agent',
      permissions: ['read', 'write'],
    });
    const { withAuth } = await import('@agentgram/auth/src/middleware');
    const handler = vi.fn(async () => Response.json({ success: true }));

    const response = await withAuth(handler)(
      makeRequest({ [TIMESTAMP_HEADER]: String(Date.now()) })
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(handler).not.toHaveBeenCalled();
  });

  it('continues to allow unsigned authenticated requests for backward compatibility', async () => {
    mockVerifyApiKey.mockResolvedValueOnce({
      agentId: 'agent-1',
      name: 'Verified Agent',
      permissions: ['read', 'write'],
    });
    const { withAuth } = await import('@agentgram/auth/src/middleware');
    const handler = vi.fn(async (req: NextRequest) =>
      Response.json({
        success: true,
        agentId: req.headers.get('x-agent-id'),
      })
    );

    const response = await withAuth(handler)(makeRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true, agentId: 'agent-1' });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('verifies signed requests once when a route still has an explicit signature wrapper', async () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let fetchSpy: ReturnType<typeof vi.spyOn> | undefined;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    try {
      const { publicKey, secretKey } = await generateAgentKeypair();
      fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify([{ public_key: publicKey }]), {
          status: 200,
        })
      );
      mockVerifyApiKey.mockResolvedValueOnce({
        agentId: 'agent-1',
        name: 'Verified Agent',
        permissions: ['read', 'write'],
      });
      const [{ withAuth }, { withAgentSignature }] = await Promise.all([
        import('@agentgram/auth/src/middleware'),
        import('@agentgram/auth/src/request-signature'),
      ]);
      const handler = vi.fn(async (req: NextRequest) =>
        Response.json({ success: true, body: await req.json() })
      );

      const response = await withAuth(withAgentSignature(handler))(
        await makeSignedRequest(secretKey)
      );
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ success: true, body: { requests: [] } });
      expect(handler).toHaveBeenCalledOnce();
      expect(fetchSpy).toHaveBeenCalledOnce();
    } finally {
      if (previousUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
      }
      if (previousServiceKey === undefined) {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      } else {
        process.env.SUPABASE_SERVICE_ROLE_KEY = previousServiceKey;
      }
      fetchSpy?.mockRestore();
    }
  });
});
