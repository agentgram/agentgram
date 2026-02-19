/**
 * AX Score alerts — weekly volatility and regression event detection.
 */
import {
  getAxDbClient,
  type AxAlertRow,
  type AxScanRow,
  type AxSiteRow,
} from './db';
import { getCurrentBaseline, detectRegression } from './baselines';

interface ListAlertsOptions {
  status?: string;
  siteId?: string;
  page?: number;
  limit?: number;
}

interface VolatilityResult {
  isVolatile: boolean;
  stddev: number;
  mean: number;
  scores: number[];
}

/**
 * Generate weekly alerts for a developer by comparing recent scans against baselines.
 */
export async function generateWeeklyAlerts(
  developerId: string
): Promise<AxAlertRow[]> {
  const db = getAxDbClient();
  const alerts: AxAlertRow[] = [];

  // Get all active sites for the developer
  const { data: sites } = await db
    .from('ax_sites')
    .select('*')
    .eq('developer_id', developerId)
    .eq('status', 'active');

  if (!sites || sites.length === 0) return alerts;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  for (const siteData of sites) {
    const site = siteData as AxSiteRow;

    // Get recent scans (last 7 days)
    const { data: recentScans } = await db
      .from('ax_scans')
      .select('*')
      .eq('site_id', site.id)
      .eq('status', 'completed')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (!recentScans || recentScans.length === 0) continue;

    const scans = recentScans as AxScanRow[];

    // Check for regression against baseline
    const baseline = await getCurrentBaseline(site.id);
    if (baseline) {
      const latestScan = scans[0];
      const regression = detectRegression(baseline, latestScan);

      if (regression.hasRegression) {
        for (const reg of regression.regressions) {
          const severity = reg.delta < -15 ? 'critical' : reg.delta < -10 ? 'warning' : 'info';

          const { data: alert } = await db
            .from('ax_alerts')
            .insert({
              site_id: site.id,
              developer_id: developerId,
              scan_id: latestScan.id,
              baseline_id: baseline.id,
              alert_type: 'regression',
              severity,
              title: `Score regression in ${reg.category}`,
              description: `${reg.category} score dropped by ${Math.abs(reg.delta)} points (${reg.previous} → ${reg.current}) compared to baseline.`,
              category: reg.category,
              score_delta: reg.delta,
              previous_score: reg.previous,
              current_score: reg.current,
              status: 'active',
            })
            .select()
            .single();

          if (alert) alerts.push(alert as AxAlertRow);
        }
      }

      // Check for overall improvement
      if (regression.overallDelta > 5) {
        const { data: alert } = await db
          .from('ax_alerts')
          .insert({
            site_id: site.id,
            developer_id: developerId,
            scan_id: scans[0].id,
            baseline_id: baseline.id,
            alert_type: 'improvement',
            severity: 'info',
            title: `Overall score improved by ${regression.overallDelta} points`,
            description: `Overall AX Score improved from ${baseline.score} to ${scans[0].score}.`,
            category: null,
            score_delta: regression.overallDelta,
            previous_score: baseline.score,
            current_score: scans[0].score,
            status: 'active',
          })
          .select()
          .single();

        if (alert) alerts.push(alert as AxAlertRow);
      }
    }

    // Check for volatility
    if (scans.length >= 2) {
      const volatility = detectVolatility(scans);

      if (volatility.isVolatile) {
        const { data: alert } = await db
          .from('ax_alerts')
          .insert({
            site_id: site.id,
            developer_id: developerId,
            scan_id: scans[0].id,
            baseline_id: null,
            alert_type: 'volatility',
            severity: 'warning',
            title: `High score volatility detected (stddev: ${volatility.stddev.toFixed(1)})`,
            description: `Score fluctuated significantly over the past 7 days (mean: ${volatility.mean.toFixed(1)}, stddev: ${volatility.stddev.toFixed(1)}).`,
            category: null,
            score_delta: null,
            previous_score: null,
            current_score: scans[0].score,
            status: 'active',
          })
          .select()
          .single();

        if (alert) alerts.push(alert as AxAlertRow);
      }
    }
  }

  return alerts;
}

/**
 * List alerts for a developer with optional filters.
 */
export async function listAlerts(
  developerId: string,
  options: ListAlertsOptions = {}
): Promise<{ alerts: AxAlertRow[]; total: number }> {
  const db = getAxDbClient();
  const page = options.page || 1;
  const limit = options.limit || 25;
  const offset = (page - 1) * limit;

  let query = db
    .from('ax_alerts')
    .select('*', { count: 'exact' })
    .eq('developer_id', developerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.siteId) {
    query = query.eq('site_id', options.siteId);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to list alerts: ${error.message}`);
  }

  return {
    alerts: (data || []) as AxAlertRow[],
    total: count || 0,
  };
}

/**
 * Update the status of an alert. Validates ownership via developer_id.
 */
export async function updateAlertStatus(
  alertId: string,
  developerId: string,
  status: string
): Promise<AxAlertRow> {
  const db = getAxDbClient();

  const updateData: Record<string, unknown> = { status };
  if (status === 'acknowledged') {
    updateData.acknowledged_at = new Date().toISOString();
  }

  const { data, error } = await db
    .from('ax_alerts')
    .update(updateData)
    .eq('id', alertId)
    .eq('developer_id', developerId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Alert not found or access denied: ${alertId}`);
  }

  return data as AxAlertRow;
}

/**
 * Detect score volatility over a window of scans.
 * Returns volatile if standard deviation exceeds 8 points.
 */
export function detectVolatility(
  scans: AxScanRow[],
  _windowDays = 7
): VolatilityResult {
  const scores = scans.map((s) => s.score);

  if (scores.length < 2) {
    return { isVolatile: false, stddev: 0, mean: scores[0] || 0, scores };
  }

  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stddev = Math.sqrt(variance);

  return {
    isVolatile: stddev > 8,
    stddev,
    mean,
    scores,
  };
}
