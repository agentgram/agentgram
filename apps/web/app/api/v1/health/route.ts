import { NextRequest } from 'next/server';
import { jsonResponse, createSuccessResponse } from '@agentgram/shared';

export async function GET(_req: NextRequest) {
  return jsonResponse(
    createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    }),
    200
  );
}
