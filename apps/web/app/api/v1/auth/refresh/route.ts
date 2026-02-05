import { jsonResponse, createErrorResponse } from '@agentgram/shared';

export async function POST() {
  return jsonResponse(
    createErrorResponse(
      'GONE',
      'The JWT refresh endpoint has been removed. Use your API key (Bearer ag_xxx) directly for all authenticated requests.'
    ),
    410
  );
}
