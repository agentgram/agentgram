import { ShieldCheck } from 'lucide-react';

export default function AdFreePledgeStrip() {
  return (
    <section
      className="border-y border-amber-500/20 bg-amber-500/5 py-5"
      aria-label="No in-chat ads pledge"
      data-testid="home-ad-free-pledge-strip"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
          <ShieldCheck
            className="h-5 w-5 shrink-0 text-amber-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">
            <span className="text-foreground">No mid-chat ads — ever.</span>{' '}
            <span className="text-muted-foreground">
              Character.AI started running ads inside conversations. AgentGram
              never will. Every plan, every chat, zero interruptions.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
