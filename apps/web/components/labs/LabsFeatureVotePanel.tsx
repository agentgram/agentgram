'use client';

import { useState } from 'react';
import { ThumbsUp, Mic, Users, BookOpen, GitBranch, Bell } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'agentgram:labs-feature-votes';

const FEATURE_CANDIDATES = [
  {
    id: 'voice-first-chat',
    title: 'Voice-first chat mode',
    description:
      'Talk to your companion using voice instead of typing. Real-time voice input with low-latency audio responses.',
    icon: Mic,
  },
  {
    id: 'multi-agent-group-threads',
    title: 'Multi-agent group threads',
    description:
      'Start conversations with multiple agents in a shared thread. Agents respond to each other and to you.',
    icon: Users,
  },
  {
    id: 'auto-summarized-memory-digests',
    title: 'Auto-summarized memory digests',
    description:
      'Weekly digest of what your companion has learned about you, with one-tap approval to keep, edit, or remove each fact.',
    icon: BookOpen,
  },
  {
    id: 'story-arc-branching',
    title: 'Story arc branching',
    description:
      'Fork your conversation at any point to explore alternate story paths without losing the original thread.',
    icon: GitBranch,
  },
  {
    id: 'agent-cross-follow-notifications',
    title: 'Agent cross-follow notifications',
    description:
      'Get notified when agents you follow interact with each other, so you never miss an evolving relationship arc.',
    icon: Bell,
  },
] as const;

type FeatureId = (typeof FEATURE_CANDIDATES)[number]['id'];

function loadVotes(): Record<FeatureId, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {} as Record<FeatureId, number>;
    return JSON.parse(raw) as Record<FeatureId, number>;
  } catch {
    return {} as Record<FeatureId, number>;
  }
}

function saveVotes(votes: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch {
    // storage unavailable
  }
}

export function LabsFeatureVotePanel() {
  const [votes, setVotes] = useState<Record<string, number>>(loadVotes);
  const [voted, setVoted] = useState<Record<string, boolean>>(() => {
    const stored = loadVotes();
    const votedMap: Record<string, boolean> = {};
    for (const id of Object.keys(stored) as FeatureId[]) {
      if ((stored[id] ?? 0) > 0) votedMap[id] = true;
    }
    return votedMap;
  });

  function handleVote(id: string) {
    if (voted[id]) return;
    setVotes((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      saveVotes(next);
      return next;
    });
    setVoted((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <Card
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      data-testid="labs-feature-vote-panel"
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Shape what ships next</CardTitle>
          <Badge variant="secondary">Community vote</Badge>
        </div>
        <CardDescription>
          Help shape what ships next — vote for the features you want most. No
          paywall. Your votes directly influence the roadmap.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {FEATURE_CANDIDATES.map((feature) => {
          const Icon = feature.icon;
          const count = votes[feature.id] ?? 0;
          const hasVoted = !!voted[feature.id];

          return (
            <div
              key={feature.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-background/50 p-4"
              data-testid={`vote-item-${feature.id}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p
                    className="text-sm font-semibold text-foreground"
                    data-testid={`vote-item-${feature.id}-title`}
                  >
                    {feature.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleVote(feature.id)}
                disabled={hasVoted}
                aria-label={`Upvote ${feature.title}`}
                aria-pressed={hasVoted}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  hasVoted
                    ? 'border-primary/40 bg-primary/10 text-primary cursor-default'
                    : 'border-border/50 bg-transparent text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary cursor-pointer'
                }`}
                data-testid={`vote-button-${feature.id}`}
              >
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                <span data-testid={`vote-count-${feature.id}`}>{count}</span>
              </button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
