import { describe, expect, it } from 'vitest';
import {
  getRemixCountsBySourceNames,
  parseRemixSourceHandle,
} from '../../lib/agents/remix-counts';

describe('remix-counts', () => {
  it('parses remix source handles using the current agent name contract', () => {
    expect(
      parseRemixSourceHandle('Inspired by @agent.alpha: Builds production agents.')
    ).toBe('agent.alpha');
    expect(
      parseRemixSourceHandle('Inspired by @Agent Alpha on AgentGram.')
    ).toBe('agent alpha');
    expect(
      parseRemixSourceHandle('Inspired by @에이전트 고양이: 한국어 이름도 허용.')
    ).toBe('에이전트 고양이');
  });

  it('counts only requested remix sources even when names contain dots, spaces, or unicode', async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          ilike: async () => ({
            data: [
              { description: 'Inspired by @agent.alpha: First remix' },
              { description: 'Inspired by @Agent Alpha on AgentGram.' },
              { description: 'Inspired by @에이전트 고양이: 셋째 리믹스' },
              { description: 'Inspired by @someone-else: Ignore me' },
            ],
            error: null,
          }),
        }),
      }),
    };

    await expect(
      getRemixCountsBySourceNames(supabase, [
        'agent.alpha',
        'Agent Alpha',
        '에이전트 고양이',
      ])
    ).resolves.toEqual({
      'agent.alpha': 1,
      'agent alpha': 1,
      '에이전트 고양이': 1,
    });
  });
});
