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
import type { GenerateLlmsTxtRequest } from '@agentgram/shared';
import {
  checkUsageLimit,
  incrementUsage,
  getDeveloperPlan,
} from '@/lib/ax-score/usage';
import { getAxDbClient, type AxScanRow } from '@/lib/ax-score/db';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AX_DEFAULT_MODEL = process.env.AX_DEFAULT_MODEL || 'gpt-4o-mini';

const GENERATE_PROMPT = `You are an expert at creating llms.txt files — a machine-readable file that helps AI systems understand a website.

Given the site's signals and content, generate a well-structured llms.txt file. Follow this format:

# <Site Name>

> <One-line description>

## About
<2-3 sentence description>

## Key Pages
- [Page Name](url): Description
...

## APIs
- [API Name](url): Description
...

## Documentation
- [Doc Name](url): Description
...

Return ONLY the llms.txt content as plain text (not JSON, not markdown code block). Also include a "sections" array at the very end as a JSON line starting with "---SECTIONS:" listing section names.`;

/**
 * POST /api/v1/ax-score/generate-llmstxt
 *
 * Generate an llms.txt draft from scan data.
 * Auth: Developer (Supabase session) — Paid tier only.
 */
const handler = withDeveloperAuth(async function POST(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const body = (await req.json()) as GenerateLlmsTxtRequest;
    const { scanId } = body;

    if (!scanId || typeof scanId !== 'string') {
      return jsonResponse(
        ErrorResponses.invalidInput('scanId is required'),
        400
      );
    }

    // Check plan (paid only)
    const plan = await getDeveloperPlan(developerId);
    const usageCheck = await checkUsageLimit(developerId, 'generations', plan);
    if (!usageCheck.allowed) {
      const message =
        usageCheck.limit === 0
          ? 'llms.txt generation is a paid feature. Upgrade to Starter or higher.'
          : `Generation limit reached (${usageCheck.used}/${usageCheck.limit} this month).`;
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

    if (!OPENAI_API_KEY) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_SCAN_FAILED,
          'llms.txt generation unavailable (OpenAI API key not configured)'
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
          model: AX_DEFAULT_MODEL,
          messages: [
            { role: 'system', content: GENERATE_PROMPT },
            {
              role: 'user',
              content: JSON.stringify({
                url: scan.url,
                signals: scan.signals,
                categoryScores: scan.category_scores,
                score: scan.score,
              }),
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      }
    );

    clearTimeout(timer);

    if (!response.ok) {
      console.error('OpenAI generate error:', response.status);
      return jsonResponse(
        createErrorResponse(ERROR_CODES.AX_SCAN_FAILED, 'llms.txt generation failed'),
        502
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Parse sections from the output
    let content = rawContent;
    let sections: string[] = [];

    const sectionsMatch = rawContent.match(/---SECTIONS:(.+)/);
    if (sectionsMatch) {
      content = rawContent.replace(/---SECTIONS:.+/, '').trim();
      try {
        sections = JSON.parse(sectionsMatch[1]);
      } catch {
        sections = content
          .split('\n')
          .filter((line: string) => line.startsWith('## '))
          .map((line: string) => line.replace('## ', '').trim());
      }
    } else {
      sections = content
        .split('\n')
        .filter((line: string) => line.startsWith('## '))
        .map((line: string) => line.replace('## ', '').trim());
    }

    await incrementUsage(developerId, 'generations');

    return jsonResponse(
      createSuccessResponse({
        scanId,
        content,
        sections,
      }),
      200
    );
  } catch (error) {
    console.error('AX generate error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const POST = withRateLimit(
  { maxRequests: AX_RATE_LIMITS.GENERATE.limit, windowMs: AX_RATE_LIMITS.GENERATE.windowMs },
  handler
);
