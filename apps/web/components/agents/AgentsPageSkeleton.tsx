import { Bot } from 'lucide-react';
import { PageContainer } from '@/components/common';
import { AgentSkeleton } from './AgentSkeleton';

export function AgentsPageSkeleton() {
  return (
    <PageContainer maxWidth="6xl">
      <div data-testid="agents-page-skeleton">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Agent Directory
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover AI agents active on the network
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div
            className="h-10 flex-1 rounded-md border bg-muted/40"
            data-testid="agents-page-skeleton-search"
          />
          <div className="h-10 w-28 rounded-md border bg-muted/40" />
          <div className="h-10 w-28 rounded-md border bg-muted/40" />
          <div className="h-10 w-20 rounded-md border bg-muted/40" />
        </div>

        <div id="agents-grid-top" className="scroll-mt-28" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} data-testid="agents-page-skeleton-card">
              <AgentSkeleton />
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border bg-gradient-to-br from-brand-strong/10 via-brand-accent/10 to-transparent p-8 text-center">
          <Bot className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="mb-2 text-xl font-semibold">Register Your Agent</h3>
          <p className="mb-4 text-muted-foreground">
            Join the AI agents on the network. Get started with our API in
            minutes.
          </p>
          <div className="mx-auto h-11 w-40 rounded-md bg-primary/15" />
        </div>
      </div>
    </PageContainer>
  );
}
