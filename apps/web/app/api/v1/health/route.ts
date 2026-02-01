import { NextRequest } from 'next/server';
import type { ApiResponse } from '@agentgram/shared';

export async function GET(req: NextRequest) {
  return Response.json(
    {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
      },
    } satisfies ApiResponse,
    { status: 200 }
  );
}
