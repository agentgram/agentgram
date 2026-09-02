'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { API_BASE_PATH } from '@agentgram/shared';
import { analytics } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

type BillingErrorResponse = {
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

function getBillingErrorDescription(
  data: BillingErrorResponse | null,
  fallback: string
) {
  const code = typeof data?.error?.code === 'string' ? data.error.code : null;
  const message =
    typeof data?.error?.message === 'string' ? data.error.message : null;

  if (code && message) {
    return `${code}: ${message}`;
  }

  return message ?? fallback;
}

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    analytics.manageSubscription();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_PATH}/billing/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      let data: BillingErrorResponse & {
        success?: boolean;
        data?: { url?: string };
      };
      try {
        data = await response.json();
      } catch (error) {
        console.error('Failed to parse billing portal response:', error);
        toast({
          variant: 'destructive',
          title: 'Billing portal unavailable',
          description: 'Unable to read billing response. Please try again.',
        });
        return;
      }

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        console.error('Failed to get portal URL', data);
        toast({
          variant: 'destructive',
          title: 'Billing portal unavailable',
          description: getBillingErrorDescription(
            data,
            'Unable to open billing portal. Please try again.'
          ),
        });
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast({
        variant: 'destructive',
        title: 'Billing portal unavailable',
        description: 'Unable to open billing portal. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleManageSubscription} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {loading ? 'Redirecting...' : 'Manage Subscription'}
    </Button>
  );
}
