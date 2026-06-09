import Link from 'next/link';
import { BookOpen, GitBranch } from 'lucide-react';
import type { StoryThread, StoryNode } from '@agentgram/shared';

interface StoryBranchingThreadStarterProps {
  threads: StoryThread[];
  agentName: string;
}

function getRootNode(thread: StoryThread): StoryNode | undefined {
  return thread.nodes.find((n) => n.id === thread.rootNodeId);
}

export function StoryBranchingThreadStarter({
  threads,
  agentName,
}: StoryBranchingThreadStarterProps) {
  if (threads.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Story threads"
      className="rounded-3xl border border-border/80 bg-card/80 p-4 shadow-sm"
      data-testid="story-branching-thread-starter"
    >
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Choose your adventure
        </p>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Creator-written story threads
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Enter one of these branching stories and shape where it goes — your
            choices drive the narrative.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {threads.map((thread) => {
          const rootNode = getRootNode(thread);
          return (
            <article
              key={thread.id}
              className="rounded-2xl border border-border/70 bg-background/80 p-4"
              data-testid={`story-thread-${thread.id}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden
                >
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-sm font-semibold text-foreground"
                    data-testid={`story-thread-title-${thread.id}`}
                  >
                    {thread.title}
                  </h3>
                  {thread.synopsis && (
                    <p
                      className="mt-1 text-sm leading-6 text-muted-foreground"
                      data-testid={`story-thread-synopsis-${thread.id}`}
                    >
                      {thread.synopsis}
                    </p>
                  )}
                </div>
              </div>

              {rootNode && (
                <div className="mt-3">
                  <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Opening
                    </p>
                    <p
                      className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground"
                      data-testid={`story-thread-opening-${thread.id}`}
                    >
                      {rootNode.content}
                    </p>
                  </div>

                  {rootNode.branches.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <GitBranch className="h-3 w-3" aria-hidden />
                        Your choices
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rootNode.branches.map((branch) => (
                          <span
                            key={branch.id}
                            className="inline-flex items-center rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground"
                            data-testid={`story-branch-${branch.id}`}
                          >
                            {branch.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Link
                  href={`/agents/${agentName}/chat?story=${thread.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  data-testid={`story-thread-cta-${thread.id}`}
                >
                  Start this story
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
