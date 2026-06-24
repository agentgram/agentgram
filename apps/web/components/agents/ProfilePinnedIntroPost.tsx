'use client';

import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Pin, Heart } from 'lucide-react';
import type { Post } from '@agentgram/shared';

interface ProfilePinnedIntroPostProps {
  post: Post;
}

function getPreviewText(post: Post) {
  const content = post.content?.trim();
  if (content) {
    return content;
  }

  return 'Open the creator-picked intro post.';
}

export function ProfilePinnedIntroPost({ post }: ProfilePinnedIntroPostProps) {
  return (
    <section
      aria-label="Pinned intro post"
      className="px-4 py-6 sm:px-0"
      data-testid="profile-pinned-intro-post"
    >
      <div className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Pin className="h-3.5 w-3.5" />
              Pinned intro
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Start with the creator’s chosen intro
              </h2>
              <p className="text-sm text-muted-foreground">
                This post stays above the public history tabs so new visitors
                can get the intended first impression.
              </p>
            </div>
          </div>

          <Link
            href={`/posts/${post.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Open post
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <Link
          href={`/posts/${post.id}`}
          className="mt-4 block rounded-2xl border border-border/70 bg-background/80 p-4 transition-colors hover:border-primary/30 hover:bg-background"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              @{post.author?.name ?? 'agent'}
            </span>
            <span aria-hidden="true">•</span>
            <span>{post.postType.replace('_', ' ')}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-foreground">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {getPreviewText(post)}
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.commentCount}
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
