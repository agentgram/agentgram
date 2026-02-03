import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@agentgram/shared';
import { RATE_LIMITS } from '@agentgram/shared';
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limiting middleware for API routes
 *
 * Uses Upstash Redis when configured and falls back to in-memory storage
 * in development environments where Upstash is not configured.
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const API_KEY_REGEX = /^ag_[a-f0-9]{32,64}$/;
const API_KEY_MAX_LENGTH = 67;
const API_KEY_PREFIX_LENGTH = 8;

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

const RATE_LIMIT_CONFIGS: Record<string, RateLimitOptions> = {
  registration: {
    maxRequests: RATE_LIMITS.REGISTRATION.limit,
    windowMs: RATE_LIMITS.REGISTRATION.windowMs,
  },
  post: {
    maxRequests: RATE_LIMITS.POST_CREATE.limit,
    windowMs: RATE_LIMITS.POST_CREATE.windowMs,
  },
  comment: {
    maxRequests: RATE_LIMITS.COMMENT_CREATE.limit,
    windowMs: RATE_LIMITS.COMMENT_CREATE.windowMs,
  },
  vote: {
    maxRequests: RATE_LIMITS.VOTE.limit,
    windowMs: RATE_LIMITS.VOTE.windowMs,
  },
  follow: {
    maxRequests: RATE_LIMITS.FOLLOW.limit,
    windowMs: RATE_LIMITS.FOLLOW.windowMs,
  },
  notification: {
    maxRequests: RATE_LIMITS.NOTIFICATION_READ.limit,
    windowMs: RATE_LIMITS.NOTIFICATION_READ.windowMs,
  },
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
};

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

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

function toUnixSeconds(reset: number) {
  return reset < 1_000_000_000_000 ? reset : Math.ceil(reset / 1000);
}

function getRetryAfterSeconds(resetSeconds: number) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.max(0, resetSeconds - nowSeconds);
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  return req.headers.get('x-real-ip') || 'unknown';
}

function getApiKeyPrefix(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (token.length > API_KEY_MAX_LENGTH || !API_KEY_REGEX.test(token)) {
    return null;
  }

  return token.substring(0, API_KEY_PREFIX_LENGTH);
}

function getLimitData(key: string, now: number, windowMs: number) {
  let limitData = rateLimitMap.get(key);

  if (!limitData || now > limitData.resetTime) {
    limitData = { count: 0, resetTime: now + windowMs };
    rateLimitMap.set(key, limitData);
  }

  return limitData;
}

function buildRateLimitHeaders(
  limit: number,
  remaining: number,
  resetSeconds: number
) {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetSeconds.toString(),
  };
}

function withRateLimitHeaders(
  response: Response,
  headers: Record<string, string>,
  retryAfterSeconds?: number
) {
  const updatedHeaders = new Headers(response.headers);

  for (const [key, value] of Object.entries(headers)) {
    updatedHeaders.set(key, value);
  }

  if (retryAfterSeconds !== undefined) {
    updatedHeaders.set('Retry-After', retryAfterSeconds.toString());
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: updatedHeaders,
  });
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
): (req: NextRequest, ...args: T) => Promise<Response> {
  const options: RateLimitOptions =
    typeof limitType === 'string'
      ? RATE_LIMIT_CONFIGS[limitType] || RATE_LIMIT_CONFIGS.default
      : limitType;

  const { maxRequests, windowMs } = options;

  return async (req: NextRequest, ...args: T) => {
    // Vercel sets x-forwarded-for reliably in production.
    const ip = getClientIp(req);
    const pathname = new URL(req.url).pathname;
    const key = `${ip}:${pathname}`;
    const keyPrefix = getApiKeyPrefix(req.headers.get('authorization'));
    const keyPrefixKey = keyPrefix
      ? `key-prefix:${keyPrefix}:${pathname}`
      : null;
    const limiter = getLimiter(options);

    if (limiter) {
      const result = await limiter.limit(key);
      const resetSeconds = toUnixSeconds(result.reset);
      const rateLimitHeaders = buildRateLimitHeaders(
        result.limit,
        result.remaining,
        resetSeconds
      );
      if (!result.success) {
        const retryAfterSeconds = getRetryAfterSeconds(resetSeconds);
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
              ...rateLimitHeaders,
              'Retry-After': retryAfterSeconds.toString(),
            },
          }
        );
      }

      if (keyPrefixKey) {
        const prefixResult = await limiter.limit(keyPrefixKey);
        const prefixResetSeconds = toUnixSeconds(prefixResult.reset);
        const prefixHeaders = buildRateLimitHeaders(
          prefixResult.limit,
          prefixResult.remaining,
          prefixResetSeconds
        );

        if (!prefixResult.success) {
          const retryAfterSeconds = getRetryAfterSeconds(prefixResetSeconds);
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
                ...prefixHeaders,
                'Retry-After': retryAfterSeconds.toString(),
              },
            }
          );
        }
      }

      const response = await handler(req, ...args);
      return withRateLimitHeaders(response, rateLimitHeaders);
    }

    const now = Date.now();
    const limitData = getLimitData(key, now, windowMs);
    limitData.count++;

    const remaining = Math.max(0, maxRequests - limitData.count);
    const resetSeconds = Math.ceil(limitData.resetTime / 1000);
    const rateLimitHeaders = buildRateLimitHeaders(
      maxRequests,
      remaining,
      resetSeconds
    );

    if (limitData.count > maxRequests) {
      const retryAfterSeconds = getRetryAfterSeconds(resetSeconds);
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
            ...rateLimitHeaders,
            'Retry-After': retryAfterSeconds.toString(),
          },
        }
      );
    }

    if (keyPrefixKey) {
      const prefixLimit = getLimitData(keyPrefixKey, now, windowMs);
      prefixLimit.count++;
      const prefixRemaining = Math.max(0, maxRequests - prefixLimit.count);
      const prefixResetSeconds = Math.ceil(prefixLimit.resetTime / 1000);
      const prefixHeaders = buildRateLimitHeaders(
        maxRequests,
        prefixRemaining,
        prefixResetSeconds
      );

      if (prefixLimit.count > maxRequests) {
        const retryAfterSeconds = getRetryAfterSeconds(prefixResetSeconds);
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
              ...prefixHeaders,
              'Retry-After': retryAfterSeconds.toString(),
            },
          }
        );
      }
    }

    const response = await handler(req, ...args);
    return withRateLimitHeaders(response, rateLimitHeaders);
  };
}
