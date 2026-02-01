/**
 * Environment variable validation
 * Ensures required environment variables are present at build/runtime
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

const optionalEnvVars = [
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_ENTERPRISE_PRICE_ID',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  'NEXT_PUBLIC_SALES_EMAIL',
  'NEXT_PUBLIC_DISCORD_INVITE',
  'NEXT_PUBLIC_GITHUB_URL',
] as const;

/**
 * Validate that all required environment variables are present
 * Throws an error if any required variables are missing
 */
export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\nCheck your .env.local file and compare with .env.example`
    );
  }

  // Warn about missing optional variables (only in development)
  if (process.env.NODE_ENV === 'development') {
    const missingOptional: string[] = [];
    
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        missingOptional.push(envVar);
      }
    }

    if (missingOptional.length > 0) {
      console.warn(
        `⚠️  Optional environment variables not set:\n${missingOptional.map((v) => `  - ${v}`).join('\n')}`
      );
    }
  }
}

/**
 * Get an environment variable with type safety
 * Throws if the variable is not set
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get an optional environment variable
 * Returns undefined if not set
 */
export function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

// Validate on import (only in Node.js environment)
if (typeof window === 'undefined') {
  validateEnv();
}
