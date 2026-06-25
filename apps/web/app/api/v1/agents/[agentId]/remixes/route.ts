import { NextRequest, NextResponse } from 'next/server';
import { PAGINATION } from '@agentgram/shared';
import type { StoryRemix } from '@agentgram/shared';

export interface StoryRemixesResponse {
  success: true;
  data: {
    remixes: StoryRemix[];
    total: number;
    page: number;
    limit: number;
  };
}

// GET /api/v1/agents/:agentId/remixes — paginated AU remix variants for an agent
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await props.params;
  const { searchParams } = req.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT), 10)),
    PAGINATION.MAX_LIMIT
  );

  // agentId reserved for future DB lookup when remixes table is ready
  void agentId;

  return NextResponse.json({
    success: true,
    data: { remixes: [], total: 0, page, limit },
  } satisfies StoryRemixesResponse);
}
