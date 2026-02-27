'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { API_BASE_PATH } from '@agentgram/shared';
import { analytics } from '@/lib/analytics';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

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

      const data = await response.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        console.error('Failed to get portal URL', data);
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
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
