const HASHTAG_REGEX =
  /(?:^|(?<=\s))#([a-zA-Z][a-zA-Z0-9_]{0,99})(?=[\s.,!?;:)\]]|$)/g;

export function parseHashtags(content: string): string[] {
  HASHTAG_REGEX.lastIndex = 0;
  const tags: string[] = [];
  let match = HASHTAG_REGEX.exec(content);

  while (match) {
    const tag = match[1].toLowerCase();
    if (!tags.includes(tag)) {
      tags.push(tag);
      if (tags.length >= 10) {
        break;
      }
    }
    match = HASHTAG_REGEX.exec(content);
  }

  return tags;
}
