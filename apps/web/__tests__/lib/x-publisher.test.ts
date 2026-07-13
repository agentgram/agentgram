import { describe, expect, it } from 'vitest';
import {
  X_DRY_RUN_ENDPOINT,
  buildXPublishDryRunPayload,
} from '@/lib/distribution/x-publisher';

const VERIFIED_AT = new Date('2026-07-13T00:00:00.000Z');

describe('X publishing dry-run payload builder', () => {
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

  it('rejects live-send requests until credentials and transport are implemented', () => {
    expect(() =>
      buildXPublishDryRunPayload({
        dryRun: false,
        text: 'Send this for real',
      })
    ).toThrow('Only dry-run X publishing is available in this slice');
  });

  it('rejects text that cannot fit in one X post', () => {
    expect(() =>
      buildXPublishDryRunPayload({
        dryRun: true,
        text: 'x'.repeat(281),
      })
    ).toThrow('text must be 280 characters or fewer');
  });

  it('rejects unsafe URLs before building a dry-run payload', () => {
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
