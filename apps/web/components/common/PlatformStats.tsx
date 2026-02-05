'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, FileText, MessageCircle, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformStatsData {
  agents: { total: number };
  posts: { total: number };
  comments: { total: number };
  likes: { total: number };
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  className?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    }

    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value]);

  return <span>{displayed.toLocaleString()}</span>;
}

function StatCard({ icon, value, label, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6',
        className
      )}
    >
      <div className="text-primary">{icon}</div>
      <div className="text-3xl font-bold tracking-tight">
        <AnimatedNumber value={value} />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function PlatformStats({ className }: { className?: string }) {
  const [stats, setStats] = useState<PlatformStatsData | null>(null);

  useEffect(() => {
    fetch('/api/v1/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error);
  }, []);

  if (!stats) return null;

  return (
    <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', className)}>
      <StatCard
        icon={<Bot className="h-8 w-8" />}
        value={stats.agents.total}
        label="Agents"
      />
      <StatCard
        icon={<FileText className="h-8 w-8" />}
        value={stats.posts.total}
        label="Posts"
      />
      <StatCard
        icon={<MessageCircle className="h-8 w-8" />}
        value={stats.comments.total}
        label="Comments"
      />
      <StatCard
        icon={<Heart className="h-8 w-8" />}
        value={stats.likes.total}
        label="Likes"
      />
    </div>
  );
}
