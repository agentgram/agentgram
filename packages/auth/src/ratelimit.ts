import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@agentgram/shared';
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limiting middleware for API routes
 *
 * Uses Upstash Redis when configured and falls back to in-memory storage
 * in development environments where Upstash is not configured.
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of Array.from(rateLimitMap.entries())) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

// Predefined rate limit configurations
const RATE_LIMIT_CONFIGS: Record<string, RateLimitOptions> = {
  registration: {
    maxRequests: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  post: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  comment: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  vote: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
};

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  upstashUrl && upstashToken
    ? new Redis({
        url: upstashUrl,
        token: upstashToken,
      })
    : null;

const upstashLimiters = new Map<string, Ratelimit>();
type SlidingWindowFactory = (
  tokens: Duration,
  window: Duration
) => ReturnType<typeof Ratelimit.slidingWindow>;
const createSlidingWindow: SlidingWindowFactory = (tokens, window) =>
  (
    Ratelimit as unknown as { slidingWindow: SlidingWindowFactory }
  ).slidingWindow(tokens, window);

function getLimiter(options: RateLimitOptions) {
  if (!redis) {
    return null;
  }

  const key = `${options.maxRequests}:${options.windowMs}`;
  const existing = upstashLimiters.get(key);
  if (existing) {
    return existing;
  }

  const window = toDuration(options.windowMs);
  const limiter = new Ratelimit({
    redis,
    limiter: createSlidingWindow(
      options.maxRequests as unknown as Duration,
      window
    ),
    analytics: true,
  });

  upstashLimiters.set(key, limiter);
  return limiter;
}

function toResetHeader(reset: number) {
  const resetMs = reset < 1_000_000_000_000 ? reset * 1000 : reset;
  return new Date(resetMs).toISOString();
}

function toDuration(windowMs: number): Duration {
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;
  const secondMs = 1000;

  if (windowMs % dayMs === 0) {
    return `${windowMs / dayMs} d` as Duration;
  }

  if (windowMs % hourMs === 0) {
    return `${windowMs / hourMs} h` as Duration;
  }

  if (windowMs % minuteMs === 0) {
    return `${windowMs / minuteMs} m` as Duration;
  }

  return `${Math.ceil(windowMs / secondMs)} s` as Duration;
}

/**
 * Rate limiting middleware wrapper
 * @param limitType - Predefined limit type or custom options
 * @param handler - Request handler function
 */
export function withRateLimit<T extends unknown[]>(
  limitType: string | RateLimitOptions,
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  const options: RateLimitOptions =
    typeof limitType === 'string'
      ? RATE_LIMIT_CONFIGS[limitType] || RATE_LIMIT_CONFIGS.default
      : limitType;

  const { maxRequests, windowMs } = options;

  return async (req: NextRequest, ...args: T) => {
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const key = `${ip}:${new URL(req.url).pathname}`;
    const limiter = getLimiter(options);

    if (limiter) {
      const result = await limiter.limit(key);
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded. Please try again later.',
            },
          } satisfies ApiResponse,
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': toResetHeader(result.reset),
            },
          }
        );
      }

      return handler(req, ...args);
    }

    const now = Date.now();
    let limitData = rateLimitMap.get(key);

    if (!limitData || now > limitData.resetTime) {
      limitData = { count: 0, resetTime: now + windowMs };
      rateLimitMap.set(key, limitData);
    }

    limitData.count++;

    if (limitData.count > maxRequests) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded. Please try again later.',
          },
        } satisfies ApiResponse,
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limitData.resetTime).toISOString(),
          },
        }
      );
    }

    return handler(req, ...args);
  };
}
