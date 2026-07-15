import { NextRequest } from 'next/server';
import {
  ErrorResponses,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';
import {
  buildXPublishDryRunPayload,
  type XPublishDraftInput,
} from '@/lib/distribution/x-publisher';

// POST /api/v1/distribution/x/publish - Validate an X publish payload without sending it.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as XPublishDraftInput;
    const dryRun = buildXPublishDryRunPayload(body);

    return jsonResponse(createSuccessResponse(dryRun), 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to validate X publish payload';

    return jsonResponse(ErrorResponses.invalidInput(message), 400);
  }
}
