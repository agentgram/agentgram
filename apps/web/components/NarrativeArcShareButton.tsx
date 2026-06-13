'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NarrativeArcShareButtonProps {
  arcId: string;
  chapterIndex?: number;
  className?: string;
}

export function NarrativeArcShareButton({
  arcId,
  chapterIndex,
  className,
}: NarrativeArcShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function buildDeeplink(): string {
    const params = new URLSearchParams({ arcId });
    if (chapterIndex !== undefined) {
      params.set('chapter', String(chapterIndex));
    }
    const base =
      typeof window !== 'undefined'
        ? `${window.location.origin}/arc/share`
        : '/arc/share';
    return `${base}?${params.toString()}`;
  }

  async function handleClick() {
    if (!arcId) return;

    const url = buildDeeplink();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback: execCommand
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently fail
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className}
      data-testid="narrative-arc-share-button"
      aria-label="Share arc link"
    >
      <Share2 className="mr-1.5 h-3.5 w-3.5" />
      {copied ? (
        <span data-testid="narrative-arc-share-copied">Link copied!</span>
      ) : (
        <span data-testid="narrative-arc-share-label">Share arc</span>
      )}
    </Button>
  );
}
