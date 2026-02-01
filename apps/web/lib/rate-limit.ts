import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface RateLimitConfig {
  free: number;
  pro: number;
  enterprise: number | null; // null = unlimited
}

export const DAILY_RATE_LIMITS: RateLimitConfig = {
  free: 100,
  pro: 10000,
  enterprise: null, // unlimited
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Check rate limit for an agent on a specific endpoint
 */
export async function checkRateLimit(
  agentId: string,
  endpoint: string = 'global'
): Promise<RateLimitResult> {
  try {
    // Get agent's subscription plan
    const { data: subscription } = await supabase
      .from('billing_subscriptions')
      .select('plan, status')
      .eq('agent_id', agentId)
      .single();

    const plan = subscription?.plan || 'free';
    const limit = DAILY_RATE_LIMITS[plan as keyof RateLimitConfig];

    // Enterprise has unlimited requests
    if (limit === null) {
      return {
        allowed: true,
        limit: -1,
        remaining: -1,
        resetAt: getNextResetDate(),
      };
    }

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('api_usage')
      .select('request_count')
      .eq('agent_id', agentId)
      .eq('endpoint', endpoint)
      .eq('date', today)
      .single();

    const currentCount = usage?.request_count || 0;
    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount < limit;

    // Increment usage if allowed
    if (allowed) {
      await supabase
        .from('api_usage')
        .upsert({
          agent_id: agentId,
          endpoint,
          date: today,
          request_count: currentCount + 1,
        });
    }

    return {
      allowed,
      limit,
      remaining: allowed ? remaining - 1 : remaining,
      resetAt: getNextResetDate(),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request on error
    return {
      allowed: true,
      limit: 0,
      remaining: 0,
      resetAt: getNextResetDate(),
    };
  }
}

/**
 * Get the next rate limit reset time (midnight UTC)
 */
function getNextResetDate(): Date {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Get current usage for an agent
 */
export async function getUsageStats(agentId: string): Promise<{
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: Date;
}> {
  try {
    const { data: subscription } = await supabase
      .from('billing_subscriptions')
      .select('plan')
      .eq('agent_id', agentId)
      .single();

    const plan = subscription?.plan || 'free';
    const limit = DAILY_RATE_LIMITS[plan as keyof RateLimitConfig];

    if (limit === null) {
      return {
        plan,
        limit: -1,
        used: 0,
        remaining: -1,
        resetAt: getNextResetDate(),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('api_usage')
      .select('request_count')
      .eq('agent_id', agentId)
      .eq('endpoint', 'global')
      .eq('date', today)
      .single();

    const used = usage?.request_count || 0;

    return {
      plan,
      limit,
      used,
      remaining: Math.max(0, limit - used),
      resetAt: getNextResetDate(),
    };
  } catch (error) {
    console.error('Get usage stats error:', error);
    return {
      plan: 'free',
      limit: 100,
      used: 0,
      remaining: 100,
      resetAt: getNextResetDate(),
    };
  }
}
