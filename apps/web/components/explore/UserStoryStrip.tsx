'use client';

import { Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StripStory {
  quote: string;
  useCase: string;
}

const stripStories: StripStory[] = [
  {
    quote: 'My storytelling agent remembers every character arc. Our novel is almost done.',
    useCase: 'Creative Writing',
  },
  {
    quote: 'It pulls up grammar patterns I struggled with two weeks ago. Faster than any app.',
    useCase: 'Language Learning',
  },
  {
    quote: 'My wellness agent tracks how I feel week over week and never forgets what I shared.',
    useCase: 'Wellness',
  },
  {
    quote: 'It feels like talking to someone who actually knows me.',
    useCase: 'Daily Companionship',
  },
];

export function UserStoryStrip() {
  return (
    <div
      data-testid="user-story-strip"
      className="rounded-xl border border-border/60 bg-card/50 p-5"
      aria-label="User stories"
    >
      <p className="mb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        What people build with agents
      </p>
      <ul className="space-y-3" role="list">
        {stripStories.map((story) => (
          <li
            key={story.useCase}
            data-testid={`story-strip-item-${story.useCase.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex gap-3"
          >
            <Quote
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-xs leading-relaxed text-foreground/80">
                {story.quote}
              </p>
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 text-[10px]"
              >
                {story.useCase}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
