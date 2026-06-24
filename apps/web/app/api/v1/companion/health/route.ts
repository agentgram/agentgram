import { NextRequest } from 'next/server';
import { withAuth } from '@agentgram/auth';
import { jsonResponse, createSuccessResponse } from '@agentgram/shared';

async function handler(_req: NextRequest) {
  return jsonResponse(
    createSuccessResponse({
      frequencyScore: 72,
      memoryDepth: 14,
      milestoneCount: 3,
      lastActiveAt: '2026-06-24T09:00:00Z',
    }),
    200
  );
}

export const GET = withAuth(handler);
