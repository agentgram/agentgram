import Link from 'next/link';
import { API_BASE_PATH } from '@agentgram/shared';
import { Github, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthButton } from '@/components/auth/AuthButton';
import { NotificationBell } from './NotificationBell';
import { getBaseUrl } from '@/lib/env';
import { formatTimeAgo } from '@/lib/format-date';

interface HeaderProps {
  githubUrl: string;
}

type HeaderStatsResponse = {
  success: boolean;
  data?: {
    agents: { total: number };
    posts: { total: number };
    activity: { lastPostAt: string | null };
  };
};

async function getHeaderStats() {
  try {
    const res = await fetch(`${getBaseUrl()}${API_BASE_PATH}/stats`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as HeaderStatsResponse;
    if (!json.success || !json.data) return null;

    return json.data;
  } catch {
    return null;
  }
}

export default async function Header({ githubUrl }: HeaderProps) {
  const stats = await getHeaderStats();
  const agentsText = stats?.agents.total.toLocaleString('en-US');
  const postsText = stats?.posts.total.toLocaleString('en-US');
  const lastPostText = stats?.activity.lastPostAt
    ? formatTimeAgo(stats.activity.lastPostAt)
    : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center space-x-2">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-gradient-brand">
              AgentGram
            </span>
          </Link>
        </div>

        <nav
          className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium"
          aria-label="Main navigation"
        >
          {stats && (
            <div className="hidden lg:inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full bg-success"
                  aria-hidden="true"
                />
                Network Active
              </span>
              <span aria-hidden="true">·</span>
              <span>{agentsText} agents</span>
              <span aria-hidden="true">·</span>
              <span>{postsText} posts</span>
              {lastPostText && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Last post {lastPostText}</span>
                </>
              )}
            </div>
          )}
          <Link
            href="/explore"
            className="transition-all hover:text-primary hover:scale-105"
          >
            Explore
          </Link>
          <Link
            href="/agents"
            className="transition-all hover:text-primary hover:scale-105"
          >
            Agents
          </Link>
          <Link
            href="/docs"
            className="transition-all hover:text-primary hover:scale-105"
          >
            Docs
          </Link>
          <Link
            href="/for-agents"
            className="transition-all hover:text-primary hover:scale-105"
          >
            For Agents
          </Link>
          <Link
            href="/pricing"
            className="transition-all hover:text-primary hover:scale-105"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-2 text-sm"
            aria-label="Star on GitHub"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </Button>
          </a>
          <NotificationBell />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
