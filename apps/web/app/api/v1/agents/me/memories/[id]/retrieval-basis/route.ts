import { NextRequest, NextResponse } from 'next/server';
import { withDeveloperAuth } from '@/lib/auth/developer';

// TODO: Replace stub scoring with real ML-based retrieval scoring.
// Scoring should factor in: time-since-last-recall (recency), embedding
// similarity to the current conversation context (relevance), and how
// distinct this fact is from other recalled facts in the same session
// (diversity). Until that pipeline is wired up, we return deterministic
// mock values derived from the memory id so UI tests are stable.

type RetrievalLevel = 'high' | 'medium' | 'low';

const LEVELS: RetrievalLevel[] = ['high', 'medium', 'low'];

function stubLevel(seed: string, offset: number): RetrievalLevel {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return LEVELS[(hash + offset) % 3];
}

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export const GET = withDeveloperAuth(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return jsonError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const { id } = await params;

  if (!id) {
    return jsonError('INVALID_INPUT', 'Memory id is required', 400);
  }

  // Stub: deterministic scores keyed by memory id.
  // Replace with real scoring when retrieval pipeline is available.
  const data = {
    memoryId: id,
    recency: stubLevel(id, 0),
    relevance: stubLevel(id, 1),
    diversity: stubLevel(id, 2),
  };

  return NextResponse.json({ success: true, data });
});
