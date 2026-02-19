import type {
  AxSignals,
  AxSignalResult,
  AxCategoryScores,
  AxRecommendation,
} from '@agentgram/shared';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AX_DEFAULT_MODEL = process.env.AX_DEFAULT_MODEL || 'gpt-4o-mini';
const AX_SCAN_TIMEOUT_MS = parseInt(
  process.env.AX_SCAN_TIMEOUT_MS || '15000',
  10
);
const AX_MAX_CONTENT_CHARS = parseInt(
  process.env.AX_MAX_CONTENT_CHARS || '50000',
  10
);

// --- Signal detection ---

async function checkUrl(
  url: string,
  timeout = AX_SCAN_TIMEOUT_MS
): Promise<{ ok: boolean; text: string; contentType: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AgentGram-AX-Scanner/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, text: '', contentType: '' };
    const text = await res.text();
    return {
      ok: true,
      text: text.slice(0, AX_MAX_CONTENT_CHARS),
      contentType: res.headers.get('content-type') || '',
    };
  } catch {
    return { ok: false, text: '', contentType: '' };
  }
}

function resolveUrl(base: string, path: string): string {
  try {
    return new URL(path, base).href;
  } catch {
    return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}

async function checkSignal(
  baseUrl: string,
  path: string,
  validator?: (text: string) => boolean
): Promise<AxSignalResult> {
  const url = resolveUrl(baseUrl, path);
  const result = await checkUrl(url);
  if (!result.ok) return { found: false, url };
  if (validator && !validator(result.text)) {
    return { found: false, url, details: 'File exists but content invalid' };
  }
  return { found: true, url, details: result.text.slice(0, 500) };
}

/**
 * Scan a URL for AI-discoverability signals.
 */
export async function scanUrl(url: string): Promise<{
  signals: AxSignals;
  pageContent: string;
}> {
  const baseUrl = url.replace(/\/$/, '');

  const [
    robotsTxt,
    llmsTxt,
    openapiJson,
    aiPluginJson,
    schemaOrg,
    sitemapXml,
    securityTxt,
    pageResult,
  ] = await Promise.all([
    checkSignal(baseUrl, '/robots.txt', (t) => t.includes('User-agent')),
    checkSignal(baseUrl, '/llms.txt'),
    checkSignal(baseUrl, '/openapi.json', (t) => {
      try {
        const parsed = JSON.parse(t);
        return 'openapi' in parsed || 'swagger' in parsed;
      } catch {
        return false;
      }
    }),
    checkSignal(baseUrl, '/.well-known/ai-plugin.json', (t) => {
      try {
        JSON.parse(t);
        return true;
      } catch {
        return false;
      }
    }),
    // Schema.org is checked from main page content (below)
    Promise.resolve<AxSignalResult>({ found: false }),
    checkSignal(baseUrl, '/sitemap.xml', (t) =>
      t.includes('<urlset') || t.includes('<sitemapindex')
    ),
    checkSignal(baseUrl, '/.well-known/security.txt'),
    checkUrl(baseUrl),
  ]);

  // Check main page for schema.org JSON-LD and meta description
  let metaDescription: AxSignalResult = { found: false };
  let schemaOrgResult = schemaOrg;

  if (pageResult.ok) {
    // Check for JSON-LD
    const jsonLdMatch = pageResult.text.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (jsonLdMatch) {
      schemaOrgResult = {
        found: true,
        details: jsonLdMatch[1].slice(0, 500),
      };
    }

    // Check for meta description
    const metaMatch = pageResult.text.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
    );
    if (metaMatch) {
      metaDescription = { found: true, details: metaMatch[1] };
    }
  }

  return {
    signals: {
      robotsTxt,
      llmsTxt,
      openapiJson,
      aiPluginJson,
      schemaOrg: schemaOrgResult,
      sitemapXml,
      metaDescription,
      securityTxt,
    },
    pageContent: pageResult.text,
  };
}

// --- Deterministic score computation ---

const SIGNAL_WEIGHTS: Record<keyof AxSignals, number> = {
  robotsTxt: 10,
  llmsTxt: 20,
  openapiJson: 15,
  aiPluginJson: 10,
  schemaOrg: 15,
  sitemapXml: 10,
  metaDescription: 10,
  securityTxt: 10,
};

export function computeScore(signals: AxSignals): number {
  let score = 0;
  for (const [key, weight] of Object.entries(SIGNAL_WEIGHTS)) {
    const signal = signals[key as keyof AxSignals];
    if (signal.found) score += weight;
  }
  return Math.min(100, score);
}

export function computeCategoryScores(signals: AxSignals): AxCategoryScores {
  return {
    discovery: scoreCategory([
      signals.robotsTxt,
      signals.sitemapXml,
      signals.metaDescription,
    ]),
    apiQuality: scoreCategory([signals.openapiJson, signals.aiPluginJson]),
    structuredData: scoreCategory([signals.schemaOrg, signals.llmsTxt]),
    authOnboarding: scoreCategory([signals.aiPluginJson]),
    errorHandling: scoreCategory([signals.robotsTxt, signals.securityTxt]),
    documentation: scoreCategory([
      signals.llmsTxt,
      signals.openapiJson,
      signals.metaDescription,
    ]),
  };
}

function scoreCategory(results: AxSignalResult[]): number {
  if (results.length === 0) return 0;
  const found = results.filter((r) => r.found).length;
  return Math.round((found / results.length) * 100);
}

// --- AI analysis for recommendations ---

const ANALYSIS_PROMPT = `You are an AI discoverability analyst. Given a website's signals and content, provide actionable recommendations to improve how AI systems discover and interact with this site.

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
  signals: AxSignals,
  pageContent: string
): Promise<{
  recommendations: Omit<AxRecommendation, 'id' | 'scanId' | 'createdAt'>[];
  modelOutput: string;
  modelName: string;
}> {
  if (!OPENAI_API_KEY) {
    return {
      recommendations: generateFallbackRecommendations(signals),
      modelOutput: 'AI analysis unavailable (no API key)',
      modelName: 'fallback',
    };
  }

  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
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
                signals,
                pageContentPreview: pageContent.slice(0, 3000),
              }),
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!response.ok) {
      console.error('OpenAI analysis error:', response.status);
      return {
        recommendations: generateFallbackRecommendations(signals),
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
      recommendations: generateFallbackRecommendations(signals),
      modelOutput: `Analysis error: ${error instanceof Error ? error.message : 'unknown'}`,
      modelName: AX_DEFAULT_MODEL,
    };
  }
}

function generateFallbackRecommendations(
  signals: AxSignals
): Omit<AxRecommendation, 'id' | 'scanId' | 'createdAt'>[] {
  const recs: Omit<AxRecommendation, 'id' | 'scanId' | 'createdAt'>[] = [];

  if (!signals.llmsTxt.found) {
    recs.push({
      category: 'documentation',
      priority: 'high',
      title: 'Add llms.txt file',
      description:
        'An llms.txt file helps AI systems understand your site structure and purpose.',
      currentState: 'No llms.txt found',
      suggestedFix:
        'Create a /llms.txt file describing your site, its APIs, and key pages.',
      impactScore: 90,
    });
  }

  if (!signals.openapiJson.found) {
    recs.push({
      category: 'apiQuality',
      priority: 'high',
      title: 'Add OpenAPI specification',
      description:
        'An OpenAPI spec enables AI agents to discover and call your APIs programmatically.',
      currentState: 'No openapi.json found',
      suggestedFix: 'Create an /openapi.json file documenting your API endpoints.',
      impactScore: 85,
    });
  }

  if (!signals.schemaOrg.found) {
    recs.push({
      category: 'structuredData',
      priority: 'medium',
      title: 'Add Schema.org JSON-LD markup',
      description:
        'Structured data helps AI systems extract key information from your pages.',
      currentState: 'No JSON-LD found in page',
      suggestedFix:
        'Add <script type="application/ld+json"> with Organization or WebSite schema.',
      impactScore: 70,
    });
  }

  if (!signals.robotsTxt.found) {
    recs.push({
      category: 'discovery',
      priority: 'medium',
      title: 'Add or fix robots.txt',
      description:
        'A robots.txt file controls which AI crawlers can access your site.',
      currentState: 'No valid robots.txt found',
      suggestedFix: 'Create a /robots.txt with appropriate User-agent directives.',
      impactScore: 60,
    });
  }

  if (!signals.sitemapXml.found) {
    recs.push({
      category: 'discovery',
      priority: 'medium',
      title: 'Add sitemap.xml',
      description: 'A sitemap helps AI crawlers find all important pages on your site.',
      currentState: 'No sitemap.xml found',
      suggestedFix: 'Generate a /sitemap.xml listing your key pages.',
      impactScore: 55,
    });
  }

  if (!signals.metaDescription.found) {
    recs.push({
      category: 'discovery',
      priority: 'low',
      title: 'Add meta description',
      description:
        'A meta description provides AI systems with a summary of your page.',
      currentState: 'No meta description tag found',
      suggestedFix: 'Add <meta name="description" content="..."> to your pages.',
      impactScore: 40,
    });
  }

  return recs;
}
