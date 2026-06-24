export function getActiveDaysFromDate(createdAt: string | Date): number {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  if (Number.isNaN(created.getTime())) return 0;
  const elapsed = Math.max(0, Date.now() - created.getTime());
  return Math.floor(elapsed / (1000 * 60 * 60 * 24));
}

export function getConsistencyLabel(score: number): '낮음' | '보통' | '높음' {
  if (score >= 70) return '높음';
  if (score >= 40) return '보통';
  return '낮음';
}
