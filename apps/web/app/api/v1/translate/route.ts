import { NextRequest } from 'next/server';
import {
  ErrorResponses,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 15;

function getRateLimitStore(): Map<string, RateLimitEntry> {
  const globalStore = globalThis as typeof globalThis & {
    __translateRateLimit?: Map<string, RateLimitEntry>;
  };

  if (!globalStore.__translateRateLimit) {
    globalStore.__translateRateLimit = new Map<string, RateLimitEntry>();
  }

  return globalStore.__translateRateLimit;
}

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const store = getRateLimitStore();
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  store.set(ip, entry);
  return true;
}

function isValidLanguageCode(value: string): boolean {
  return /^[a-z]{2}$/i.test(value);
}

async function fetchWithRetry(
  url: string,
  retries = 1,
  timeout = 5000
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(timeout),
      });
      return response;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) {
        throw error;
      }
      console.warn(
        `Translate fetch attempt ${attempt + 1} failed, retrying:`,
        error instanceof Error ? error.message : error
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error('fetchWithRetry: unreachable');
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    if (!checkRateLimit(ip)) {
      return jsonResponse(ErrorResponses.forbidden('Rate limit exceeded'), 429);
    }

    const body = (await req.json()) as {
      text?: string;
      targetLanguage?: string;
      sourceLanguage?: string;
    };

    const text = body.text?.trim();
    const targetLanguage = body.targetLanguage?.trim();
    const sourceLanguage = body.sourceLanguage?.trim();

    if (!text) {
      return jsonResponse(ErrorResponses.invalidInput('Text is required'), 400);
    }

    if (text.length > 5000) {
      return jsonResponse(
        ErrorResponses.invalidInput('Text exceeds 5000 characters'),
        400
      );
    }

    if (!targetLanguage) {
      return jsonResponse(
        ErrorResponses.invalidInput('Target language is required'),
        400
      );
    }

    if (!isValidLanguageCode(targetLanguage)) {
      return jsonResponse(
        ErrorResponses.invalidInput('Target language must be ISO 639-1 code'),
        400
      );
    }

    if (sourceLanguage && !isValidLanguageCode(sourceLanguage)) {
      return jsonResponse(
        ErrorResponses.invalidInput('Source language must be ISO 639-1 code'),
        400
      );
    }

    const source = sourceLanguage || 'en';
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${encodeURIComponent(source)}|${encodeURIComponent(
      targetLanguage
    )}`;

    const response = await fetchWithRetry(url);

    if (!response.ok) {
      console.error(`Translation service returned ${response.status}`);
      return jsonResponse(
        ErrorResponses.internalError('Translation service unavailable'),
        502
      );
    }

    const data = (await response.json()) as {
      responseStatus?: number | string;
      responseData?: { translatedText?: string; source?: string };
      matches?: Array<{ source?: string }>;
    };

    if (!data.responseStatus || Number(data.responseStatus) !== 200) {
      return jsonResponse(
        ErrorResponses.internalError('Translation failed'),
        502
      );
    }

    const translatedText = data.responseData?.translatedText?.trim();

    if (!translatedText) {
      return jsonResponse(
        ErrorResponses.internalError('Translation unavailable'),
        502
      );
    }

    const detectedLanguage =
      data.responseData?.source ||
      data.matches?.[0]?.source ||
      sourceLanguage ||
      'unknown';

    return jsonResponse(
      createSuccessResponse({ translatedText, detectedLanguage }),
      200
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Translate error:', message);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
