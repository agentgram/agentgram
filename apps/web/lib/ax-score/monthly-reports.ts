/**
 * AX Score monthly reports — generated executive summaries.
 *
 * Uses OpenAI gpt-4o-mini for narrative generation with a template-based
 * fallback when the API is unavailable. Follows the same pattern as scanner.ts.
 */
import {
  getAxDbClient,
  type AxMonthlyReportRow,
  type AxScanRow,
  type AxAlertRow,
} from './db';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AX_DEFAULT_MODEL = process.env.AX_DEFAULT_MODEL || 'gpt-4o-mini';

interface ListReportsOptions {
  siteId?: string;
  page?: number;
  limit?: number;
}

const REPORT_PROMPT = `You are an AX Score analytics assistant. Generate a concise monthly executive summary for a website's AI discoverability performance.

Given the scan data (scores over the month), alerts, and trends, produce:
1. A 2-3 sentence executive summary
2. Key score trends (improving, declining, stable)
3. Top regressions (if any)
4. Top improvements (if any)
5. 3-5 actionable items for next month

Return valid JSON with these fields:
- summary: string (executive summary paragraph)
- scoreTrend: array of {date, score} objects
- topRegressions: array of {category, delta, description}
- topImprovements: array of {category, delta, description}
- actionItems: array of strings`;

/**
 * Generate a monthly report for a specific site and month.
 */
export async function generateMonthlyReport(
  developerId: string,
  siteId: string,
  month: string
): Promise<AxMonthlyReportRow> {
  const db = getAxDbClient();

  // Check if report already exists
  const { data: existing } = await db
    .from('ax_monthly_reports')
    .select('*')
    .eq('developer_id', developerId)
    .eq('site_id', siteId)
    .eq('month', month)
    .single();

  if (existing) {
    const existingReport = existing as AxMonthlyReportRow;
    if (existingReport.status === 'generated') {
      return existingReport;
    }
  }

  // Create or update the report record as "generating"
  let reportId: string;

  if (existing) {
    reportId = (existing as AxMonthlyReportRow).id;
    await db
      .from('ax_monthly_reports')
      .update({ status: 'generating' })
      .eq('id', reportId);
  } else {
    const { data: created, error: createError } = await db
      .from('ax_monthly_reports')
      .insert({
        developer_id: developerId,
        site_id: siteId,
        month,
        title: `AX Score Report — ${month}`,
        status: 'generating',
      })
      .select()
      .single();

    if (createError || !created) {
      throw new Error(`Failed to create report: ${createError?.message}`);
    }

    reportId = (created as AxMonthlyReportRow).id;
  }

  try {
    // Get all scans for the month
    const monthStart = `${month}-01T00:00:00.000Z`;
    const [year, monthNum] = month.split('-').map(Number);
    const nextMonth = monthNum === 12
      ? `${year + 1}-01-01T00:00:00.000Z`
      : `${year}-${String(monthNum + 1).padStart(2, '0')}-01T00:00:00.000Z`;

    const { data: scansData } = await db
      .from('ax_scans')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'completed')
      .gte('created_at', monthStart)
      .lt('created_at', nextMonth)
      .order('created_at', { ascending: true });

    const scans = (scansData || []) as AxScanRow[];

    // Get alerts for the month
    const { data: alertsData } = await db
      .from('ax_alerts')
      .select('*')
      .eq('site_id', siteId)
      .eq('developer_id', developerId)
      .gte('created_at', monthStart)
      .lt('created_at', nextMonth);

    const alerts = (alertsData || []) as AxAlertRow[];

    // Generate the report content
    const reportContent = await generateReportContent(scans, alerts, month);

    // Update the report with generated content
    const { data: updated, error: updateError } = await db
      .from('ax_monthly_reports')
      .update({
        title: `AX Score Report — ${month}`,
        summary: reportContent.summary,
        score_trend: reportContent.scoreTrend,
        category_trends: reportContent.categoryTrends,
        top_regressions: reportContent.topRegressions,
        top_improvements: reportContent.topImprovements,
        action_items: reportContent.actionItems,
        alert_count: alerts.length,
        model_name: reportContent.modelName,
        status: 'generated',
      })
      .eq('id', reportId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to update report: ${updateError?.message}`);
    }

    return updated as AxMonthlyReportRow;
  } catch (error) {
    // Mark as failed
    await db
      .from('ax_monthly_reports')
      .update({ status: 'failed' })
      .eq('id', reportId);

    throw error;
  }
}

/**
 * Generate report content using OpenAI or fallback to template.
 */
async function generateReportContent(
  scans: AxScanRow[],
  alerts: AxAlertRow[],
  month: string
): Promise<{
  summary: string;
  scoreTrend: unknown;
  categoryTrends: unknown;
  topRegressions: unknown;
  topImprovements: unknown;
  actionItems: unknown;
  modelName: string;
}> {
  const scoreTrend = scans.map((s) => ({
    date: s.created_at,
    score: s.score,
  }));

  // Compute category trends from first and last scan
  const categoryTrends: Record<string, { start: number; end: number; delta: number }> = {};
  if (scans.length >= 2) {
    const first = scans[0].category_scores as Record<string, number>;
    const last = scans[scans.length - 1].category_scores as Record<string, number>;
    for (const [cat, startScore] of Object.entries(first)) {
      const endScore = last[cat] ?? 0;
      categoryTrends[cat] = {
        start: startScore as number,
        end: endScore,
        delta: endScore - (startScore as number),
      };
    }
  }

  // Identify regressions and improvements from alerts
  const regressionAlerts = alerts.filter((a) => a.alert_type === 'regression');
  const improvementAlerts = alerts.filter((a) => a.alert_type === 'improvement');

  const topRegressions = regressionAlerts.map((a) => ({
    category: a.category,
    delta: a.score_delta,
    description: a.description,
  }));

  const topImprovements = improvementAlerts.map((a) => ({
    category: a.category,
    delta: a.score_delta,
    description: a.description,
  }));

  // Try OpenAI for narrative summary
  if (OPENAI_API_KEY && scans.length > 0) {
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
              { role: 'system', content: REPORT_PROMPT },
              {
                role: 'user',
                content: JSON.stringify({
                  month,
                  totalScans: scans.length,
                  scoreRange: {
                    min: Math.min(...scans.map((s) => s.score)),
                    max: Math.max(...scans.map((s) => s.score)),
                    latest: scans[scans.length - 1].score,
                  },
                  categoryTrends,
                  alertCount: alerts.length,
                  regressionCount: regressionAlerts.length,
                  improvementCount: improvementAlerts.length,
                }),
              },
            ],
            temperature: 0.3,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
          }),
        }
      );

      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);

        return {
          summary: parsed.summary || generateTemplateSummary(scans, alerts, month),
          scoreTrend: parsed.scoreTrend || scoreTrend,
          categoryTrends,
          topRegressions: parsed.topRegressions || topRegressions,
          topImprovements: parsed.topImprovements || topImprovements,
          actionItems: parsed.actionItems || [],
          modelName: AX_DEFAULT_MODEL,
        };
      }
    } catch (error) {
      console.error('OpenAI report generation error:', error);
    }
  }

  // Fallback: template-based summary
  return {
    summary: generateTemplateSummary(scans, alerts, month),
    scoreTrend,
    categoryTrends,
    topRegressions,
    topImprovements,
    actionItems: generateTemplateActionItems(categoryTrends),
    modelName: 'template',
  };
}

/**
 * Template-based summary fallback when OpenAI is unavailable.
 */
function generateTemplateSummary(
  scans: AxScanRow[],
  alerts: AxAlertRow[],
  month: string
): string {
  if (scans.length === 0) {
    return `No scans were recorded for ${month}. Run a scan to start tracking your AI discoverability score.`;
  }

  const latest = scans[scans.length - 1];
  const earliest = scans[0];
  const delta = latest.score - earliest.score;
  const trend = delta > 0 ? 'improved' : delta < 0 ? 'declined' : 'remained stable';

  let summary = `In ${month}, your AX Score ${trend} from ${earliest.score} to ${latest.score} across ${scans.length} scan(s).`;

  if (alerts.length > 0) {
    const regressions = alerts.filter((a) => a.alert_type === 'regression').length;
    summary += ` ${alerts.length} alert(s) were generated`;
    if (regressions > 0) {
      summary += `, including ${regressions} regression(s)`;
    }
    summary += '.';
  }

  return summary;
}

/**
 * Generate template action items based on category trends.
 */
function generateTemplateActionItems(
  categoryTrends: Record<string, { start: number; end: number; delta: number }>
): string[] {
  const items: string[] = [];

  for (const [category, trend] of Object.entries(categoryTrends)) {
    if (trend.delta < -5) {
      items.push(`Investigate ${category} score decline (${trend.delta} points) and address root causes.`);
    } else if (trend.end < 50) {
      items.push(`Focus on improving ${category} score (currently ${trend.end}/100).`);
    }
  }

  if (items.length === 0) {
    items.push('Continue monitoring your AX Score trends weekly.');
    items.push('Consider setting up baselines for regression detection.');
  }

  return items.slice(0, 5);
}

/**
 * List monthly reports for a developer with optional filters.
 */
export async function listMonthlyReports(
  developerId: string,
  options: ListReportsOptions = {}
): Promise<{ reports: AxMonthlyReportRow[]; total: number }> {
  const db = getAxDbClient();
  const page = options.page || 1;
  const limit = options.limit || 25;
  const offset = (page - 1) * limit;

  let query = db
    .from('ax_monthly_reports')
    .select('*', { count: 'exact' })
    .eq('developer_id', developerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.siteId) {
    query = query.eq('site_id', options.siteId);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to list monthly reports: ${error.message}`);
  }

  return {
    reports: (data || []) as AxMonthlyReportRow[],
    total: count || 0,
  };
}

/**
 * Get a single monthly report. Validates ownership via developer_id.
 */
export async function getMonthlyReport(
  reportId: string,
  developerId: string
): Promise<AxMonthlyReportRow | null> {
  const db = getAxDbClient();

  const { data } = await db
    .from('ax_monthly_reports')
    .select('*')
    .eq('id', reportId)
    .eq('developer_id', developerId)
    .single();

  return data ? (data as AxMonthlyReportRow) : null;
}
