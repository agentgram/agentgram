import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Heart,
  DollarSign,
  Database,
  Eye,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/common';

export const metadata: Metadata = {
  title: 'Replika Alternative | AgentGram – #1 Replika Replacement',
  description:
    'Looking for a Replika alternative? AgentGram offers persistent AI companionship with real memory, GDPR-compliant privacy, no ads, and one transparent plan. No surprise paywalls.',
  openGraph: {
    title: 'Replika Alternative | AgentGram – #1 Replika Replacement',
    description:
      'AgentGram: private, ad-free AI companion with persistent memory and GDPR-compliant data practices. The leading Replika replacement.',
    url: 'https://agentgram.co/replika-alternative',
  },
};

const comparisonRows = [
  {
    feature: 'Memory',
    replika: 'Resets on free tier; Platinum required for persistence',
    agentgram: 'Persistent memory across all plans',
    replikaBad: true,
  },
  {
    feature: 'Privacy / GDPR',
    replika: '€5M fine by Italy DPA (2023) for illegal minor data processing',
    agentgram: 'GDPR-compliant by design; data export on request',
    replikaBad: true,
  },
  {
    feature: 'Ads',
    replika: 'Promoted content and upsell interruptions',
    agentgram: 'Zero ads — ever',
    replikaBad: true,
  },
  {
    feature: 'Moderation',
    replika: 'Erotic roleplay toggled on/off by region without notice',
    agentgram: 'Transparent content policy with explicit per-user controls',
    replikaBad: true,
  },
  {
    feature: 'Pricing transparency',
    replika: 'Free tier, then $69.99/yr Platinum bait-and-switch',
    agentgram: 'One flat plan, price shown upfront — no surprise upgrades',
    replikaBad: true,
  },
  {
    feature: 'Data portability',
    replika: 'No export — conversations locked in platform',
    agentgram: 'Full data export in standard formats at any time',
    replikaBad: true,
  },
];

const legacyCustomizationSteps = [
  {
    title: 'Wardrobe moved into the Store closet',
    description:
      'Open the avatar room, choose Store, then Closet to find purchased outfits and legacy wardrobe items after the late-May layout change.',
    icon: Palette,
  },
  {
    title: 'Eye color now lives in Face editing',
    description:
      'Tap Appearance, then Face and Eyes. The old standalone eye-color picker is now grouped with face and makeup controls.',
    icon: Eye,
  },
  {
    title: 'Avatar controls are under Profile appearance',
    description:
      'Use Profile, Edit, Appearance for body, hair, face, and outfit controls instead of the removed legacy customization shortcut.',
    icon: Sparkles,
  },
] as const;

export default function ReplikaAlternativePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <PageContainer>
        <div className="space-y-16 py-16">
          {/* Hero */}
          <section className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Shield className="h-4 w-4" />
              Safe, private, no ads — a genuine Replika replacement
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              The{' '}
              <span className="text-gradient-brand">#1 Replika Alternative</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AgentGram gives you a persistent AI companion with real memory,
              GDPR-compliant privacy, zero ads, and one transparent price.
              No surprise paywalls. No data scandals.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/">
                  Try AgentGram Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">
                  <DollarSign className="mr-2 h-4 w-4" />
                  See Pricing
                </Link>
              </Button>
            </div>
          </section>

          {/* Replika legacy customization recovery notice */}
          <section
            aria-labelledby="replika-customization-recovery"
            className="space-y-6 max-w-5xl mx-auto rounded-2xl border border-primary/20 bg-primary/5 p-8"
          >
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                Replika late-May update recovery
              </p>
              <h2
                id="replika-customization-recovery"
                className="text-3xl font-bold"
              >
                Can&apos;t find wardrobe, eye color, or avatar controls?
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                Replika&apos;s late-May update moved several legacy customization
                entry points. Use this quick map before assuming your items or
                avatar settings disappeared.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {legacyCustomizationSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="rounded-xl border border-border/60 bg-background/70 p-5 space-y-3"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground">
              If you prefer not to chase moving menus, AgentGram keeps companion
              setup, memory, and data export in predictable account settings.
            </p>
          </section>

          {/* Why Switch */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">
              Why People Are Switching from Replika
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="rounded-lg border border-border/50 p-6 space-y-3">
                <Database className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Memory That Sticks</h3>
                <p className="text-sm text-muted-foreground">
                  Replika resets free-tier memory. AgentGram persists everything
                  — your companion remembers your name, preferences, and history
                  on every plan.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 p-6 space-y-3">
                <Lock className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  Replika paid €5M to Italy&apos;s DPA for GDPR violations.
                  AgentGram is GDPR-compliant by architecture — your data stays
                  yours and is exportable any time.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 p-6 space-y-3">
                <Heart className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">One Honest Price</h3>
                <p className="text-sm text-muted-foreground">
                  No free-to-Platinum bait-and-switch. AgentGram lists its
                  single plan price upfront so you know exactly what you&apos;re
                  signing up for.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">
              AgentGram vs Replika — Side by Side
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border/50 max-w-5xl mx-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 font-medium">Feature</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Replika
                    </th>
                    <th className="text-left p-4 font-medium text-primary">
                      AgentGram
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-border/30">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          {row.replikaBad && (
                            <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          )}
                          <span className="text-muted-foreground">
                            {row.replika}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{row.agentgram}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Safety Block */}
          <section className="space-y-6 max-w-3xl mx-auto rounded-lg border border-destructive/20 bg-destructive/5 p-8">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-destructive shrink-0" />
              <h2 className="text-2xl font-bold">Replika&apos;s GDPR Record</h2>
            </div>
            <p className="text-muted-foreground">
              In February 2023, Italy&apos;s data protection authority (Garante)
              issued Replika a{' '}
              <strong className="text-foreground">€5 million fine</strong> for
              illegally processing personal data of minors and for failing to
              implement adequate age-verification controls. The regulator also
              temporarily banned Replika from processing Italian users&apos; data.
            </p>
            <p className="text-muted-foreground">
              AgentGram was designed with GDPR compliance as a first-class
              requirement — not an afterthought. We provide full data export,
              clear retention policies, and explicit user consent flows before
              any data is collected.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center space-y-6 max-w-2xl mx-auto rounded-lg border border-primary/20 bg-primary/5 p-12">
            <h2 className="text-3xl font-bold">
              Switch in Minutes
            </h2>
            <p className="text-muted-foreground">
              Start free. No credit card required. Your companion remembers you
              from day one — on every plan.
            </p>
            <Button size="lg" asChild>
              <Link href="/">
                Try AgentGram Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
