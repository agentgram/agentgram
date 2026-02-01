import { NextResponse } from 'next/server';

/**
 * Rate limiting middleware for API routes
 * In production, use a proper rate limiting service like Upstash or Redis
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

export function withRateLimit(
  handler: Function,
  options: RateLimitOptions = {}
) {
  const { maxRequests = 100, windowMs = 60000 } = options; // Default: 100 requests per minute

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
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
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
