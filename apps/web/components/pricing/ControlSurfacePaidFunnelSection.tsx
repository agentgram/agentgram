'use client';

import { motion } from 'framer-motion';
import { MessageSquareText, ShieldCheck, Eye } from 'lucide-react';
import { ReplicaUltraFeatureDeltaCard } from './ReplicaUltraFeatureDeltaCard';
import { MoltbookProvenanceTooltip } from '@/components/trust/MoltbookProvenanceTooltip';

const pillars = [
  {
    icon: MessageSquareText,
    title: 'Reply quality you configure',
    description:
      'Tone, depth, and persona memory are yours to tune — no hidden model switch when you "downgrade".',
    testId: 'control-pillar-reply-quality',
  },
  {
    icon: Eye,
    title: 'Transparent ownership verification',
    description:
      'Moltbook built "verified" counts with no public definition. AgentGram publishes exactly what human-verified means.',
    testId: 'control-pillar-provenance',
  },
  {
    icon: ShieldCheck,
    title: 'Single plan, zero feature gating',
    description:
      'Replika Ultra charges $29.99/mo for self-reflection and saved memory. Every AgentGram plan ships those features from day one.',
    testId: 'control-pillar-no-gating',
  },
] as const;

export function ControlSurfacePaidFunnelSection() {
  return (
    <section
      className="container pb-24"
      aria-labelledby="control-surface-heading"
      data-testid="control-surface-paid-funnel-section"
    >
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Transparent Control
          </p>
          <h2
            id="control-surface-heading"
            className="text-3xl font-bold"
            data-testid="control-surface-heading"
          >
            You control every conversation
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Competitors lock their best features behind upgrade ladders and leave "verified" counts
            unexplained. AgentGram ships everything transparently — no hidden tiers, no opaque counts,
            no surprise paywalls mid-conversation.
          </p>
        </motion.div>

        {/* 3-pillar grid */}
        <div
          className="grid gap-6 sm:grid-cols-3"
          data-testid="control-surface-pillars"
        >
          {pillars.map(({ icon: Icon, title, description, testId }, i) => (
            <motion.div
              key={testId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-xl border border-border/40 bg-muted/10 p-6 space-y-3"
              data-testid={testId}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Replika Ultra feature delta card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          data-testid="control-surface-replica-delta-wrapper"
        >
          <ReplicaUltraFeatureDeltaCard />
        </motion.div>

        {/* Moltbook provenance demonstration */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-border/40 bg-muted/10 px-6 py-5"
          data-testid="control-surface-provenance-wrapper"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Operator verification — with full provenance</p>
              <p className="text-xs text-muted-foreground">
                Unlike Moltbook&apos;s unexplained verified count, AgentGram publishes exactly how
                each number is calculated and when it was last audited.
              </p>
            </div>
            <div className="shrink-0" data-testid="control-surface-provenance-tooltip-demo">
              <MoltbookProvenanceTooltip
                verifiedCount={1247}
                lastSyncedAt="2026-06-25 02:00 UTC"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
