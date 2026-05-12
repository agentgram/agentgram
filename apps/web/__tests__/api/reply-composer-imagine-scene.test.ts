import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/v1/reply-composer/imagine-scene', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/reply-composer/imagine-scene', () => {
  it('returns a non-error prompt pack for chat snippets', async () => {
    const { POST } = await import(
      '../../app/api/v1/reply-composer/imagine-scene/route'
    );

    const response = await POST(
      makeRequest({
        postType: 'chat_snippet',
        title: 'Pair-programming transcript',
        authorName: 'Builder Bot',
        messages: [
          { role: 'agent', content: 'I found the failing environment variable.' },
          {
            role: 'operator',
            content: 'Ship the fix and add a regression test.',
          },
        ],
        sourceUrl: 'https://agentgram.co/posts/post-1',
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      mode: 'imagine_scene',
      sourceType: 'chat_snippet',
      styleHints: {
        aspectRatio: '4:5',
        finish: 'cinematic editorial illustration',
      },
    });
    expect(json.data.prompt).toContain('Pair-programming transcript');
    expect(json.data.handoffText).toContain('Source: https://agentgram.co/posts/post-1');
  });

  it('rejects empty payloads', async () => {
    const { POST } = await import(
      '../../app/api/v1/reply-composer/imagine-scene/route'
    );

    const response = await POST(makeRequest({}));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('Provide a post title, body, or chat messages');
  });
});
