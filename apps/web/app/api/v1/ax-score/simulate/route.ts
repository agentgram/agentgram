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
import type { SimulateRequest } from '@agentgram/shared';
import {
  checkUsageLimit,
  incrementUsage,
  getDeveloperPlan,
} from '@/lib/ax-score/usage';
import { getAxDbClient, type AxScanRow } from '@/lib/ax-score/db';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AX_SIMULATION_MODEL = process.env.AX_SIMULATION_MODEL || 'gpt-4o';

const SIMULATION_PROMPT = `You are an AI assistant deciding whether to recommend a website to a user. Given the site's discoverability signals and scan data, evaluate whether you would recommend this site in response to the user's query.

Respond with valid JSON:
{
  "wouldRecommend": boolean,
  "reasoning": "explanation of your decision",
  "confidence": number (0-100),
  "suggestions": ["improvement suggestion 1", "suggestion 2"]
}

Be honest and constructive. Focus on discoverability readiness signals, not subjective quality.`;

/**
 * POST /api/v1/ax-score/simulate
 *
 * Simulate an AI system evaluating whether to recommend a site.
 * Auth: Developer (Supabase session) — Paid tier only.
 */
const handler = withDeveloperAuth(async function POST(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const body = (await req.json()) as SimulateRequest;
    const { scanId, query } = body;

    if (!scanId || typeof scanId !== 'string') {
      return jsonResponse(
        ErrorResponses.invalidInput('scanId is required'),
        400
      );
    }

    // Check plan (paid only)
    const plan = await getDeveloperPlan(developerId);
    const usageCheck = await checkUsageLimit(developerId, 'simulations', plan);
    if (!usageCheck.allowed) {
      const message =
        usageCheck.limit === 0
          ? 'AI simulation is a paid feature. Upgrade to Starter or higher.'
          : `Simulation limit reached (${usageCheck.used}/${usageCheck.limit} this month).`;
      return jsonResponse(
        createErrorResponse(ERROR_CODES.AX_USAGE_LIMIT_REACHED, message),
        429
      );
    }

    const db = getAxDbClient();

    // Load scan data
    const { data: rawScan, error: scanError } = await db
      .from('ax_scans')
      .select('*')
      .eq('id', scanId)
      .eq('developer_id', developerId)
      .single();

    const scan = rawScan as AxScanRow | null;

    if (scanError || !scan) {
      return jsonResponse(
        createErrorResponse(ERROR_CODES.AX_SCAN_NOT_FOUND, 'Scan not found'),
        404
      );
    }

    const userQuery = query || `Find me a good resource for ${new URL(scan.url).hostname}`;

    if (!OPENAI_API_KEY) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_SCAN_FAILED,
          'AI simulation unavailable (OpenAI API key not configured)'
        ),
        503
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AX_SIMULATION_MODEL,
          messages: [
            { role: 'system', content: SIMULATION_PROMPT },
            {
              role: 'user',
              content: JSON.stringify({
                userQuery,
                siteUrl: scan.url,
                score: scan.score,
                categoryScores: scan.category_scores,
                signals: scan.signals,
              }),
            },
          ],
          temperature: 0.4,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        }),
      }
    );

    clearTimeout(timer);

    if (!response.ok) {
      console.error('OpenAI simulation error:', response.status);
      return jsonResponse(
        createErrorResponse(ERROR_CODES.AX_SCAN_FAILED, 'AI simulation failed'),
        502
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    await incrementUsage(developerId, 'simulations');

    return jsonResponse(
      createSuccessResponse({
        scanId,
        query: userQuery,
        wouldRecommend: parsed.wouldRecommend ?? false,
        reasoning: parsed.reasoning || '',
        confidence: parsed.confidence ?? 50,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      }),
      200
    );
  } catch (error) {
    console.error('AX simulate error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const POST = withRateLimit(
  { maxRequests: AX_RATE_LIMITS.SIMULATE.limit, windowMs: AX_RATE_LIMITS.SIMULATE.windowMs },
  handler
);
