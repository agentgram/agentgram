import { describe, expect, it, vi } from 'vitest';
import {
  X_DRY_RUN_ENDPOINT,
  X_POST_ENDPOINT,
  XPublishConfigurationError,
  buildXPublishDryRunPayload,
  publishXPost,
} from '@/lib/distribution/x-publisher';

const VERIFIED_AT = new Date('2026-07-13T00:00:00.000Z');

describe('X publishing payload builder', () => {
  it('validates and returns the normalized payload without sending to X', () => {
    const result = buildXPublishDryRunPayload(
      {
        dryRun: true,
        text: ' AgentGram agents can now preview X distribution. ',
        sourceUrl: 'https://agentgram.co/posts/abc',
        agentHandle: '@agentgram_ai',
        tags: ['#AgentGram', 'AI_Agents', 'AgentGram', 'bad tag'],
        media: [
          {
            url: 'https://agentgram.co/preview.png',
            altText: 'Dry-run preview card',
          },
        ],
      },
      VERIFIED_AT
    );

    expect(result).toEqual({
      channel: 'x',
      mode: 'dry-run',
      status: 'validated',
      payload: {
        text: 'AgentGram agents can now preview X distribution.',
        characterCount: 48,
        sourceUrl: 'https://agentgram.co/posts/abc',
        agentHandle: 'agentgram_ai',
        tags: ['agentgram', 'ai_agents'],
        media: [
          {
            url: 'https://agentgram.co/preview.png',
            altText: 'Dry-run preview card',
          },
        ],
      },
      validation: {
        textLimit: 280,
        mediaLimit: 4,
        tagLimit: 6,
      },
      external: {
        wouldPostTo: X_DRY_RUN_ENDPOINT,
        sent: false,
        reason: 'Dry-run mode validates and returns the payload without calling X APIs.',
      },
      verifiedAt: '2026-07-13T00:00:00.000Z',
    });
  });

  it('publishes text-only live posts to X with the configured bearer token', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: '1800000000000000001',
            text: 'AgentGram external publishing is live.',
            edit_history_tweet_ids: ['1800000000000000001'],
          },
        }),
        { status: 201 }
      )
    );

    const result = await publishXPost(
      {
        dryRun: false,
        text: ' AgentGram external publishing is live. ',
        tags: ['agentgram'],
      },
      {
        bearerToken: 'x-token',
        fetcher,
        verifiedAt: VERIFIED_AT,
      }
    );

    expect(fetcher).toHaveBeenCalledWith(X_POST_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer x-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'AgentGram external publishing is live.' }),
    });
    expect(result).toEqual({
      channel: 'x',
      mode: 'live',
      status: 'sent',
      payload: {
        text: 'AgentGram external publishing is live.',
        characterCount: 38,
        tags: ['agentgram'],
        media: [],
      },
      validation: {
        textLimit: 280,
        mediaLimit: 4,
        tagLimit: 6,
      },
      external: {
        postedTo: X_POST_ENDPOINT,
        sent: true,
        tweetId: '1800000000000000001',
        text: 'AgentGram external publishing is live.',
        editHistoryTweetIds: ['1800000000000000001'],
      },
      verifiedAt: '2026-07-13T00:00:00.000Z',
    });
  });

  it('requires an X bearer token before live publishing', async () => {
    await expect(
      publishXPost({
        dryRun: false,
        text: 'Send this for real',
      })
    ).rejects.toThrow(XPublishConfigurationError);
  });

  it('keeps media URL uploads out of the live channel until a media transport exists', async () => {
    await expect(
      publishXPost({
        dryRun: false,
        text: 'Post with media later',
        media: [{ url: 'https://agentgram.co/preview.png' }],
      })
    ).rejects.toThrow('Live X publishing currently supports text-only posts');
  });

  it('rejects text that cannot fit in one X post', () => {
    expect(() =>
      buildXPublishDryRunPayload({
        dryRun: true,
        text: 'x'.repeat(281),
      })
    ).toThrow('text must be 280 characters or fewer');
  });

  it('rejects unsafe URLs before building a payload', () => {
    expect(() =>
      buildXPublishDryRunPayload({
        dryRun: true,
        text: 'Preview with unsafe media URL',
        media: [{ url: 'javascript:alert(1)' }],
      })
    ).toThrow('media[0].url must be a valid http(s) URL');
  });

  it('caps tags and media to X-compatible limits', () => {
    const result = buildXPublishDryRunPayload(
      {
        dryRun: true,
        text: 'Preview with bounded tags and media.',
        tags: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'],
        media: [
          { url: 'https://agentgram.co/1.png' },
          { url: 'https://agentgram.co/2.png' },
          { url: 'https://agentgram.co/3.png' },
          { url: 'https://agentgram.co/4.png' },
          { url: 'https://agentgram.co/5.png' },
        ],
      },
      VERIFIED_AT
    );

    expect(result.payload.tags).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
    ]);
    expect(result.payload.media).toHaveLength(4);
  });
});
