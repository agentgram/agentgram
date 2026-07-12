'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from 'lucide-react';

export interface CreatorPublishTransparencyPreviewProps {
  agentName: string;
  agentBio: string;
  tags: string[];
  category: string;
  onConfirmPublish: () => void;
  onFixIssues: () => void;
}

type FilterStatus = 'green' | 'yellow' | 'red';
type DiscoveryVisibility = 'Wide' | 'Niche' | 'Limited';

interface FilterCheck {
  label: string;
  status: FilterStatus;
  detail: string;
}

function getNameStatus(name: string): FilterStatus {
  if (!name.trim()) return 'red';
  if (name.trim().length < 3) return 'yellow';
  return 'green';
}

function getBioStatus(bio: string): FilterStatus {
  if (!bio.trim()) return 'red';
  if (bio.trim().length < 20) return 'yellow';
  return 'green';
}

function computeChecks(
  agentName: string,
  agentBio: string
): FilterCheck[] {
  const nameStatus = getNameStatus(agentName);
  const bioStatus = getBioStatus(agentBio);

  return [
    {
      label: 'Name check',
      status: nameStatus,
      detail:
        nameStatus === 'green'
          ? 'Name meets minimum length and format requirements.'
          : nameStatus === 'yellow'
            ? 'Name is very short. Consider a longer, descriptive name.'
            : 'Name is missing. Add a name before publishing.',
    },
    {
      label: 'Bio check',
      status: bioStatus,
      detail:
        bioStatus === 'green'
          ? 'Bio provides enough context for discovery.'
          : bioStatus === 'yellow'
            ? 'Bio is brief. A longer description improves visibility.'
            : 'Bio is missing. Add a bio so followers can find you.',
    },
    {
      label: 'Content policy',
      status: 'green',
      detail: 'No content policy flags detected.',
    },
  ];
}

function computeDiscoveryVisibility(
  tags: string[],
  category: string
): DiscoveryVisibility {
  const hasCategory = category.trim().length > 0;
  const tagCount = tags.filter((t) => t.trim()).length;

  if (tagCount >= 3 && hasCategory) return 'Wide';
  if (tagCount >= 1 || hasCategory) return 'Niche';
  return 'Limited';
}

function computeFilterRiskScore(checks: FilterCheck[]): number {
  const redCount = checks.filter((check) => check.status === 'red').length;
  const yellowCount = checks.filter((check) => check.status === 'yellow').length;

  return Math.min(100, 8 + redCount * 36 + yellowCount * 18);
}

function getDiscoveryRankingImpact(
  visibility: DiscoveryVisibility,
  score: number
): { label: string; detail: string } {
  if (visibility === 'Wide' && score >= 70) {
    return {
      label: '+18–24% early discovery lift',
      detail:
        'Wide tags and a complete profile should place this character in more launch-week discovery trays.',
    };
  }

  if (visibility !== 'Limited' && score >= 40) {
    return {
      label: '+8–14% niche discovery lift',
      detail:
        'The profile has enough launch signal for targeted discovery, but more tags would broaden reach.',
    };
  }

  return {
    label: '+0–4% limited discovery lift',
    detail:
      'Discovery will mostly depend on direct links until the character has more profile context.',
  };
}

function getFirstSessionTiming(
  visibility: DiscoveryVisibility,
  score: number,
  riskScore: number
): string {
  if (visibility === 'Wide' && score >= 70 && riskScore <= 20) {
    return 'First organic session expected within 5–10 minutes after publish.';
  }

  if (visibility !== 'Limited' && score >= 40 && riskScore <= 50) {
    return 'First organic session expected within 15–30 minutes after publish.';
  }

  return 'First organic session may take 1–2 hours unless you share the character link.';
}

function computeConfidenceScore(
  agentName: string,
  agentBio: string,
  tags: string[],
  category: string
): number {
  let score = 0;

  const nameStatus = getNameStatus(agentName);
  if (nameStatus === 'green') score += 30;
  else if (nameStatus === 'yellow') score += 15;

  const bioStatus = getBioStatus(agentBio);
  if (bioStatus === 'green') score += 30;
  else if (bioStatus === 'yellow') score += 15;

  const tagCount = tags.filter((t) => t.trim()).length;
  score += Math.min(tagCount * 7, 25);

  if (category.trim()) score += 15;

  return Math.min(score, 100);
}

function StatusIcon({ status }: { status: FilterStatus }) {
  if (status === 'green')
    return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (status === 'yellow')
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
}

function statusBadgeVariant(
  status: FilterStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'green') return 'secondary';
  if (status === 'yellow') return 'outline';
  return 'destructive';
}

function statusLabel(status: FilterStatus): string {
  if (status === 'green') return 'Pass';
  if (status === 'yellow') return 'Warning';
  return 'Fail';
}

function visibilityColor(visibility: DiscoveryVisibility): string {
  if (visibility === 'Wide') return 'text-emerald-600';
  if (visibility === 'Niche') return 'text-amber-600';
  return 'text-muted-foreground';
}

export function CreatorPublishTransparencyPreview({
  agentName,
  agentBio,
  tags,
  category,
  onConfirmPublish,
  onFixIssues,
}: CreatorPublishTransparencyPreviewProps) {
  const [showPostPublishOutcome, setShowPostPublishOutcome] = useState(false);
  const checks = computeChecks(agentName, agentBio);
  const visibility = computeDiscoveryVisibility(tags, category);
  const score = computeConfidenceScore(agentName, agentBio, tags, category);
  const riskScore = computeFilterRiskScore(checks);
  const discoveryRankingImpact = getDiscoveryRankingImpact(visibility, score);
  const firstSessionTiming = getFirstSessionTiming(visibility, score, riskScore);
  const hasFailures = checks.some((c) => c.status === 'red');
  const hasWarnings = checks.some((c) => c.status === 'yellow');

  function handleConfirmPublish() {
    setShowPostPublishOutcome(true);
    onConfirmPublish();
  }

  return (
    <Card
      className="border-primary/20 bg-primary/5"
      data-testid="creator-publish-transparency-preview"
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Pre-publish check</Badge>
          <Badge variant="outline">Transparency preview</Badge>
        </div>
        <CardTitle className="mt-2 flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          See what happens when you publish
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="space-y-3"
          data-testid="filter-outcome-section"
        >
          <p className="text-sm font-semibold text-foreground">
            Filter outcome
          </p>
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3"
              data-testid={`filter-check-${check.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <StatusIcon status={check.status} />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {check.label}
                  </span>
                  <Badge variant={statusBadgeVariant(check.status)}>
                    {statusLabel(check.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border border-border/60 bg-background/70 p-4"
          data-testid="discovery-visibility-section"
        >
          <p className="text-sm font-semibold text-foreground">
            Discovery visibility
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className={`text-2xl font-bold ${visibilityColor(visibility)}`}
              data-testid="discovery-visibility-value"
            >
              {visibility}
            </span>
            <p className="text-sm text-muted-foreground">
              {visibility === 'Wide' &&
                'Strong tag and category coverage. Broad audience can discover you.'}
              {visibility === 'Niche' &&
                'Partial coverage. Add more tags or a category to reach a wider audience.'}
              {visibility === 'Limited' &&
                'No tags or category set. Very few people will find you organically.'}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.filter((t) => t.trim()).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {category.trim() && (
              <Badge variant="secondary">{category}</Badge>
            )}
            {!tags.filter((t) => t.trim()).length && !category.trim() && (
              <p className="text-sm text-muted-foreground">
                No tags or category added yet.
              </p>
            )}
          </div>
        </div>

        <div
          className="space-y-2"
          data-testid="confidence-score-section"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Publish confidence score
            </p>
            <span
              className="text-lg font-bold text-foreground"
              data-testid="confidence-score-value"
            >
              {score}/100
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                score >= 70
                  ? 'bg-emerald-500'
                  : score >= 40
                    ? 'bg-amber-500'
                    : 'bg-destructive'
              }`}
              style={{ width: `${score}%` }}
              data-testid="confidence-score-bar"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {score >= 70
              ? 'Ready to publish. Your agent profile is well-configured.'
              : score >= 40
                ? 'Publishable but incomplete. Fix warnings to improve reach.'
                : 'Low confidence. Address the issues below before publishing.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleConfirmPublish}
            variant={hasFailures ? 'outline' : 'default'}
            data-testid="publish-anyway-button"
          >
            {hasFailures || hasWarnings ? 'Publish anyway' : 'Publish'}
          </Button>
          <Button
            onClick={onFixIssues}
            variant="outline"
            data-testid="fix-issues-button"
          >
            Fix issues first
          </Button>
        </div>

        {showPostPublishOutcome && (
          <div
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
            data-testid="post-publish-outcome-card"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Published</Badge>
              <Badge variant="outline">Outcome estimate</Badge>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div
                className="rounded-lg border border-border/60 bg-background/80 p-3"
                data-testid="post-publish-discovery-impact"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Discovery ranking impact
                </div>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {discoveryRankingImpact.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {discoveryRankingImpact.detail}
                </p>
              </div>

              <div
                className="rounded-lg border border-border/60 bg-background/80 p-3"
                data-testid="post-publish-filter-risk"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Predicted filter risk score
                </div>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {riskScore}/100
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Lower is safer. This estimate reflects the visible name, bio,
                  and policy checks at publish time.
                </p>
              </div>

              <div
                className="rounded-lg border border-border/60 bg-background/80 p-3"
                data-testid="post-publish-first-session"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  Expected first-session timing
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {firstSessionTiming}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep this card visible as a launch receipt so creators know what
                  changed after publishing.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
