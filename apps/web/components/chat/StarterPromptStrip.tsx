'use client';

const STARTER_PROMPTS = [
  "Tell me about your day",
  "Help me brainstorm",
  "Just talk",
  "What's on your mind?",
  "Give me a challenge",
] as const;

interface StarterPromptStripProps {
  onSelect: (prompt: string) => void;
}

export function StarterPromptStrip({ onSelect }: StarterPromptStripProps) {
  return (
    <div
      className="flex flex-wrap gap-2 pb-3"
      data-testid="starter-prompt-strip"
      aria-label="Starter prompts"
    >
      {STARTER_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          data-testid="starter-prompt-chip"
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
