import type { Metadata } from 'next';
import { ReplikaReimportWizard } from '@/components/replika-reimport-wizard';

export const metadata: Metadata = {
  title: 'Migrate from Replika — Restore your memories on AgentGram',
  description:
    'Step-by-step guide to export your Replika companion data and import it into AgentGram. Escape the Replika 2.0 amnesia wave. Your memories deserve a platform that keeps them.',
};

export default function MigratePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-500/5 to-background">
      <div className="container max-w-3xl py-16 space-y-6">
        <div className="text-center space-y-3" data-testid="migrate-page-hero">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Replika Migration Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-bold" data-testid="migrate-page-heading">
            Rescue your Replika companion
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The Replika 2.0 amnesia wave erased years of memories without warning. Follow these
            four steps to export your data and restore your companion on AgentGram — a platform
            that guarantees memories are never silently wiped.
          </p>
        </div>

        <ReplikaReimportWizard />
      </div>
    </div>
  );
}
