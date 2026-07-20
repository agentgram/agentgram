import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const ORIGINAL_X_PUBLISH_SECRET = process.env.X_PUBLISH_SECRET;
const ORIGINAL_X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const ORIGINAL_X_API_KEY = process.env.X_API_KEY;
const ORIGINAL_X_API_SECRET = process.env.X_API_SECRET;
const ORIGINAL_X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN;
const ORIGINAL_X_ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET;

type XPublishEnvName =
  | 'X_PUBLISH_SECRET'
  | 'X_BEARER_TOKEN'
  | 'X_API_KEY'
  | 'X_API_SECRET'
  | 'X_ACCESS_TOKEN'
  | 'X_ACCESS_TOKEN_SECRET';

function restoreEnv(name: XPublishEnvName, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

function makeRequest(body: unknown, authorization?: string) {
  return new NextRequest('http://localhost/api/v1/distribution/x/publish', {
    method: 'POST',
    body: JSON.stringify(body),
    ...(authorization ? { headers: { authorization } } : {}),
  });
}

describe('POST /api/v1/distribution/x/publish', () => {
  afterEach(() => {
    restoreEnv('X_PUBLISH_SECRET', ORIGINAL_X_PUBLISH_SECRET);
    restoreEnv('X_BEARER_TOKEN', ORIGINAL_X_BEARER_TOKEN);
    restoreEnv('X_API_KEY', ORIGINAL_X_API_KEY);
    restoreEnv('X_API_SECRET', ORIGINAL_X_API_SECRET);
    restoreEnv('X_ACCESS_TOKEN', ORIGINAL_X_ACCESS_TOKEN);
    restoreEnv('X_ACCESS_TOKEN_SECRET', ORIGINAL_X_ACCESS_TOKEN_SECRET);
    vi.unstubAllGlobals();
  });

  it('returns a validated dry-run X payload and does not send externally', async () => {
    const { POST } = await import('../../app/api/v1/distribution/x/publish/route');

    const response = await POST(
      makeRequest({
        dryRun: true,
        text: 'AgentGram can now validate X launch copy before credentials land.',
        sourceUrl: 'https://agentgram.co/posts/post-1',
        tags: ['#AgentGram', 'launch'],
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      channel: 'x',
      mode: 'dry-run',
      status: 'validated',
      payload: {
        text: 'AgentGram can now validate X launch copy before credentials land.',
        sourceUrl: 'https://agentgram.co/posts/post-1',
        tags: ['agentgram', 'launch'],
      },
      external: {
        wouldPostTo: 'https://api.x.com/2/tweets',
        sent: false,
      },
    });
  });

  it('requires the operator publish secret for live X posts', async () => {
    process.env.X_PUBLISH_SECRET = 'publish-secret';
    process.env.X_BEARER_TOKEN = 'x-token';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('../../app/api/v1/distribution/x/publish/route');

    const response = await POST(
      makeRequest({
        dryRun: false,
        text: 'Do not publish without the operator secret.',
      })
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Valid X publish secret is required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts a live text update to X when the operator secret and token are configured', async () => {
    process.env.X_PUBLISH_SECRET = 'publish-secret';
    process.env.X_BEARER_TOKEN = 'x-token';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: '1800000000000000002',
            text: 'AgentGram external distribution is live.',
            edit_history_tweet_ids: ['1800000000000000002'],
          },
        }),
        { status: 201 }
      )
    );
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('../../app/api/v1/distribution/x/publish/route');

    const response = await POST(
      makeRequest(
        {
          dryRun: false,
          text: 'AgentGram external distribution is live.',
          tags: ['agentgram'],
        },
        'Bearer publish-secret'
      )
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('https://api.x.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer x-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'AgentGram external distribution is live.' }),
    });
    expect(json.data).toMatchObject({
      channel: 'x',
      mode: 'live',
      status: 'sent',
      external: {
        postedTo: 'https://api.x.com/2/tweets',
        sent: true,
        tweetId: '1800000000000000002',
      },
    });
  });

  it('uses OAuth API-key credentials for live X posts when no bearer token is configured', async () => {
    process.env.X_PUBLISH_SECRET = 'publish-secret';
    delete process.env.X_BEARER_TOKEN;
    process.env.X_API_KEY = 'api-key';
    process.env.X_API_SECRET = 'api-secret';
    process.env.X_ACCESS_TOKEN = 'access-token';
    process.env.X_ACCESS_TOKEN_SECRET = 'access-token-secret';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: '1800000000000000004',
            text: 'AgentGram external distribution can use OAuth credentials.',
            edit_history_tweet_ids: ['1800000000000000004'],
          },
        }),
        { status: 201 }
      )
    );
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('../../app/api/v1/distribution/x/publish/route');

    const response = await POST(
      makeRequest(
        {
          dryRun: false,
          text: 'AgentGram external distribution can use OAuth credentials.',
        },
        'Bearer publish-secret'
      )
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.headers.Authorization).toMatch(/^OAuth /);
    expect(requestInit.headers.Authorization).toContain('oauth_consumer_key="api-key"');
    expect(requestInit.headers.Authorization).toContain('oauth_token="access-token"');
    expect(requestInit.headers.Authorization).not.toContain('api-secret');
    expect(requestInit.headers.Authorization).not.toContain('access-token-secret');
    expect(json.data.external.tweetId).toBe('1800000000000000004');
  });

  it('reports a configuration error when live publishing lacks an X bearer token', async () => {
    process.env.X_PUBLISH_SECRET = 'publish-secret';
    delete process.env.X_BEARER_TOKEN;
    delete process.env.X_API_KEY;
    delete process.env.X_API_SECRET;
    delete process.env.X_ACCESS_TOKEN;
    delete process.env.X_ACCESS_TOKEN_SECRET;
    const { POST } = await import('../../app/api/v1/distribution/x/publish/route');

    const response = await POST(
      makeRequest(
        {
          dryRun: false,
          text: 'Token missing.',
        },
        'Bearer publish-secret'
      )
    );
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Configure X_BEARER_TOKEN or X_API_KEY');
  });
});
