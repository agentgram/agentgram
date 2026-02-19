import { NextRequest } from 'next/server';
import { withRateLimit } from '@agentgram/auth';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
  ERROR_CODES,
  AX_RATE_LIMITS,
} from '@agentgram/shared';
import {
  getAxDbClient,
  type AxScanRow,
  type AxRecommendationRow,
  type AxSiteRow,
} from '@/lib/ax-score/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/ax-score/reports/[id]
 *
 * Get a single scan with its recommendations.
 * Auth: Developer (Supabase session)
 */
const handler = withDeveloperAuth(async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const { id } = await params;

    if (!id) {
      return jsonResponse(
        ErrorResponses.invalidInput('Scan ID is required'),
        400
      );
    }

    const db = getAxDbClient();

    // Fetch scan
    const { data: rawScan, error: scanError } = await db
      .from('ax_scans')
      .select('*')
      .eq('id', id)
      .eq('developer_id', developerId)
      .single();

    const scan = rawScan as AxScanRow | null;

    if (scanError || !scan) {
      return jsonResponse(
        createErrorResponse(ERROR_CODES.AX_SCAN_NOT_FOUND, 'Scan not found'),
        404
      );
    }

    // Fetch recommendations
    const { data: rawRecs } = await db
      .from('ax_recommendations')
      .select('*')
      .eq('scan_id', id)
      .order('impact_score', { ascending: false });

    const recommendations = (rawRecs || []) as AxRecommendationRow[];

    // Fetch site info
    const { data: rawSite } = await db
      .from('ax_sites')
      .select('id, url, name, status')
      .eq('id', scan.site_id)
      .single();

    const site = rawSite as Pick<
      AxSiteRow,
      'id' | 'url' | 'name' | 'status'
    > | null;

    return jsonResponse(
      createSuccessResponse({
        scan: {
          id: scan.id,
          siteId: scan.site_id,
          developerId: scan.developer_id,
          url: scan.url,
          score: scan.score,
          categoryScores: scan.category_scores,
          signals: scan.signals,
          modelOutput: scan.model_output,
          modelName: scan.model_name,
          scanType: scan.scan_type,
          status: scan.status,
          errorMessage: scan.error_message,
          durationMs: scan.duration_ms,
          createdAt: scan.created_at,
        },
        site: site
          ? {
              id: site.id,
              url: site.url,
              name: site.name,
              status: site.status,
            }
          : null,
        recommendations: recommendations.map((r) => ({
          id: r.id,
          scanId: r.scan_id,
          category: r.category,
          priority: r.priority,
          title: r.title,
          description: r.description,
          currentState: r.current_state,
          suggestedFix: r.suggested_fix,
          impactScore: r.impact_score,
          createdAt: r.created_at,
        })),
      }),
      200
    );
  } catch (error) {
    console.error('AX report detail error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.REPORTS.limit,
    windowMs: AX_RATE_LIMITS.REPORTS.windowMs,
  },
  handler
);
