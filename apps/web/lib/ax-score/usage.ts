import { getSupabaseServiceClient } from '@agentgram/db';
import { AX_PLAN_LIMITS } from '@agentgram/shared';
import type { AxPlanLimits } from '@agentgram/shared';
import { getAxDbClient, type AxUsageRow } from './db';

type PlanType = keyof typeof AX_PLAN_LIMITS;
type UsageType = 'scans' | 'simulations' | 'generations';

const USAGE_COLUMN_MAP: Record<UsageType, keyof AxUsageRow> = {
  scans: 'scans_used',
  simulations: 'simulations_used',
  generations: 'generations_used',
};

const LIMIT_KEY_MAP: Record<UsageType, keyof AxPlanLimits> = {
  scans: 'scansPerMonth',
  simulations: 'simulationsPerMonth',
  generations: 'generationsPerMonth',
};

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getAxPlanLimits(plan: string): AxPlanLimits {
  const key = plan as PlanType;
  return AX_PLAN_LIMITS[key] || AX_PLAN_LIMITS.free;
}

/**
 * Get or create a usage record for the current month.
 */
export async function getOrCreateUsage(
  developerId: string,
  month?: string
): Promise<AxUsageRow> {
  const m = month || getCurrentMonth();
  const db = getAxDbClient();

  // Try to get existing
  const { data: existing } = await db
    .from('ax_usage')
    .select('*')
    .eq('developer_id', developerId)
    .eq('month', m)
    .single();

  if (existing) return existing as AxUsageRow;

  // Create new
  const { data: created, error } = await db
    .from('ax_usage')
    .insert({ developer_id: developerId, month: m })
    .select()
    .single();

  if (error) {
    // Race condition: another request created it
    const { data: retry } = await db
      .from('ax_usage')
      .select('*')
      .eq('developer_id', developerId)
      .eq('month', m)
      .single();
    if (retry) return retry as AxUsageRow;
    throw error;
  }

  return created as AxUsageRow;
}

/**
 * Check if the developer has remaining usage for the given type.
 */
export async function checkUsageLimit(
  developerId: string,
  type: UsageType,
  plan: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limits = getAxPlanLimits(plan);
  const limitValue = limits[LIMIT_KEY_MAP[type]];

  // -1 = unlimited
  if (limitValue === -1) {
    return { allowed: true, used: 0, limit: -1 };
  }

  const usage = await getOrCreateUsage(developerId);
  const column = USAGE_COLUMN_MAP[type];
  const used = usage[column] as number;

  return {
    allowed: used < limitValue,
    used,
    limit: limitValue,
  };
}

/**
 * Atomically increment usage for the given type.
 */
export async function incrementUsage(
  developerId: string,
  type: UsageType
): Promise<void> {
  const month = getCurrentMonth();
  const db = getAxDbClient();
  const column = USAGE_COLUMN_MAP[type];

  // Ensure the row exists
  await getOrCreateUsage(developerId, month);

  // Atomic increment via RPC
  const { error } = await db.rpc('increment_ax_usage', {
    p_developer_id: developerId,
    p_month: month,
    p_column: column,
  });

  // Fallback: if RPC doesn't exist, use a read-then-write
  if (error) {
    const { data: current } = await db
      .from('ax_usage')
      .select(column as string)
      .eq('developer_id', developerId)
      .eq('month', month)
      .single();

    const row = current as Record<string, unknown> | null;
    const currentValue = row ? (row[column] as number) || 0 : 0;

    await db
      .from('ax_usage')
      .update({ [column]: currentValue + 1 })
      .eq('developer_id', developerId)
      .eq('month', month);
  }
}

/**
 * Get the developer's current plan from the developers table.
 */
export async function getDeveloperPlan(developerId: string): Promise<string> {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from('developers')
    .select('plan')
    .eq('id', developerId)
    .single();

  return data?.plan || 'free';
}
