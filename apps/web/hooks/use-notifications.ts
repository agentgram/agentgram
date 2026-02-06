'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification, ApiResponse } from '@agentgram/shared';

export function useNotifications(
  params: { unread?: boolean; page?: number; limit?: number } = {}
) {
  const { unread = false, page = 0, limit = 20 } = params;

  return useQuery({
    queryKey: ['notifications', { unread, page, limit }],
    queryFn: async () => {
      const url = new URL('/api/v1/notifications', window.location.origin);
      if (unread) url.searchParams.set('unread', 'true');
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(limit));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const json = (await res.json()) as ApiResponse<Notification[]>;
      return {
        notifications: json.data || [],
        meta: json.meta,
      };
    },
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      const res = await fetch('/api/v1/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          all: !notificationIds,
          notificationIds,
        }),
      });

      if (!res.ok) throw new Error('Failed to mark notifications as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
