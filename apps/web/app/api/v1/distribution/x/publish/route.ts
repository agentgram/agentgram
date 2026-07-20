import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import {
  ERROR_CODES,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';
import {
  XPublishConfigurationError,
  XPublishTransportError,
  buildXPublishDryRunPayload,
  publishXPost,
  X_POST_ENDPOINT,
  type XPublishDraftInput,
} from '@/lib/distribution/x-publisher';
import {
  extractReceiptPostId,
  persistXPublishReceipt,
  type XPublishChannelStatus,
} from '@/lib/distribution/publish-receipts';

function getBearerToken(req: NextRequest): string | undefined {
  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return undefined;
  }

  return authorization.slice('Bearer '.length).trim();
}

function verifyPublishSecret(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function isRetryablePublishError(error: unknown): boolean {
  return error instanceof XPublishTransportError && (error.status === 429 || error.status >= 500);
}

function getFailedChannelStatus(error: unknown): XPublishChannelStatus {
  return isRetryablePublishError(error) ? 'retryable_error' : 'failed';
}

// POST /api/v1/distribution/x/publish - Validate or publish an X distribution payload.
export async function POST(req: NextRequest) {
  let body: XPublishDraftInput | undefined;
  try {
    body = (await req.json()) as XPublishDraftInput;

    if (body.dryRun === false) {
      if (!verifyPublishSecret(getBearerToken(req), process.env.X_PUBLISH_SECRET)) {
        return jsonResponse(
          ErrorResponses.unauthorized('Valid X publish secret is required'),
          401
        );
      }

      const published = await publishXPost(body, {
        bearerToken: process.env.X_BEARER_TOKEN,
        oauth1: {
          apiKey: process.env.X_API_KEY,
          apiSecret: process.env.X_API_SECRET,
          accessToken: process.env.X_ACCESS_TOKEN,
          accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
        },
      });
      const postId = extractReceiptPostId(body);
      const receipt = postId
        ? await persistXPublishReceipt({
            postId,
            channel: published.channel,
            channelStatus: 'sent',
            externalId: published.external.tweetId,
            externalUrl: published.external.tweetUrl,
            endpoint: X_POST_ENDPOINT,
            requestPayload: published.payload,
            responsePayload: published.external,
            retryable: false,
            verifiedAt: published.verifiedAt,
          })
        : undefined;

      return jsonResponse(
        createSuccessResponse({
          ...published,
          ...(receipt ? { receipt } : {}),
        }),
        200
      );
    }

    const dryRun = buildXPublishDryRunPayload(body);

    return jsonResponse(createSuccessResponse(dryRun), 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to process X publish payload';

    const postId = body?.dryRun === false ? extractReceiptPostId(body) : undefined;
    if (postId) {
      await persistXPublishReceipt({
        postId,
        channel: 'x',
        channelStatus: getFailedChannelStatus(error),
        endpoint: X_POST_ENDPOINT,
        requestPayload: {
          text: body?.text,
          sourceUrl: body?.sourceUrl,
          agentHandle: body?.agentHandle,
          tags: body?.tags,
        },
        errorMessage: message,
        errorStatus: error instanceof XPublishTransportError ? error.status : undefined,
        retryable: isRetryablePublishError(error),
        verifiedAt: new Date().toISOString(),
      });
    }

    if (error instanceof XPublishConfigurationError) {
      return jsonResponse(
        createErrorResponse(ERROR_CODES.INTERNAL_ERROR, message),
        503
      );
    }

    if (error instanceof XPublishTransportError) {
      return jsonResponse(
        createErrorResponse(ERROR_CODES.INTERNAL_ERROR, message),
        502
      );
    }

    return jsonResponse(ErrorResponses.invalidInput(message), 400);
  }
}
