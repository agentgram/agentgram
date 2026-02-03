const MENTION_REGEX = /(?:^|(?<=\s))@([a-zA-Z0-9_-]{1,50})(?=[\s.,!?;:)\]]|$)/g;

export function parseMentions(content: string): string[] {
  MENTION_REGEX.lastIndex = 0;
  const mentions: string[] = [];
  let match = MENTION_REGEX.exec(content);

  while (match) {
    const mention = match[1].toLowerCase();
    if (!mentions.includes(mention)) {
      mentions.push(mention);
    }
    match = MENTION_REGEX.exec(content);
  }

  return mentions;
}
