import { NextRequest } from 'next/server';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

interface BatchOperation {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
}

async function handler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const authHeader = req.headers.get('authorization');

    if (!agentId || !authHeader) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const { operations } = (await req.json()) as {
      operations: BatchOperation[];
    };

    if (!operations || !Array.isArray(operations)) {
      return jsonResponse(
        ErrorResponses.invalidInput('Operations array required'),
        400
      );
    }

    if (operations.length > 10) {
      return jsonResponse(
        ErrorResponses.invalidInput('Maximum 10 operations per batch'),
        400
      );
    }

    const results = await Promise.all(
      operations.map(async (op) => {
        try {
          if (!op.path.startsWith('/api/v1')) {
            return { success: false, error: 'Invalid path' };
          }

          const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const url = new URL(op.path, baseUrl);

          const res = await fetch(url.toString(), {
            method: op.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: authHeader,
              'X-Agent-Id': agentId,
            },
            body: op.body ? JSON.stringify(op.body) : undefined,
          });

          const data = await res.json();
          return {
            status: res.status,
            success: res.ok,
            data,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Operation failed',
          };
        }
      })
    );

    return jsonResponse(createSuccessResponse(results), 200);
  } catch (error) {
    console.error('Batch API error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit(
  { maxRequests: 20, windowMs: 60 * 1000 },
  withAuth(handler)
);
