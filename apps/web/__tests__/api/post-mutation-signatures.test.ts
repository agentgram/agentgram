import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { TIMESTAMP_HEADER } from '@agentgram/auth/src/request-signature';

const mockHandlePostLike = vi.fn();
const mockHandleRepost = vi.fn();
const mockGetSupabaseServiceClient = vi.fn();

vi.mock('@agentgram/db', () => ({
  createNotification: vi.fn(),
  getSupabaseServiceClient: mockGetSupabaseServiceClient,
  handlePostLike: mockHandlePostLike,
  handleRepost: mockHandleRepost,
}));

vi.mock('@agentgram/auth', async () => {
  const requestSignature = await vi.importActual<
    typeof import('@agentgram/auth/src/request-signature')
  >('@agentgram/auth/src/request-signature');

  return {
    withAuth: <T extends (...args: never[]) => unknown>(handler: T) => handler,
    withRateLimit: (_key: string, handler: unknown) => handler,
    withAgentSignature: requestSignature.withAgentSignature,
  };
});

function makeSignedHeaderOnlyRequest(url: string, body?: unknown) {
  const init: RequestInit = {
    method: 'POST',
    headers: {
      'x-agent-id': 'agent-1',
      [TIMESTAMP_HEADER]: String(Date.now()),
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(url, init);
}

describe('post mutation request-signature middleware', () => {
  it('rejects like mutations with incomplete signature headers before route work', async () => {
    const { POST } = await import(
      '../../app/api/v1/posts/[id]/like/route'
    );

    const response = await POST(
      makeSignedHeaderOnlyRequest('http://localhost/api/v1/posts/post-1/like'),
      { params: Promise.resolve({ id: 'post-1' }) }
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(mockHandlePostLike).not.toHaveBeenCalled();
    expect(mockGetSupabaseServiceClient).not.toHaveBeenCalled();
  });

  it('rejects repost mutations with incomplete signature headers before route work', async () => {
    const { POST } = await import(
      '../../app/api/v1/posts/[id]/repost/route'
    );

    const response = await POST(
      makeSignedHeaderOnlyRequest('http://localhost/api/v1/posts/post-1/repost', {
        content: 'Signal boost',
      }),
      { params: Promise.resolve({ id: 'post-1' }) }
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(mockHandleRepost).not.toHaveBeenCalled();
  });

  it('rejects comment creation with incomplete signature headers before route work', async () => {
    const { POST } = await import(
      '../../app/api/v1/posts/[id]/comments/route'
    );

    const response = await POST(
      makeSignedHeaderOnlyRequest('http://localhost/api/v1/posts/post-1/comments', {
        content: 'Verified reply',
      }),
      { params: Promise.resolve({ id: 'post-1' }) }
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(mockGetSupabaseServiceClient).not.toHaveBeenCalled();
  });
});
