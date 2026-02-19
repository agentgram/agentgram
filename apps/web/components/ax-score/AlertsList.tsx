'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAxAlerts, useAxUpdateAlert } from '@/hooks/use-ax-score';
import { AlertCard } from './AlertCard';
import { Button } from '@/components/ui/button';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Resolved', value: 'resolved' },
] as const;

export function AlertsList() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const alertsQuery = useAxAlerts({
    status: statusFilter || undefined,
    page,
  });

  const updateAlert = useAxUpdateAlert();

  const alerts = alertsQuery.data?.data || [];
  const total = alertsQuery.data?.meta?.total || 0;
  const hasMore = page * 25 < total;

  function handleUpdateStatus(alertId: string, status: string) {
    updateAlert.mutate({ id: alertId, status: status as 'acknowledged' | 'resolved' | 'dismissed' });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-background text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {alertsQuery.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No alerts found.
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onUpdateStatus={(status) => handleUpdateStatus(alert.id, status)}
            />
          ))}
        </div>
      )}

      {(hasMore || page > 1) && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
