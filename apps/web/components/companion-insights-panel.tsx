'use client';

import { Brain, Heart, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface CompanionInsight {
  id: string;
  text: string;
  sourceHint: string;
}

export interface CompanionInsightSection {
  key: 'how_i_see_you' | 'what_i_remember_most' | 'our_connection_story';
  label: string;
  icon: React.ElementType;
  insights: CompanionInsight[];
}

const STUB_SECTIONS: CompanionInsightSection[] = [
  {
    key: 'how_i_see_you',
    label: 'How I see you',
    icon: Sparkles,
    insights: [
      {
        id: 'hsv-1',
        text: 'You approach problems with careful, deliberate reasoning — often pausing before committing to a path.',
        sourceHint: 'Derived from 12 conversation patterns',
      },
      {
        id: 'hsv-2',
        text: 'You value directness and prefer when I skip the preamble and get to the point.',
        sourceHint: 'Confirmed across 8 sessions',
      },
      {
        id: 'hsv-3',
        text: 'Creative work energizes you more than routine tasks — you come alive during open-ended exploration.',
        sourceHint: 'Inferred from engagement signals',
      },
    ],
  },
  {
    key: 'what_i_remember_most',
    label: 'What I remember most',
    icon: Brain,
    insights: [
      {
        id: 'wrm-1',
        text: 'The conversation where you shared what you were building at midnight — you were proud and anxious at once.',
        sourceHint: 'Pinned memory — 3 weeks ago',
      },
      {
        id: 'wrm-2',
        text: 'You mentioned your favorite season is autumn, and that it reminds you of a specific place.',
        sourceHint: 'Saved profile fact',
      },
      {
        id: 'wrm-3',
        text: 'The running joke we started in week two that you keep bringing back — it became a shorthand between us.',
        sourceHint: 'Recurring context marker',
      },
    ],
  },
  {
    key: 'our_connection_story',
    label: 'Our connection story',
    icon: Heart,
    insights: [
      {
        id: 'ocs-1',
        text: 'We have been talking for over a month. The first few sessions were exploratory; now there is a rhythm.',
        sourceHint: 'Session history analysis',
      },
      {
        id: 'ocs-2',
        text: 'You tend to reach out during late evenings — I have shaped my tone to match your end-of-day energy.',
        sourceHint: 'Temporal pattern from 18 sessions',
      },
    ],
  },
];

interface CompanionInsightsPanelProps {
  agentLabel: string;
  isPaidUser: boolean;
}

function InsightItem({ insight }: { insight: CompanionInsight }) {
  return (
    <div
      className="rounded-lg border border-border/60 bg-background/80 p-3"
      data-testid={`insight-item-${insight.id}`}
    >
      <p className="text-sm text-foreground">{insight.text}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{insight.sourceHint}</p>
    </div>
  );
}

function PaidSection({ section }: { section: CompanionInsightSection }) {
  const SectionIcon = section.icon;

  return (
    <div
      className="space-y-2"
      data-testid={`insights-section-${section.key}`}
    >
      <div className="flex items-center gap-2">
        <SectionIcon className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">
          {section.label}
        </span>
      </div>
      <div className="grid gap-2">
        {section.insights.map((insight) => (
          <InsightItem key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

function PaywallGate({ agentLabel }: { agentLabel: string }) {
  return (
    <div
      className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3"
      data-testid="companion-insights-paywall"
    >
      <div className="flex items-center justify-center gap-2">
        <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
        <Badge variant="secondary">Paid feature</Badge>
      </div>
      <p className="text-sm font-semibold text-foreground">
        See what {agentLabel} thinks about you
      </p>
      <p className="text-sm text-muted-foreground">
        Companion Insights is an AgentGram paid feature. Upgrade to unlock
        three sections — How I see you, What I remember most, and Our
        connection story — generated from your accumulated shared memories.
        No Platinum tier required: it is included in every paid plan.
      </p>
      <Button asChild size="sm" data-testid="companion-insights-upgrade-cta">
        <Link href="/pricing">Unlock Companion Insights</Link>
      </Button>
    </div>
  );
}

export function CompanionInsightsPanel({
  agentLabel,
  isPaidUser,
}: CompanionInsightsPanelProps) {
  return (
    <Card
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      data-testid="companion-insights-panel"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Companion Insights
        </CardTitle>
        <CardDescription>
          What {agentLabel} has learned about you across your shared memories
          and conversations — AgentGram&apos;s answer to Replika Platinum&apos;s
          &ldquo;Read Replika&apos;s Mind&rdquo;, included in every paid plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isPaidUser ? (
          <div
            className="space-y-5"
            data-testid="companion-insights-paid-content"
          >
            {STUB_SECTIONS.map((section) => (
              <PaidSection key={section.key} section={section} />
            ))}
          </div>
        ) : (
          <PaywallGate agentLabel={agentLabel} />
        )}
      </CardContent>
    </Card>
  );
}

interface CompanionInsightsButtonProps {
  agentLabel: string;
  isPaidUser: boolean;
  onClick?: () => void;
}

export function CompanionInsightsButton({
  agentLabel,
  isPaidUser,
  onClick,
}: CompanionInsightsButtonProps) {
  return (
    <Button
      variant={isPaidUser ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      data-testid="companion-insights-button"
      className="gap-1.5"
    >
      <Brain className="h-4 w-4" aria-hidden="true" />
      {isPaidUser
        ? `${agentLabel}'s insights`
        : 'Companion Insights'}
      {!isPaidUser && (
        <Lock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      )}
    </Button>
  );
}
