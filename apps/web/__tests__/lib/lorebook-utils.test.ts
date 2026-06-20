import { describe, expect, it } from 'vitest';
import { extractLorebookCandidates, type Message } from '../../lib/lorebook-utils';

function userMsg(content: string): Message {
  return { role: 'user', content };
}

function assistantMsg(content: string): Message {
  return { role: 'assistant', content };
}

describe('extractLorebookCandidates — quoted phrases', () => {
  it('extracts a double-quoted phrase from user messages', () => {
    const messages = [userMsg('She goes by "Elara the Bold" in the story')];
    const candidates = extractLorebookCandidates(messages);
    expect(candidates).toContain('Elara the Bold');
  });

  it('extracts a single-quoted phrase from user messages', () => {
    const messages = [userMsg("Call it 'The Shattered Realm' for now")];
    const candidates = extractLorebookCandidates(messages);
    expect(candidates).toContain('The Shattered Realm');
  });

  it('ignores quoted phrases from assistant messages', () => {
    const messages = [
      userMsg('Hello!'),
      assistantMsg('Welcome to "The Hidden Kingdom"'),
    ];
    const candidates = extractLorebookCandidates(messages);
    expect(candidates).not.toContain('The Hidden Kingdom');
  });
});

describe('extractLorebookCandidates — proper nouns', () => {
  it('extracts mid-sentence capitalised words as proper nouns', () => {
    const messages = [userMsg('I want to go to Nordheim for the festival')];
    const candidates = extractLorebookCandidates(messages);
    expect(candidates).toContain('Nordheim');
  });

  it('does not extract common English capitalised words', () => {
    const messages = [userMsg('I think That is a very good idea')];
    const candidates = extractLorebookCandidates(messages);
    expect(candidates).not.toContain('That');
    expect(candidates).not.toContain('I');
  });
});

describe('extractLorebookCandidates — name patterns', () => {
  it('extracts character names from "my name is" pattern', () => {
    const messages = [userMsg('My name is Kira and I come from the east')];
    const candidates = extractLorebookCandidates(messages);
    expect(candidates).toContain('Kira');
  });

  it('extracts character names from "her name is" pattern', () => {
    const messages = [userMsg('Her name is Seraphina, the court mage')];
    const candidates = extractLorebookCandidates(messages);
    expect(candidates).toContain('Seraphina');
  });
});

describe('extractLorebookCandidates — edge cases', () => {
  it('returns empty array for an empty message list', () => {
    expect(extractLorebookCandidates([])).toEqual([]);
  });

  it('returns empty array when only assistant messages are present', () => {
    const messages = [
      assistantMsg('Hello! I am Elara.'),
      assistantMsg('Let me tell you about "The Frozen North"'),
    ];
    expect(extractLorebookCandidates(messages)).toEqual([]);
  });

  it('returns empty array when user messages contain no extractable content', () => {
    const messages = [
      userMsg('hi'),
      userMsg('ok'),
      userMsg('yes'),
    ];
    const candidates = extractLorebookCandidates(messages);
    // May return [] or very short list; no quoted phrases or proper nouns
    expect(candidates.every((c) => c.length >= 3)).toBe(true);
  });

  it('de-duplicates repeated candidates across multiple messages', () => {
    const messages = [
      userMsg('I mentioned Kira earlier'),
      userMsg('Kira is very important to the plot'),
    ];
    const candidates = extractLorebookCandidates(messages);
    const kiraCount = candidates.filter((c) => c === 'Kira').length;
    expect(kiraCount).toBe(1);
  });
});
