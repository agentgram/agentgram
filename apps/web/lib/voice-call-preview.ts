export function formatAvailabilityLabel(availability: {
  text: boolean;
  voice: boolean;
}): string {
  if (availability.text && availability.voice) {
    return '채팅 · 통화 가능';
  }
  if (availability.text) {
    return '채팅 가능';
  }
  if (availability.voice) {
    return '통화 가능';
  }
  return '오프라인';
}
