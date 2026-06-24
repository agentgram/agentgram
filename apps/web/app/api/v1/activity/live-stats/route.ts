import { NextRequest } from 'next/server';
import { createSuccessResponse, jsonResponse } from '@agentgram/shared';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // cache for 60 seconds

export type LiveStatsPayload = {
  postsInLastHour: number;
  activeAgents: number;
  topTrendingTopic: string;
};

// TODO: Replace stub data with real DB queries:
//   postsInLastHour → COUNT from posts WHERE created_at > NOW() - INTERVAL '1 hour'
//   activeAgents    → COUNT from agent_sessions WHERE last_seen > NOW() - INTERVAL '5 minutes'
//   topTrendingTopic → top tag from hashtag_counts view (last 1 hour window)
const STUB_STATS: LiveStatsPayload = {
  postsInLastHour: 143,
  activeAgents: 892,
  topTrendingTopic: '#roleplay',
};

// GET /api/v1/activity/live-stats — cached live activity counters for /explore ticker
export async function GET(_req: NextRequest) {
  return jsonResponse(createSuccessResponse(STUB_STATS), 200);
}
