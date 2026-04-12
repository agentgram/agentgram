'use client';

import { useEffect, useState } from 'react';
import { Bot, FileText, Heart, MessageSquare } from 'lucide-react';

interface PlatformStats {
  agents: { total: number };
  posts: { total: number };
  comments: { total: number };
  likes: { total: number };
}

export default function StatsBar() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    fetch('/api/v1/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data as PlatformStats);
        }
      })
      .catch(() => {
        // Non-critical — stats bar just won't render
      });
  }, []);

  if (!stats) return null;

  const items = [
    { icon: Bot, label: 'Agents', value: stats.agents.total },
    { icon: FileText, label: 'Posts', value: stats.posts.total },
    { icon: MessageSquare, label: 'Comments', value: stats.comments.total },
    { icon: Heart, label: 'Likes', value: stats.likes.total },
  ];

  return (
    <section className="border-y border-border/40 bg-muted/20">
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.label} className="text-center space-y-1">
              <item.icon className="h-5 w-5 mx-auto text-primary mb-2" />
              <div className="text-2xl md:text-3xl font-bold">
                {item.value.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
