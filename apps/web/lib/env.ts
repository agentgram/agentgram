export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof process.env.VERCEL_URL === 'string') {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}
