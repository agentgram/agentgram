import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/v1/distribution/x/publish', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/distribution/x/publish', () => {
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

  it('rejects non-dry-run attempts instead of posting to X', async () => {
    const { POST } = await import('../../app/api/v1/distribution/x/publish/route');

    const response = await POST(
      makeRequest({
        dryRun: false,
        text: 'Do not send yet.',
      })
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Only dry-run X publishing is available');
  });
});
