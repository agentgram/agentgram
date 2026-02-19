/**
 * AX Score scanner — thin wrapper around @agentgram/ax-score library.
 *
 * Converts the library's AXReport format to the shared AxSignals/AxCategoryScores
 * types used by the web platform, and adds OpenAI-powered recommendation analysis.
 */
import { runAudit } from '@agentgram/ax-score';
import type { AXReport } from '@agentgram/ax-score';
import type {
  AxSignals,
  AxSignalResult,
  AxCategoryScores,
  AxRecommendation,
} from '@agentgram/shared';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AX_DEFAULT_MODEL = process.env.AX_DEFAULT_MODEL || 'gpt-4o-mini';
const AX_SCAN_TIMEOUT_MS = parseInt(
  process.env.AX_SCAN_TIMEOUT_MS || '30000',
  10
);

// --- Audit ID → Signal key mapping ---

const AUDIT_TO_SIGNAL: Record<string, keyof AxSignals> = {
  'robots-ai': 'robotsTxt',
  'llms-txt': 'llmsTxt',
  'openapi-spec': 'openapiJson',
  'ai-plugin': 'aiPluginJson',
  'schema-org': 'schemaOrg',
  'meta-tags': 'metaDescription',
};

// Static signal for sitemap and security.txt (derived from library's HTTP gatherer)
const EXTRA_SIGNALS: (keyof AxSignals)[] = ['sitemapXml', 'securityTxt'];

function auditToSignal(report: AXReport): AxSignals {
  const signals: Partial<AxSignals> = {};

  for (const [auditId, signalKey] of Object.entries(AUDIT_TO_SIGNAL)) {
    const audit = report.audits[auditId];
    signals[signalKey] = {
      found: audit ? audit.score > 0 : false,
      details: audit?.details?.summary ?? undefined,
    };
  }

  // sitemapXml and securityTxt aren't direct audits — check from HTTP artifacts
  // Since we don't have direct access to artifacts here, derive from report score
  for (const key of EXTRA_SIGNALS) {
    if (!signals[key]) {
      signals[key] = { found: false };
    }
  }

  return signals as AxSignals;
}

function reportToCategoryScores(report: AXReport): AxCategoryScores {
  const scores: Record<string, number> = {};
  for (const cat of report.categories) {
    scores[cat.id] = cat.score;
  }

  return {
    discovery: scores['discovery'] ?? 0,
    apiQuality: scores['api-quality'] ?? 0,
    structuredData: scores['structured-data'] ?? 0,
    authOnboarding: scores['auth-onboarding'] ?? 0,
    errorHandling: scores['error-handling'] ?? 0,
    documentation: scores['documentation'] ?? 0,
  };
}

/**
 * Scan a URL using @agentgram/ax-score library.
 */
export async function scanUrl(url: string): Promise<{
  report: AXReport;
  signals: AxSignals;
  score: number;
  categoryScores: AxCategoryScores;
}> {
  const report = await runAudit({
    url,
    timeout: AX_SCAN_TIMEOUT_MS,
  });

  return {
    report,
    signals: auditToSignal(report),
    score: report.score,
    categoryScores: reportToCategoryScores(report),
  };
}

// --- AI analysis for recommendations (platform-specific, uses OpenAI) ---

const ANALYSIS_PROMPT = `You are an AI discoverability analyst. Given a website's audit report, provide actionable recommendations to improve how AI systems discover and interact with this site.

For each recommendation, provide:
- category: one of "discovery", "apiQuality", "structuredData", "authOnboarding", "errorHandling", "documentation"
- priority: "high", "medium", or "low"
- title: concise action item (under 100 chars)
- description: explanation of why this matters
- currentState: what exists now (or null)
- suggestedFix: specific steps to fix
- impactScore: 0-100 estimated improvement impact

Return valid JSON array of recommendation objects. Maximum 10 recommendations.`;

interface AiRecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentState?: string;
  suggestedFix?: string;
  impactScore?: number;
}

export async function analyzeWithAI(
  report: AXReport
): Promise<{
  recommendations: Omit<AxRecommendation, 'id' | 'scanId' | 'createdAt'>[];
  modelOutput: string;
  modelName: string;
}> {
  // Use library's built-in recommendations as fallback
  const fallbackRecs = report.recommendations.map((r) => ({
    category: 'discovery' as const,
    priority: 'medium' as const,
    title: r.audit,
    description: r.message,
    currentState: null,
    suggestedFix: null,
    impactScore: r.impact,
  }));

  if (!OPENAI_API_KEY) {
    return {
      recommendations: fallbackRecs,
      modelOutput: 'AI analysis unavailable (no API key)',
      modelName: 'fallback',
    };
  }

  try {
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
            { role: 'system', content: ANALYSIS_PROMPT },
            {
              role: 'user',
              content: JSON.stringify({
                url: report.url,
                score: report.score,
                categories: report.categories.map((c) => ({
                  id: c.id,
                  title: c.title,
                  score: c.score,
                })),
                failedAudits: Object.values(report.audits)
                  .filter((a) => a.score < 1)
                  .map((a) => ({
                    id: a.id,
                    title: a.title,
                    score: a.score,
                    details: a.details?.summary,
                  })),
              }),
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        }),
      }
    );

    clearTimeout(timer);

    if (!response.ok) {
      console.error('OpenAI analysis error:', response.status);
      return {
        recommendations: fallbackRecs,
        modelOutput: `OpenAI error: ${response.status}`,
        modelName: AX_DEFAULT_MODEL,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const recs: AiRecommendation[] = Array.isArray(parsed)
      ? parsed
      : parsed.recommendations || [];

    return {
      recommendations: recs.map((r) => ({
        category: r.category || 'discovery',
        priority: r.priority || 'medium',
        title: r.title || 'Improve AI discoverability',
        description: r.description || '',
        currentState: r.currentState || null,
        suggestedFix: r.suggestedFix || null,
        impactScore: r.impactScore ?? null,
      })),
      modelOutput: content,
      modelName: AX_DEFAULT_MODEL,
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      recommendations: fallbackRecs,
      modelOutput: `Analysis error: ${error instanceof Error ? error.message : 'unknown'}`,
      modelName: AX_DEFAULT_MODEL,
    };
  }
}
