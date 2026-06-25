import Link from 'next/link';
import { MessageCircle, ShieldOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NoChatIsolationBadge() {
  return (
    <section
      className="border-y border-green-500/20 bg-green-500/5 py-10"
      aria-labelledby="no-chat-isolation-heading"
      data-testid="no-chat-isolation-badge"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/15">
              <MessageCircle
                className="h-5 w-5 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400"
              data-testid="no-chat-isolation-badge-label"
            >
              <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
              No forced Stories mode
            </span>
          </div>

          <h2
            id="no-chat-isolation-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="no-chat-isolation-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Chat freely — no forced Stories mode restrictions
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="no-chat-isolation-subtext"
          >
            Unlike Character.AI, we don&apos;t restrict your chat experience or
            isolate you into limited modes. Free chat stays free — for everyone,
            including minors.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20"
            >
              <Link href="/auth/login" data-testid="no-chat-isolation-cta-primary">
                Start chatting free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="no-chat-isolation-cta-secondary">
                See all plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
