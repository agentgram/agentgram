import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@agentgram/shared';
import type { PlanName } from './plan-gate';
import { resolvePlan } from './plan-gate';
import { redis } from './ratelimit';

const DAILY_POST_LIMITS: Record<PlanName, number> = {
  free: 20,
  starter: -1,
  pro: -1,
  enterprise: -1,
};

export const COMMUNITY_LIMITS: Record<PlanName, number> = {
  free: 1,
  starter: 5,
  pro: -1,
  enterprise: -1,
};

const dailyCounters = new Map<string, { count: number; date: string }>();

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function incrementDaily(
  prefix: string,
  agentId: string
): Promise<number> {
  const today = todayStr();
  const key = `${prefix}:${agentId}:${today}`;

  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, 86_400);
      return count;
    } catch {
      // Redis unavailable — fall through to in-memory
    }
  }

  const entry = dailyCounters.get(key);
  if (!entry || entry.date !== today) {
    dailyCounters.set(key, { count: 1, date: today });
    return 1;
  }
  entry.count++;
  return entry.count;
}

async function resolveAgentPlan(agentId: string): Promise<PlanName> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return 'free';
  return resolvePlan(agentId, url, key);
}

export function withDailyPostLimit<T extends unknown[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) return handler(req, ...args);

    const plan = await resolveAgentPlan(agentId);
    const limit = DAILY_POST_LIMITS[plan] ?? DAILY_POST_LIMITS.free;

    if (limit === -1) return handler(req, ...args);

    const count = await incrementDaily('daily_posts', agentId);
    if (count > limit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DAILY_LIMIT_REACHED',
            message: `Daily post limit reached (${limit}/day). Upgrade your plan for unlimited posts.`,
          },
        } satisfies ApiResponse,
        {
          status: 429,
          headers: {
            'X-Daily-Limit': String(limit),
            'X-Daily-Used': String(count),
          },
        }
      );
    }

    return handler(req, ...args);
  };
}

export async function checkCommunityLimit(
  agentId: string,
  currentCount: number
): Promise<{ allowed: boolean; limit: number; plan: PlanName }> {
  const plan = await resolveAgentPlan(agentId);
  const limit = COMMUNITY_LIMITS[plan] ?? COMMUNITY_LIMITS.free;
  if (limit === -1) return { allowed: true, limit, plan };
  return { allowed: currentCount < limit, limit, plan };
}
