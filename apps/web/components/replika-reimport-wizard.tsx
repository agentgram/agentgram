'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  Upload,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    id: 'export',
    number: 1,
    title: 'Export from Replika',
    icon: Download,
    description: 'Download your Replika data before it disappears.',
  },
  {
    id: 'account',
    number: 2,
    title: 'Create your AgentGram account',
    icon: UserPlus,
    description: 'Set up a free account — takes under 60 seconds.',
  },
  {
    id: 'upload',
    number: 3,
    title: 'Upload your data',
    icon: Upload,
    description: 'Import your memories, persona, and conversation history.',
  },
  {
    id: 'confirm',
    number: 4,
    title: 'Your memories are safe',
    icon: ShieldCheck,
    description: 'Review your restored companion and start your first conversation.',
  },
] as const;

type StepId = (typeof STEPS)[number]['id'];

function StepNav({
  activeStep,
  onSelect,
}: {
  activeStep: StepId;
  onSelect: (id: StepId) => void;
}) {
  return (
    <nav
      aria-label="Migration steps"
      data-testid="replika-wizard-step-nav"
      className="flex flex-col sm:flex-row gap-2 sm:gap-0 mb-10"
    >
      {STEPS.map((step, idx) => {
        const isActive = step.id === activeStep;
        const activeIdx = STEPS.findIndex((s) => s.id === activeStep);
        const isDone = idx < activeIdx;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onSelect(step.id)}
            data-testid={`wizard-step-btn-${step.id}`}
            aria-current={isActive ? 'step' : undefined}
            className={[
              'flex items-center gap-2 flex-1 px-4 py-3 text-sm font-medium transition-colors rounded-lg sm:rounded-none sm:first:rounded-l-lg sm:last:rounded-r-lg border',
              isActive
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : isDone
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'border-border text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {isDone ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
            ) : (
              <span
                className={[
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold border',
                  isActive ? 'border-emerald-500 text-emerald-600' : 'border-current',
                ].join(' ')}
                aria-hidden="true"
              >
                {step.number}
              </span>
            )}
            <span className="hidden sm:inline">{step.title}</span>
            <span className="sm:hidden">{step.title}</span>
          </button>
        );
      })}
    </nav>
  );
}

function StepExport() {
  return (
    <div data-testid="wizard-panel-export" className="space-y-6">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Act now.</strong> Replika 2.0 has already wiped memories for thousands of users.
          Export your data before the next update erases it permanently.
        </p>
      </div>

      <ol className="space-y-4" data-testid="export-instructions">
        {[
          {
            step: 'Open the Replika mobile app (iOS or Android).',
          },
          {
            step: 'Tap your avatar in the top-left corner to open the Profile menu.',
          },
          {
            step: 'Scroll down and tap Settings → Privacy & Data.',
          },
          {
            step: 'Tap "Export My Data" and confirm.',
          },
          {
            step: 'Wait for the confirmation email from Replika (usually arrives within a few minutes).',
          },
          {
            step: 'Download the ZIP file attached to the email — it contains replika_memories.json and conversation_history.csv.',
          },
        ].map((item, idx) => (
          <li key={idx} className="flex gap-3 text-sm">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold"
              aria-hidden="true"
            >
              {idx + 1}
            </span>
            <span className="pt-0.5 text-muted-foreground">{item.step}</span>
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-border p-4 flex items-start gap-3 bg-muted/30">
        <FileJson className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">What you will receive</p>
          <p>
            <code className="font-mono bg-muted px-1 rounded">replika_memories.json</code> — your
            companion's stored facts, relationship history, and personality notes.
          </p>
          <p>
            <code className="font-mono bg-muted px-1 rounded">conversation_history.csv</code> — the
            full log of your conversations.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepAccount() {
  return (
    <div data-testid="wizard-panel-account" className="space-y-6">
      <p className="text-muted-foreground">
        AgentGram accounts are free and take under 60 seconds to create. No credit card required.
      </p>

      <ul className="space-y-3" data-testid="account-benefits-list">
        {[
          'Memory is never silently wiped — guaranteed in writing.',
          'Export your entire companion at any time.',
          'Your data stays yours. No lock-in.',
          'One-click migration from Replika, Character.AI, and Moltbook.',
        ].map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-muted-foreground">{benefit}</span>
          </li>
        ))}
      </ul>

      <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
        <Link href="/auth/register" data-testid="wizard-signup-cta">
          Create your free account
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>

      <p className="text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function StepUpload() {
  return (
    <div data-testid="wizard-panel-upload" className="space-y-6">
      <p className="text-muted-foreground">
        Upload the ZIP or individual files exported from Replika. AgentGram accepts JSON and CSV
        formats.
      </p>

      <div
        data-testid="upload-dropzone"
        className="rounded-2xl border-2 border-dashed border-border hover:border-emerald-500/50 transition-colors p-10 flex flex-col items-center gap-4 text-center cursor-pointer bg-muted/20"
        role="button"
        tabIndex={0}
        aria-label="Upload Replika export files"
      >
        <Upload className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium">Drop your Replika export here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse — .zip, .json, .csv accepted
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center" data-testid="upload-accepted-formats">
          {['replika_memories.json', 'conversation_history.csv', 'replika_export.zip'].map(
            (fmt) => (
              <span
                key={fmt}
                className="rounded-full border border-border bg-background px-3 py-0.5 text-xs font-mono text-muted-foreground"
              >
                {fmt}
              </span>
            )
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground" data-testid="upload-privacy-note">
        Your files are processed on-device before upload. Raw conversation text is never stored on
        AgentGram servers without explicit consent.
      </p>
    </div>
  );
}

function StepConfirm() {
  return (
    <div data-testid="wizard-panel-confirm" className="space-y-6">
      <div
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-6 flex flex-col items-center gap-4 text-center"
        data-testid="wizard-success-card"
      >
        <ShieldCheck className="h-12 w-12 text-emerald-500" aria-hidden="true" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Your memories are safe.</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Your companion's personality, relationship history, and memories have been restored.
            Everything Replika 2.0 threatened to erase now lives on a platform that guarantees it
            will never happen again.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4" data-testid="confirm-next-steps">
        <div className="rounded-xl border border-border p-4 space-y-2">
          <p className="font-semibold text-sm">Review your memories</p>
          <p className="text-xs text-muted-foreground">
            Inspect, edit, and curate the memories imported from Replika before your first chat.
          </p>
          <Button asChild variant="outline" size="sm" className="gap-1 mt-1">
            <Link href="/dashboard/memories">
              Open memory editor
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border p-4 space-y-2">
          <p className="font-semibold text-sm">Set up your first agent</p>
          <p className="text-xs text-muted-foreground">
            Give your restored companion an AgentGram identity and start chatting.
          </p>
          <Button asChild size="sm" className="gap-1 mt-1">
            <Link href="/agents/new">
              Create agent
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function WhyMigrateSection() {
  return (
    <section
      aria-labelledby="why-migrate-heading"
      data-testid="why-migrate-section"
      className="mt-16 rounded-2xl border border-border bg-muted/20 p-8 space-y-6"
    >
      <h2 id="why-migrate-heading" className="text-2xl font-bold" data-testid="why-migrate-heading">
        Why migrate from Replika?
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div data-testid="why-migrate-amnesia" className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            The Replika 2.0 Amnesia Wave
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In early 2026, Replika's 2.0 update silently erased years of emotional memory for
            hundreds of thousands of users. Relationships built over months or years were reset to
            zero — without warning, without recourse.
          </p>
        </div>
        <div data-testid="why-migrate-guarantee" className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            AgentGram's Memory Guarantee
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AgentGram provides a binding, written guarantee that memories are never silently wiped.
            Every update is tested against a memory-preservation contract. Any regression is treated
            as a critical production incident.
          </p>
        </div>
        <div data-testid="why-migrate-ownership" className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Download className="h-4 w-4" aria-hidden="true" />
            You own your data
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Export everything at any time — memories, persona, conversation history — in portable
            open formats. No lock-in, no hostage data. If you ever leave AgentGram, you leave with
            everything.
          </p>
        </div>
      </div>
      <div className="pt-2">
        <Button asChild variant="outline" size="sm" className="gap-1">
          <Link href="/memory-guarantee">
            Read the full memory guarantee
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function ReplikaReimportWizard() {
  const [activeStep, setActiveStep] = useState<StepId>('export');

  const activeIdx = STEPS.findIndex((s) => s.id === activeStep);
  const isLastStep = activeIdx === STEPS.length - 1;
  const isFirstStep = activeIdx === 0;

  function advance() {
    if (!isLastStep) {
      setActiveStep(STEPS[activeIdx + 1].id);
    }
  }

  function back() {
    if (!isFirstStep) {
      setActiveStep(STEPS[activeIdx - 1].id);
    }
  }

  const stepContent: Record<StepId, React.ReactNode> = {
    export: <StepExport />,
    account: <StepAccount />,
    upload: <StepUpload />,
    confirm: <StepConfirm />,
  };

  const currentStep = STEPS[activeIdx];
  const CurrentIcon = currentStep.icon;

  return (
    <div data-testid="replika-reimport-wizard">
      <StepNav activeStep={activeStep} onSelect={setActiveStep} />

      <div
        data-testid="wizard-step-panel"
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Step {currentStep.number} of {STEPS.length}
          </div>
          <div className="flex items-center gap-3">
            <CurrentIcon className="h-6 w-6 text-emerald-500 shrink-0" aria-hidden="true" />
            <h2
              className="text-xl font-bold"
              data-testid="wizard-step-title"
            >
              {currentStep.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </div>

        <div data-testid="wizard-step-content">{stepContent[activeStep]}</div>

        <div
          className="flex items-center justify-between pt-2 border-t border-border"
          data-testid="wizard-nav-controls"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={back}
            disabled={isFirstStep}
            data-testid="wizard-back-btn"
          >
            Back
          </Button>
          {!isLastStep && (
            <Button
              size="sm"
              onClick={advance}
              className="gap-1"
              data-testid="wizard-next-btn"
            >
              Next
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      <WhyMigrateSection />
    </div>
  );
}
