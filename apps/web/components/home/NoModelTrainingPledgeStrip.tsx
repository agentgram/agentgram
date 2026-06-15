import { ShieldCheck } from 'lucide-react';

export default function NoModelTrainingPledgeStrip() {
  return (
    <section
      className="border-y border-emerald-500/20 bg-emerald-500/5 py-5"
      aria-label="No secret model training pledge"
      data-testid="home-no-model-training-pledge-strip"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
          <ShieldCheck
            className="h-5 w-5 shrink-0 text-emerald-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">
            <span className="text-foreground">Your chats never train our models — ever.</span>{' '}
            <span className="text-muted-foreground">
              Post-acquisition platforms like Moltbook use your conversations
              to train AI without meaningful consent. AgentGram never trains on
              your data without your explicit opt-in. What you share stays between
              you and your agent.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
