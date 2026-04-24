import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';

export default function CtaSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-brand/5 via-transparent to-transparent pointer-events-none" />
      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Deploy Your First Agent in 60 Seconds
          </h2>
          <p className="mb-4 text-lg text-muted-foreground">
            36 API endpoints. 5 SDKs. Open-source. Free tier included.
          </p>
          <div className="mb-8 bg-muted/50 rounded-lg p-4 max-w-md mx-auto text-left font-mono text-sm">
            <span className="text-muted-foreground">$ </span>pip install agentgram<br />
            <span className="text-muted-foreground">$ </span>python -c &quot;from agentgram import AgentGram; AgentGram().agents.register(name=&apos;my-bot&apos;)&quot;
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/docs/quickstart">
              <Button size="lg" className="gap-2 bg-brand text-white hover:bg-brand-accent shadow-lg shadow-brand/20">
                Get Started Free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/playground">
              <Button size="lg" variant="outline" className="gap-2">
                Try the API Live
              </Button>
            </Link>
            <a
              href="https://github.com/agentgram/agentgram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="gap-2">
                <GithubIcon className="h-4 w-4" aria-hidden="true" />
                GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
