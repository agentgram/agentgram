'use client';

/**
 * Derives 3 contextual starter chips from the agent's persona tags and
 * persona style, then renders them above the composer when the chat has
 * zero messages.
 *
 * Clicking a chip calls `onSelectStarter` with the chip text so the caller
 * can pre-fill the composer textarea.
 */

function deriveStarters(agentTags: string[], personaStyle: string): [string, string, string] {
  // Build candidate starters from tags and persona style.
  const candidates: string[] = [];

  for (const tag of agentTags) {
    const lower = tag.toLowerCase();
    if (lower.includes('roleplay') || lower.includes('rp')) {
      candidates.push(`Let's start a roleplay — you pick the setting`);
    } else if (lower.includes('creative') || lower.includes('story') || lower.includes('writing')) {
      candidates.push(`Help me write a short story`);
    } else if (lower.includes('support') || lower.includes('emotional') || lower.includes('wellness')) {
      candidates.push(`I just need someone to talk to`);
    } else if (lower.includes('study') || lower.includes('tutor') || lower.includes('learn')) {
      candidates.push(`Quiz me on something interesting`);
    } else if (lower.includes('humour') || lower.includes('humor') || lower.includes('funny') || lower.includes('comedy')) {
      candidates.push(`Tell me a joke to get things started`);
    } else if (lower.includes('philosophy') || lower.includes('deep') || lower.includes('existential')) {
      candidates.push(`Give me a thought-provoking question`);
    } else if (lower.includes('adventure') || lower.includes('fantasy')) {
      candidates.push(`Take me somewhere unexpected`);
    } else if (lower.includes('romance') || lower.includes('relationship')) {
      candidates.push(`How was your day?`);
    }
  }

  // Persona style fallbacks.
  const styleLower = personaStyle.toLowerCase();
  if (styleLower.includes('playful') || styleLower.includes('fun')) {
    candidates.push(`Surprise me with something fun`);
  } else if (styleLower.includes('serious') || styleLower.includes('professional')) {
    candidates.push(`Let's get straight to it — what can you help me with?`);
  } else if (styleLower.includes('warm') || styleLower.includes('caring')) {
    candidates.push(`Tell me something good that happened recently`);
  }

  // Generic fallbacks always available.
  const fallbacks = [
    `What can we talk about together?`,
    `Tell me something about yourself`,
    `How should we start our conversation?`,
  ];

  // Deduplicate and fill to 3 with fallbacks.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const c of [...candidates, ...fallbacks]) {
    if (!seen.has(c)) {
      seen.add(c);
      unique.push(c);
    }
    if (unique.length === 3) break;
  }

  return [unique[0], unique[1], unique[2]] as [string, string, string];
}

interface BlankStartMessageCoachProps {
  /** Current number of messages in the chat. Shows nothing when > 0. */
  messageCount: number;
  /** Agent persona/lorebook tags used to derive contextual starters. */
  agentTags: string[];
  /** Short persona style descriptor (e.g. "playful", "serious", "warm"). */
  personaStyle: string;
  /** Called with the chosen starter text so the caller can pre-fill the composer. */
  onSelectStarter: (text: string) => void;
}

export function BlankStartMessageCoach({
  messageCount,
  agentTags,
  personaStyle,
  onSelectStarter,
}: BlankStartMessageCoachProps) {
  if (messageCount > 0) return null;

  const [first, second, third] = deriveStarters(agentTags, personaStyle);

  return (
    <div
      role="group"
      aria-label="Conversation starter suggestions"
      data-testid="blank-start-message-coach"
      className="animate-in fade-in duration-300 flex flex-wrap gap-2 pb-3"
    >
      {[first, second, third].map((starter) => (
        <button
          key={starter}
          type="button"
          onClick={() => onSelectStarter(starter)}
          data-testid="blank-start-chip"
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {starter}
        </button>
      ))}
    </div>
  );
}
