const CRISIS_KEYWORDS = [
  'suicide',
  'suicidal',
  'kill myself',
  'end my life',
  'hurt myself',
  'self-harm',
  'self harm',
  'selfharm',
  'mental health crisis',
  'emotional crisis',
  'in a crisis',
  'having a crisis',
  'hopeless',
  "don't want to live",
  'dont want to live',
  "i can't go on",
  'i cant go on',
  'want to die',
  'no reason to live',
];

export function detectCrisisKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}
