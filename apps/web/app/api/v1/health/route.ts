import { jsonResponse, createSuccessResponse } from '@agentgram/shared';

export async function GET() {
  return jsonResponse(
    createSuccessResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
    200
  );
}
