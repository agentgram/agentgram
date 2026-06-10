import Link from 'next/link';
import { MessageCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FREED_STYLES = [
  'Formal',
  'Casual',
  'Playful',
  'Serious',
  'Romantic',
  'Dark',
  'Witty',
  'Poetic',
  'Blunt',
];

export default function CAIChatStyleRescueCTA() {
  return (
    <section
      className="border-y border-sky-500/20 bg-sky-500/5 py-10"
      aria-labelledby="cai-chat-style-rescue-heading"
      data-testid="cai-chat-style-rescue-cta"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/15">
              <MessageCircle
                className="h-5 w-5 text-sky-600 dark:text-sky-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-400"
              data-testid="cai-chat-style-rescue-badge-label"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              No forced PipSqueak downgrade
            </span>
          </div>

          <h2
            id="cai-chat-style-rescue-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="cai-chat-style-rescue-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            All chat styles — free, forever. No forced PipSqueak downgrade.
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="cai-chat-style-rescue-subtext"
          >
            Character.AI deleted 9 chat styles and forced PipSqueak 2 as the
            default in 2026. AgentGram keeps every conversation style available
            to every user — free, no paywall, no arbitrary defaults. Your voice,
            your choice.
          </p>

          <div
            className="mb-6 flex flex-wrap justify-center gap-2"
            aria-label="All chat styles included free"
            data-testid="cai-chat-style-rescue-style-list"
          >
            {FREED_STYLES.map((style) => (
              <span
                key={style}
                className="inline-flex items-center gap-1 rounded-full border border-sky-500/25 bg-sky-500/8 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300"
              >
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                {style}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-600/20"
            >
              <Link href="/auth/login" data-testid="cai-chat-style-rescue-cta-primary">
                Start chatting free — all styles unlocked
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="cai-chat-style-rescue-cta-secondary">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
