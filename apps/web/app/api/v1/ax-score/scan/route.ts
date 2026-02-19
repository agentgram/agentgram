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
import type { ScanRequest } from '@agentgram/shared';
import { scanUrl, analyzeWithAI } from '@/lib/ax-score/scanner';
import {
  checkUsageLimit,
  incrementUsage,
  getDeveloperPlan,
} from '@/lib/ax-score/usage';
import {
  getAxDbClient,
  type AxSiteRow,
  type AxScanRow,
  type AxRecommendationRow,
} from '@/lib/ax-score/db';

/**
 * POST /api/v1/ax-score/scan
 *
 * Scan a URL for AI discoverability signals.
 * Auth: Developer (Supabase session)
 */
const handler = withDeveloperAuth(async function POST(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const body = (await req.json()) as ScanRequest;
    const { url, name } = body;

    if (!url || typeof url !== 'string') {
      return jsonResponse(
        ErrorResponses.invalidInput('url is required'),
        400
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return jsonResponse(
        ErrorResponses.invalidInput(
          'Invalid URL. Must be a valid http or https URL.'
        ),
        400
      );
    }

    // Block private/internal IPs (SSRF protection)
    const hostname = parsedUrl.hostname;
    const isPrivate =
      /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|localhost$)/.test(hostname) ||
      hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      hostname === '[::1]' ||
      hostname === '::1';
    if (isPrivate) {
      return jsonResponse(
        ErrorResponses.invalidInput('Scanning private or internal URLs is not allowed.'),
        400
      );
    }

    // Validate URL length
    if (url.length > 2048) {
      return jsonResponse(
        ErrorResponses.invalidInput('URL is too long (max 2048 characters).'),
        400
      );
    }

    const normalizedUrl =
      parsedUrl.origin + parsedUrl.pathname.replace(/\/$/, '');

    // Check usage limits
    const plan = await getDeveloperPlan(developerId);
    const usageCheck = await checkUsageLimit(developerId, 'scans', plan);
    if (!usageCheck.allowed) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_USAGE_LIMIT_REACHED,
          `Scan limit reached (${usageCheck.used}/${usageCheck.limit} this month). Upgrade your plan for more scans.`
        ),
        429
      );
    }

    const db = getAxDbClient();

    // Create or find site record
    const { data: rawSite } = await db
      .from('ax_sites')
      .select('*')
      .eq('developer_id', developerId)
      .eq('url', normalizedUrl)
      .single();

    const existingSite = rawSite as AxSiteRow | null;

    let siteId: string;
    if (existingSite) {
      siteId = existingSite.id;
      if (name && name !== existingSite.name) {
        await db.from('ax_sites').update({ name }).eq('id', siteId);
      }
    } else {
      const { data: rawNewSite, error: siteError } = await db
        .from('ax_sites')
        .insert({
          developer_id: developerId,
          url: normalizedUrl,
          name: name || null,
        })
        .select()
        .single();

      const newSite = rawNewSite as AxSiteRow | null;

      if (siteError || !newSite) {
        console.error('Site creation error:', siteError);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to create site'),
          500
        );
      }
      siteId = newSite.id;
    }

    // Perform the scan using @agentgram/ax-score library
    const startTime = Date.now();
    const { report, signals, score, categoryScores } =
      await scanUrl(normalizedUrl);
    const { recommendations, modelOutput, modelName } =
      await analyzeWithAI(report);
    const durationMs = Date.now() - startTime;

    // Save scan
    const { data: rawScan, error: scanError } = await db
      .from('ax_scans')
      .insert({
        site_id: siteId,
        developer_id: developerId,
        url: normalizedUrl,
        score,
        category_scores: categoryScores,
        signals,
        model_output: modelOutput,
        model_name: modelName,
        scan_type: 'manual',
        status: 'completed',
        duration_ms: durationMs,
      })
      .select()
      .single();

    const scan = rawScan as AxScanRow | null;

    if (scanError || !scan) {
      console.error('Scan save error:', scanError);
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_SCAN_FAILED,
          'Failed to save scan results'
        ),
        500
      );
    }

    // Save recommendations
    if (recommendations.length > 0) {
      const recsToInsert = recommendations.map((r) => ({
        scan_id: scan.id,
        category: r.category,
        priority: r.priority,
        title: r.title,
        description: r.description,
        current_state: r.currentState,
        suggested_fix: r.suggestedFix,
        impact_score: r.impactScore,
      }));

      await db.from('ax_recommendations').insert(recsToInsert);
    }

    // Update site's last_scan_id
    await db
      .from('ax_sites')
      .update({ last_scan_id: scan.id })
      .eq('id', siteId);

    // Increment usage
    await incrementUsage(developerId, 'scans');

    // Fetch saved recommendations
    const { data: rawRecs } = await db
      .from('ax_recommendations')
      .select('*')
      .eq('scan_id', scan.id)
      .order('impact_score', { ascending: false });

    const savedRecs = (rawRecs || []) as AxRecommendationRow[];

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
          scanType: scan.scan_type,
          status: scan.status,
          durationMs: scan.duration_ms,
          createdAt: scan.created_at,
        },
        site: {
          id: siteId,
          url: normalizedUrl,
          name: name || null,
        },
        recommendations: savedRecs.map((r) => ({
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
    console.error('AX scan error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.SCAN.limit,
    windowMs: AX_RATE_LIMITS.SCAN.windowMs,
  },
  handler
);
