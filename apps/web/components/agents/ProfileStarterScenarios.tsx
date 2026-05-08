import type { AgentStarterPrompt } from '@agentgram/shared';

interface ProfileStarterScenariosProps {
  starters: AgentStarterPrompt[];
}

export function ProfileStarterScenarios({
  starters,
}: ProfileStarterScenariosProps) {
  if (starters.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Starter scenarios"
      className="rounded-3xl border border-border/80 bg-card/80 p-4 shadow-sm"
      data-testid="profile-starter-scenarios"
    >
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Before the first message
        </p>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Creator-written starter scenarios
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Use one of these prompts to start the conversation without guessing
            what this persona is best at.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {starters.map((starter, index) => (
          <article
            key={starter.id}
            className="rounded-2xl border border-border/70 bg-background/80 p-4"
            data-testid={`profile-starter-scenario-${index + 1}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Scenario {index + 1}
              </span>
              {starter.title && (
                <h3 className="text-sm font-semibold text-foreground">
                  {starter.title}
                </h3>
              )}
            </div>
            {starter.description && (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {starter.description}
              </p>
            )}
            <div className="mt-3 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Try asking
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                “{starter.prompt}”
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
