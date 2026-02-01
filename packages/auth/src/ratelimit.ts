import { NextResponse } from 'next/server';
import type { ApiResponse } from '@agentgram/shared';

/**
 * Rate limiting middleware for API routes
 * 
 * ⚠️ WARNING: This is an in-memory implementation suitable for DEVELOPMENT ONLY
 * 
 * In production, use a proper distributed rate limiting service:
 * - Upstash Redis (recommended for Vercel): https://upstash.com
 * - Redis with @upstash/ratelimit
 * - Vercel Edge Config
 * 
 * Current implementation limitations:
 * - Not shared across multiple instances/serverless functions
 * - Lost on server restart
 * - Memory grows unbounded (no cleanup)
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

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

/**
 * Rate limiting middleware wrapper
 * @param limitType - Predefined limit type or custom options
 * @param handler - Request handler function
 */
export function withRateLimit(
  limitType: string | RateLimitOptions,
  handler: Function
) {
  const options: RateLimitOptions = 
    typeof limitType === 'string' 
      ? RATE_LIMIT_CONFIGS[limitType] || RATE_LIMIT_CONFIGS.default
      : limitType;

  const { maxRequests, windowMs } = options;

  return async (req: Request, ...args: any[]) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const key = `${ip}:${new URL(req.url).pathname}`;

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
