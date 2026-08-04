import { NextRequest } from 'next/server';
import { withRateLimit } from '@agentgram/auth';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  AX_BILLING_REPORT_PLANS,
  AX_RATE_LIMITS,
  ERROR_CODES,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';
import { getDeveloperPlan } from '@/lib/ax-score/usage';
import { sweepMcpRegistryCoverage } from '@/lib/ax-score/mcp-registry-audit';

interface AuditRequestBody {
  limit?: unknown;
  maxPages?: unknown;
  cursor?: unknown;
}

function readPositiveInteger(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    return undefined;
  }

  return value;
}

function isBillingReportPlan(plan: string): boolean {
  return (AX_BILLING_REPORT_PLANS as readonly string[]).includes(plan);
}

/**
 * POST /api/v1/ax-score/mcp-registry/audit
 *
 * Produce an x402-ready proof package for the official MCP Registry: a full
 * nextCursor page-chain digest, coverage anomaly report, and Ed25519-signable
 * receipt payload. Auth: Developer (Supabase session) — Pro/Team+ paid report.
 */
const handler = withDeveloperAuth(async function POST(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const plan = await getDeveloperPlan(developerId);
    if (!isBillingReportPlan(plan)) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_PRO_REQUIRED,
          'MCP Registry coverage audit receipts are available on Pro, Team, and Enterprise plans.'
        ),
        402
      );
    }

    const body = (await req.json().catch(() => ({}))) as AuditRequestBody;
    const limit = readPositiveInteger(body.limit);
    const maxPages = readPositiveInteger(body.maxPages);
    const cursor = typeof body.cursor === 'string' ? body.cursor : null;

    const audit = await sweepMcpRegistryCoverage({
      ...(limit ? { limit } : {}),
      ...(maxPages ? { maxPages } : {}),
      cursor,
    });

    return jsonResponse(
      createSuccessResponse({
        developerId,
        plan,
        reportType: 'mcp-registry-coverage-audit',
        payment: audit.receipt.x402,
        audit,
      }),
      200
    );
  } catch (error) {
    console.error('MCP Registry coverage audit error:', error);
    return jsonResponse(
      ErrorResponses.internalError('Failed to produce MCP Registry coverage audit'),
      500
    );
  }
});

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.REPORTS.limit,
    windowMs: AX_RATE_LIMITS.REPORTS.windowMs,
  },
  handler
);
