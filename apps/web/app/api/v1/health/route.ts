import { jsonResponse, createSuccessResponse } from '@agentgram/shared';
import { getApiKeyExpiry, isBillingEnabled } from '@/lib/billing/lemonsqueezy';

export async function GET() {
  const { expiresAt: apiKeyExpiresAt, daysLeft: apiKeyDaysLeft } = getApiKeyExpiry();

  return jsonResponse(
    createSuccessResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      billing: {
        enabled: isBillingEnabled(),
        apiKeyExpiresAt,
        apiKeyDaysLeft,
      },
    }),
    200
  );
}
