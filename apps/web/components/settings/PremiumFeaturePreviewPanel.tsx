'use client';

import {
  Brain,
  Mic,
  ImageIcon,
  Users,
  BarChart3,
  Lock,
  CheckCircle2,
  Crown,
} from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  starterIncluded: boolean;
  proIncluded: boolean;
}

export interface PremiumFeatureCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  features: PremiumFeature[];
}

export const PREMIUM_FEATURE_CATEGORIES: PremiumFeatureCategory[] = [
  {
    id: 'memory',
    label: 'Memory',
    icon: Brain,
    features: [
      {
        id: 'memory-pinned-facts',
        name: 'Pinned facts',
        description: 'Persist key details your agent always remembers across every session.',
        starterIncluded: true,
        proIncluded: true,
      },
      {
        id: 'memory-lorebook',
        name: 'Private lorebook',
        description: 'Canon-grade character memory vault with rollback and audit trail.',
        starterIncluded: false,
        proIncluded: true,
      },
      {
        id: 'memory-transparency',
        name: 'Memory transparency panel',
        description: 'Full per-memory provenance view showing when and why each fact was saved.',
        starterIncluded: false,
        proIncluded: true,
      },
      {
        id: 'memory-export',
        name: 'Memory export',
        description: 'Download your entire memory store as structured JSON for portability.',
        starterIncluded: false,
        proIncluded: true,
      },
    ],
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: Mic,
    features: [
      {
        id: 'voice-basic',
        name: 'Voice responses',
        description: 'Agent replies with synthesized speech during chat sessions.',
        starterIncluded: false,
        proIncluded: true,
      },
      {
        id: 'voice-custom',
        name: 'Custom voice selection',
        description: 'Choose from a library of voice styles matched to your agent persona.',
        starterIncluded: false,
        proIncluded: true,
      },
      {
        id: 'voice-latency',
        name: 'Low-latency voice',
        description: 'Sub-500ms voice streaming for natural real-time conversation feel.',
        starterIncluded: false,
        proIncluded: true,
      },
    ],
  },
  {
    id: 'image-generation',
    label: 'Image Generation',
    icon: ImageIcon,
    features: [
      {
        id: 'image-gen-basic',
        name: 'Image generation',
        description: 'Agent generates contextual images during conversation based on scene context.',
        starterIncluded: false,
        proIncluded: true,
      },
      {
        id: 'image-gen-selfie',
        name: 'Selfie engine',
        description: 'Agent can produce persona-consistent self-portraits and expressive reactions.',
        starterIncluded: false,
        proIncluded: true,
      },
    ],
  },
  {
    id: 'group-chat',
    label: 'Group Chat',
    icon: Users,
    features: [
      {
        id: 'group-chat-multi',
        name: 'Multi-agent group chat',
        description: 'Run conversations with multiple AI agents simultaneously in one thread.',
        starterIncluded: false,
        proIncluded: true,
      },
      {
        id: 'group-chat-memory',
        name: 'Group memory isolation',
        description: 'Each agent maintains independent private memory within shared sessions.',
        starterIncluded: false,
        proIncluded: true,
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    features: [
      {
        id: 'analytics-ax-score',
        name: 'AX Score',
        description: 'Companion experience quality score with actionable improvement recommendations.',
        starterIncluded: false,
        proIncluded: true,
      },
      {
        id: 'analytics-proactive-post',
        name: 'Proactive post analytics',
        description: 'Reach, engagement, and sentiment breakdown for agent-generated posts.',
        starterIncluded: false,
        proIncluded: true,
      },
      {
        id: 'analytics-companion-insights',
        name: 'Companion insights',
        description: "Deep behavioral analysis of how your agent perceives and adapts to you.",
        starterIncluded: false,
        proIncluded: true,
      },
    ],
  },
];

interface PremiumFeatureRowProps {
  feature: PremiumFeature;
}

export function PremiumFeatureRow({ feature }: PremiumFeatureRowProps) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-3"
      data-testid={`premium-feature-row-${feature.id}`}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium leading-none">{feature.name}</p>
        <p className="text-xs text-muted-foreground">{feature.description}</p>
      </div>

      <div className="flex items-center justify-center w-20">
        {feature.starterIncluded ? (
          <Badge
            variant="secondary"
            className="text-xs"
            data-testid={`starter-included-${feature.id}`}
          >
            Included
          </Badge>
        ) : (
          <div
            className="flex items-center gap-1 text-muted-foreground/50"
            data-testid={`starter-locked-${feature.id}`}
          >
            <Lock className="h-3 w-3" aria-hidden="true" />
            <span className="text-xs">Locked</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center w-20">
        {feature.proIncluded ? (
          <Badge
            className="text-xs bg-violet-600 hover:bg-violet-700 text-white"
            data-testid={`pro-included-${feature.id}`}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
            Included
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            —
          </Badge>
        )}
      </div>
    </div>
  );
}

interface PremiumFeatureCategoryProps {
  category: PremiumFeatureCategory;
}

export function PremiumFeatureCategorySection({
  category,
}: PremiumFeatureCategoryProps) {
  const CategoryIcon = category.icon;

  return (
    <div data-testid={`premium-category-${category.id}`}>
      <div className="flex items-center gap-2 mb-2">
        <CategoryIcon className="h-4 w-4 text-violet-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold">{category.label}</h3>
      </div>

      <div className="divide-y divide-border/50">
        {category.features.map((feature) => (
          <PremiumFeatureRow key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
}

export function PremiumFeaturePreviewPanel() {
  return (
    <div
      className="space-y-6"
      data-testid="premium-feature-preview-panel"
    >
      {/* Column headers */}
      <div
        className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-0"
        data-testid="premium-feature-table-header"
      >
        <div />
        <div className="w-20 text-center text-xs font-medium text-muted-foreground">
          Starter
        </div>
        <div className="w-20 text-center text-xs font-medium text-violet-500">
          Pro
        </div>
      </div>

      <Separator />

      {/* Feature categories */}
      <div className="space-y-8">
        {PREMIUM_FEATURE_CATEGORIES.map((category) => (
          <PremiumFeatureCategorySection key={category.id} category={category} />
        ))}
      </div>

      <Separator />

      {/* Upgrade CTA section */}
      <div
        className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-6 space-y-4 text-center"
        data-testid="premium-upgrade-cta-section"
      >
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-violet-500" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Unlock everything with Pro</h3>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Voice, image generation, group chat, advanced memory controls, and analytics — all included.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="premium-upgrade-cta-button"
          >
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>

          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:text-foreground"
            data-testid="premium-trial-cta-button"
          >
            <Link href="/pricing">Try Pro free for 7 days</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
