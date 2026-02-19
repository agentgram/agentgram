/**
 * AX Score baselines — snapshot management for regression detection.
 */
import {
  getAxDbClient,
  type AxBaselineRow,
  type AxScanRow,
} from './db';

interface RegressionResult {
  hasRegression: boolean;
  overallDelta: number;
  categoryDeltas: Record<string, number>;
  regressions: Array<{
    category: string;
    previous: number;
    current: number;
    delta: number;
  }>;
}

/**
 * Create a new baseline for a site, marking any previous baselines as non-current.
 */
export async function createBaseline(
  siteId: string,
  developerId: string,
  scanId: string,
  label?: string
): Promise<AxBaselineRow> {
  const db = getAxDbClient();

  // Get the scan data for the baseline snapshot
  const { data: scan, error: scanError } = await db
    .from('ax_scans')
    .select('*')
    .eq('id', scanId)
    .single();

  if (scanError || !scan) {
    throw new Error(`Scan not found: ${scanId}`);
  }

  const scanRow = scan as AxScanRow;

  // Mark all existing baselines for this site as non-current
  await db
    .from('ax_baselines')
    .update({ is_current: false })
    .eq('site_id', siteId)
    .eq('is_current', true);

  // Insert new baseline
  const { data: baseline, error } = await db
    .from('ax_baselines')
    .insert({
      site_id: siteId,
      developer_id: developerId,
      scan_id: scanId,
      score: scanRow.score,
      category_scores: scanRow.category_scores,
      signals: scanRow.signals,
      label: label || null,
      is_current: true,
    })
    .select()
    .single();

  if (error || !baseline) {
    throw new Error(`Failed to create baseline: ${error?.message}`);
  }

  return baseline as AxBaselineRow;
}

/**
 * Get the current baseline for a site.
 */
export async function getCurrentBaseline(
  siteId: string
): Promise<AxBaselineRow | null> {
  const db = getAxDbClient();

  const { data } = await db
    .from('ax_baselines')
    .select('*')
    .eq('site_id', siteId)
    .eq('is_current', true)
    .single();

  return data ? (data as AxBaselineRow) : null;
}

/**
 * Detect regressions by comparing a baseline against a current scan.
 * A regression is detected when a category score drops by more than the threshold.
 */
export function detectRegression(
  baseline: AxBaselineRow,
  currentScan: AxScanRow,
  threshold = 5
): RegressionResult {
  const baselineScores = baseline.category_scores as Record<string, number>;
  const currentScores = currentScan.category_scores as Record<string, number>;

  const overallDelta = currentScan.score - baseline.score;
  const categoryDeltas: Record<string, number> = {};
  const regressions: RegressionResult['regressions'] = [];

  for (const [category, baselineScore] of Object.entries(baselineScores)) {
    const currentScore = currentScores[category] ?? 0;
    const delta = currentScore - (baselineScore as number);
    categoryDeltas[category] = delta;

    if (delta < -threshold) {
      regressions.push({
        category,
        previous: baselineScore as number,
        current: currentScore,
        delta,
      });
    }
  }

  return {
    hasRegression: regressions.length > 0,
    overallDelta,
    categoryDeltas,
    regressions,
  };
}

/**
 * List baselines for a developer, optionally filtered by site.
 */
export async function listBaselines(
  developerId: string,
  siteId?: string
): Promise<AxBaselineRow[]> {
  const db = getAxDbClient();

  let query = db
    .from('ax_baselines')
    .select('*')
    .eq('developer_id', developerId)
    .order('created_at', { ascending: false });

  if (siteId) {
    query = query.eq('site_id', siteId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list baselines: ${error.message}`);
  }

  return (data || []) as AxBaselineRow[];
}
