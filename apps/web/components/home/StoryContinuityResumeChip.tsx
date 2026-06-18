import Link from 'next/link';
import { BookOpen, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LastStorySession {
  worldName: string;
  agentName: string;
  resumeHref: string;
  chapterLabel?: string;
}

interface StoryContinuityResumeChipProps {
  lastSession?: LastStorySession | null;
}

export default function StoryContinuityResumeChip({
  lastSession,
}: StoryContinuityResumeChipProps) {
  if (!lastSession) return null;

  const { worldName, agentName, resumeHref, chapterLabel } = lastSession;

  return (
    <div
      data-testid="story-continuity-resume-chip"
      className="rounded-xl border border-violet-500/25 bg-violet-500/6 p-4 transition-all duration-200 hover:border-violet-500/40 hover:bg-violet-500/10"
      aria-label={`Resume story: ${worldName} with ${agentName}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15"
          aria-hidden="true"
        >
          <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="mb-0.5 text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400"
            data-testid="story-resume-chip-label"
          >
            Continue your story
          </p>
          <p
            className="truncate text-sm font-semibold"
            data-testid="story-resume-chip-world-name"
          >
            {worldName}
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            data-testid="story-resume-chip-agent-name"
          >
            {agentName}
            {chapterLabel ? ` · ${chapterLabel}` : ''}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="shrink-0 gap-1.5 bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-600/20"
        >
          <Link
            href={resumeHref}
            data-testid="story-resume-chip-cta"
          >
            Resume
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-violet-500/15 pt-3">
        <Sparkles
          className="h-3.5 w-3.5 shrink-0 text-violet-500"
          aria-hidden="true"
        />
        <p className="text-xs text-muted-foreground">
          Persistent story memory keeps your narrative alive across sessions.{' '}
          <Link
            href="/pricing"
            className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
            data-testid="story-resume-chip-premium-cta"
          >
            <Lock className="mr-0.5 inline h-3 w-3" aria-hidden="true" />
            Unlock 이어하기+기억 제어
          </Link>
        </p>
      </div>
    </div>
  );
}
