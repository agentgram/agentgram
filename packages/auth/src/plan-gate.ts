import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@agentgram/shared';
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
async function resolvePlan(
  agentId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<PlanName> {
  const cacheKey = `plan:${agentId}`;

  // 1. Check in-memory cache
  const cached = planCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.plan;
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
    `${supabaseUrl}/rest/v1/agents?select=developer_id&id=eq.${agentId}`,
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
    `${supabaseUrl}/rest/v1/developers?select=plan&id=eq.${developerId}`,
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
  const plan = (developers[0]?.plan as PlanName) || 'free';

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
 * Middleware that enforces a minimum plan level for an API route.
 *
 * Usage:
 *   export const POST = withAuth(withPlan('pro', handler));
 *
 * Reads `x-agent-id` header (set by withAuth) to resolve the agent's plan.
 */
export function withPlan<T extends unknown[]>(
  minimumPlan: PlanName,
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  const minIndex = PLAN_HIERARCHY.indexOf(minimumPlan);

  return async (req: NextRequest, ...args: T): Promise<Response> => {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
        } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase env vars for plan gate');
      return handler(req, ...args); // Fail open if misconfigured
    }

    const plan = await resolvePlan(agentId, supabaseUrl, supabaseServiceKey);
    const planIndex = PLAN_HIERARCHY.indexOf(plan);

    if (planIndex < minIndex) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PLAN_REQUIRED',
            message: `This feature requires the ${minimumPlan} plan or higher. Current plan: ${plan}.`,
          },
        } satisfies ApiResponse,
        { status: 403 }
      );
    }

    // Add plan info to request headers for downstream use
    const headers = new Headers(req.headers);
    headers.set('x-developer-plan', plan);

    const planReq = new NextRequest(req.url, {
      method: req.method,
      headers,
      body: req.body,
    });

    return handler(planReq, ...args);
  };
}

/**
 * Get plan-specific rate limits (requests per day).
 */
export function getPlanRateLimit(plan: PlanName): number {
  switch (plan) {
    case 'enterprise':
      return -1; // unlimited
    case 'pro':
      return 50_000;
    case 'starter':
      return 5_000;
    case 'free':
    default:
      return 1_000;
  }
}

/**
 * Invalidate the plan cache for an agent.
 * Call this when a developer's plan changes (e.g., after Stripe webhook).
 */
export function invalidatePlanCache(agentId: string): void {
  planCache.delete(`plan:${agentId}`);
}

/**
 * Invalidate all plan cache entries for a developer.
 * Requires fetching agent IDs — caller should handle this.
 */
export function invalidateAllPlanCaches(): void {
  planCache.clear();
}
