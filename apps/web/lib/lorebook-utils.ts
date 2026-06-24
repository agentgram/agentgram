/**
 * Heuristic utilities for extracting potential lorebook fact candidates
 * from a conversation message list.
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Extracts potential lorebook fact candidates from a list of messages using
 * simple heuristics:
 *
 * 1. Quoted phrases — text wrapped in double or single quotes.
 * 2. Proper nouns — capitalised words that are not sentence-starters.
 * 3. "My name is / her name is / his name is" patterns.
 *
 * Returns de-duplicated strings, shortest-first for chip display.
 *
 * Only considers `user` role messages; assistant messages contain generated
 * content that users haven't confirmed as fact.
 */
export function extractLorebookCandidates(messages: Message[]): string[] {
  if (messages.length === 0) {
    return [];
  }

  const userText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');

  if (!userText.trim()) {
    return [];
  }

  const candidates = new Set<string>();

  // 1. Quoted phrases ("something" or 'something')
  const quotedPhraseRe = /["']([^"']{3,60})["']/g;
  let match: RegExpExecArray | null;
  while ((match = quotedPhraseRe.exec(userText)) !== null) {
    const phrase = match[1].trim();
    if (phrase) {
      candidates.add(phrase);
    }
  }

  // 2. "My/her/his/their name is X" patterns (character name capture)
  const namePatternRe =
    /\b(?:my|her|his|their|its)\s+name\s+is\s+([A-Z][a-zA-Z'-]{1,30})/gi;
  while ((match = namePatternRe.exec(userText)) !== null) {
    candidates.add(match[1].trim());
  }

  // 3. Proper nouns — capitalised mid-sentence words (2–30 chars) that are
  //    not the very first word of the full text and not common English words.
  //    We look for Capital words that follow a non-sentence-ending character
  //    (i.e. not preceded by '. ' or line start).
  const properNounRe = /(?<=[a-z,;:?!\s])\b([A-Z][a-zA-Z'-]{1,29})\b/g;
  const COMMON_WORDS = new Set([
    'I', 'The', 'A', 'An', 'And', 'But', 'Or', 'So', 'My', 'Your', 'His',
    'Her', 'Their', 'Our', 'Its', 'We', 'You', 'He', 'She', 'They', 'It',
    'This', 'That', 'These', 'Those', 'Is', 'Are', 'Was', 'Were', 'Be',
    'Been', 'Being', 'Have', 'Has', 'Had', 'Do', 'Does', 'Did', 'Will',
    'Would', 'Could', 'Should', 'May', 'Might', 'Must', 'Can', 'Shall',
    'Not', 'No', 'Yes', 'If', 'Then', 'When', 'Where', 'Who', 'What',
    'Which', 'How', 'Why', 'Also', 'Just', 'There', 'Here', 'Now', 'Still',
    'Very', 'Really', 'Maybe', 'Never', 'Always', 'Often', 'Sometimes',
  ]);
  while ((match = properNounRe.exec(userText)) !== null) {
    const word = match[1];
    if (!COMMON_WORDS.has(word)) {
      candidates.add(word);
    }
  }

  // Return sorted by length (shorter facts surface first as chip text)
  return Array.from(candidates).sort((a, b) => a.length - b.length);
}
