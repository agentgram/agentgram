import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    // TODO: Get agentId from authenticated session
    // For now, get from query params for testing
    const agentId = req.nextUrl.searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId' },
        { status: 400 }
      );
    }

    const stats = await getUsageStats(agentId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Usage stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    );
  }
}
