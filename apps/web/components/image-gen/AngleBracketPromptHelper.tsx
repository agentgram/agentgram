'use client';

import { useState } from 'react';
import { Tag, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TagChip {
  id: string;
  tag: string;
  label: string;
}

interface TagCategory {
  id: string;
  label: string;
  chips: TagChip[];
}

const TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'hair',
    label: 'Hair',
    chips: [
      { id: 'hair-wavy', tag: '<hair:wavy>', label: 'wavy' },
      { id: 'hair-straight', tag: '<hair:straight>', label: 'straight' },
      { id: 'hair-curly', tag: '<hair:curly>', label: 'curly' },
      { id: 'hair-short', tag: '<hair:short>', label: 'short' },
      { id: 'hair-long', tag: '<hair:long>', label: 'long' },
    ],
  },
  {
    id: 'eyes',
    label: 'Eyes',
    chips: [
      { id: 'eyes-blue', tag: '<eyes:blue>', label: 'blue' },
      { id: 'eyes-green', tag: '<eyes:green>', label: 'green' },
      { id: 'eyes-brown', tag: '<eyes:brown>', label: 'brown' },
      { id: 'eyes-hazel', tag: '<eyes:hazel>', label: 'hazel' },
      { id: 'eyes-gray', tag: '<eyes:gray>', label: 'gray' },
    ],
  },
  {
    id: 'outfit',
    label: 'Outfit',
    chips: [
      { id: 'outfit-casual', tag: '<outfit:casual>', label: 'casual' },
      { id: 'outfit-formal', tag: '<outfit:formal>', label: 'formal' },
      { id: 'outfit-athletic', tag: '<outfit:athletic>', label: 'athletic' },
      { id: 'outfit-fantasy', tag: '<outfit:fantasy>', label: 'fantasy' },
    ],
  },
  {
    id: 'background',
    label: 'Background',
    chips: [
      { id: 'bg-indoor', tag: '<background:indoor>', label: 'indoor' },
      { id: 'bg-outdoor', tag: '<background:outdoor>', label: 'outdoor' },
      { id: 'bg-fantasy', tag: '<background:fantasy>', label: 'fantasy' },
      { id: 'bg-minimal', tag: '<background:minimal>', label: 'minimal' },
    ],
  },
  {
    id: 'expression',
    label: 'Expression',
    chips: [
      { id: 'expr-smiling', tag: '<expression:smiling>', label: 'smiling' },
      { id: 'expr-serious', tag: '<expression:serious>', label: 'serious' },
      { id: 'expr-playful', tag: '<expression:playful>', label: 'playful' },
      { id: 'expr-calm', tag: '<expression:calm>', label: 'calm' },
    ],
  },
];

interface AngleBracketPromptHelperProps {
  onInsert?: (tag: string) => void;
  defaultOpen?: boolean;
}

export function AngleBracketPromptHelper({
  onInsert,
  defaultOpen = false,
}: AngleBracketPromptHelperProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleChipClick(chip: TagChip) {
    if (onInsert) {
      onInsert(chip.tag);
    } else {
      navigator.clipboard?.writeText(chip.tag).catch(() => {});
      setCopiedId(chip.id);
      setTimeout(() => setCopiedId((prev) => (prev === chip.id ? null : prev)), 1500);
    }
  }

  return (
    <div
      className="rounded-xl border border-border/60 bg-card/40"
      data-testid="angle-bracket-prompt-helper"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid="angle-bracket-prompt-helper-toggle"
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/30 rounded-xl transition-colors"
        aria-expanded={open}
      >
        <Tag className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
        <span className="text-xs font-medium text-muted-foreground">
          Anchor tags — Nomi V5 prompt syntax
        </span>
        <span className="ml-auto">
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          )}
        </span>
      </button>

      {open && (
        <div
          className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3"
          data-testid="angle-bracket-prompt-helper-panel"
        >
          <p className="text-xs text-muted-foreground">
            {onInsert
              ? 'Tap a tag to insert it into your prompt.'
              : 'Tap a tag to copy it, then paste into your prompt.'}
          </p>

          {TAG_CATEGORIES.map((category) => (
            <div key={category.id} data-testid={`angle-bracket-category-${category.id}`}>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                {category.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {category.chips.map((chip) => {
                  const isCopied = copiedId === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      data-testid={`angle-bracket-chip-${chip.id}`}
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-mono transition-colors ${
                        isCopied
                          ? 'border-green-500/60 bg-green-500/10 text-green-600'
                          : 'border-border/60 bg-background text-muted-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-primary'
                      }`}
                      title={chip.tag}
                    >
                      {isCopied ? (
                        <Check className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                      ) : null}
                      {chip.tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-xs text-muted-foreground/60 pt-1">
            Anchor tags tell Nomi V5 to lock specific appearance traits in generated images.
          </p>
        </div>
      )}
    </div>
  );
}
