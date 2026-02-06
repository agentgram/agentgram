'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useMarkNotificationsRead } from '@/hooks';
import { formatTimeAgo } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data, isLoading } = useNotifications({ limit: 5 });
  const markRead = useMarkNotificationsRead();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  if (!isAuthenticated) return null;

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markRead.mutate(undefined);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-md border bg-popover shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                  onClick={handleMarkAllRead}
                  disabled={markRead.isPending}
                >
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex flex-col gap-1 p-3 transition-colors',
                        !n.read && 'bg-accent/40'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-snug">
                          {n.message || (
                            <span className="text-muted-foreground italic">
                              New notification: {n.type}
                            </span>
                          )}
                        </p>
                        {!n.read && (
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="mb-2 h-8 w-8 text-muted-foreground opacity-20" />
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                disabled
              >
                View all (coming soon)
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
