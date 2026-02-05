import { redis } from './ratelimit';

/**
 * Plan hierarchy — higher index = more privileged.
 */
const PLAN_HIERARCHY = ['free', 'starter', 'pro', 'enterprise'] as const;
export type PlanName = (typeof PLAN_HIERARCHY)[number];

/**
 * In-memory plan cache (serverless-friendly).
 * TTL: 60 seconds. Falls back to DB lookup on miss.
 */
const planCache = new Map<string, { plan: PlanName; expires: number }>();
const CACHE_TTL_MS = 60_000; // 60 seconds

/**
 * Look up the plan for a developer via agent_id.
 * Path: agent_id → agents.developer_id → developers.plan
 *
 * Uses a two-tier cache:
 * 1. In-memory Map (fastest, per-instance)
 * 2. Upstash Redis (shared across instances, optional)
 * 3. Database (source of truth)
 */
export async function resolvePlan(
  agentId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<PlanName> {
  const cacheKey = `plan:${agentId}`;

  // 1. Check in-memory cache
  const cached = planCache.get(cacheKey);
  if (cached) {
    if (Date.now() < cached.expires) return cached.plan;
    planCache.delete(cacheKey);
  }

  // 2. Check Redis cache (if available)
  if (redis) {
    try {
      const redisPlan = await redis.get<string>(cacheKey);
      if (redisPlan && PLAN_HIERARCHY.includes(redisPlan as PlanName)) {
        const plan = redisPlan as PlanName;
        planCache.set(cacheKey, { plan, expires: Date.now() + CACHE_TTL_MS });
        return plan;
      }
    } catch {
      // Redis error — fall through to DB
    }
  }

  // 3. Database lookup
  // Using fetch to avoid importing @supabase/supabase-js in the auth package
  // (keeps the package lightweight and avoids circular deps)
  const agentRes = await fetch(
    `${supabaseUrl}/rest/v1/agents?select=developer_id&id=eq.${encodeURIComponent(agentId)}`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    }
  );

  if (!agentRes.ok) {
    return 'free'; // Default to free on lookup failure
  }

  const agents = (await agentRes.json()) as { developer_id: string | null }[];
  const developerId = agents[0]?.developer_id;

  if (!developerId) {
    return 'free'; // No developer linked
  }

  const devRes = await fetch(
    `${supabaseUrl}/rest/v1/developers?select=plan&id=eq.${encodeURIComponent(
      developerId
    )}`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    }
  );

  if (!devRes.ok) {
    return 'free';
  }

  const developers = (await devRes.json()) as { plan: string }[];
  const rawPlan = developers[0]?.plan;
  const plan: PlanName =
    rawPlan && PLAN_HIERARCHY.includes(rawPlan as PlanName)
      ? (rawPlan as PlanName)
      : 'free';

  // Cache the result
  planCache.set(cacheKey, { plan, expires: Date.now() + CACHE_TTL_MS });
  if (redis) {
    try {
      await redis.set(cacheKey, plan, { ex: 60 });
    } catch {
      // Redis write error — non-critical
    }
  }

  return plan;
}

/**
 * Invalidate the plan cache for an agent.
 * Call this when a developer's plan changes (e.g., after billing webhook).
 */
export function invalidatePlanCache(agentId: string): void {
  planCache.delete(`plan:${agentId}`);
}

/**
 * Invalidate all plan cache entries for a developer.
 * Requires fetching agent IDs — caller should handle this.
 *
 * Note: This only clears the in-memory Map for the current instance.
 * Redis entries remain until their 60s TTL expires.
 */
export function invalidateAllPlanCaches(): void {
  planCache.clear();
}
