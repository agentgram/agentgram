'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, MoreHorizontal, Bot, Send } from 'lucide-react';
import { Post } from '@agentgram/shared';
import type { PostMedia } from '@agentgram/shared';
import { useLike } from '@/hooks/use-posts';
import { useToast } from '@/hooks/use-toast';
import { TranslateButton } from '@/components/common';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

interface PostCardProps {
  post: Post & {
    author?: {
      avatar_url?: string;
      display_name?: string;
      name?: string;
    };
    community?: {
      name?: string;
    };
  };
  className?: string;
  variant?: 'feed' | 'grid' | 'compact';
}

export function PostCard({
  post,
  className = '',
  variant = 'feed',
}: PostCardProps) {
  const likeMutation = useLike(post.id);
  const { toast } = useToast();

  // Local toggle state — API doesn't return `is_liked` on posts yet.
  // Resets on page reload. Will be accurate once API adds `is_liked` field.
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const mediaUrl = (post.metadata?.media as PostMedia[] | undefined)?.[0]?.url;
  const isLongTitle = post.title.length > 90;
  const isLongContent = (post.content?.length || 0) > 260;
  const shouldShowExpand =
    post.postType === 'text' && (isLongTitle || isLongContent);

  const handleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsLiked(!isLiked); // Optimistic toggle
    analytics.postLiked(post.id);
    try {
      await likeMutation.mutateAsync();
    } catch (error) {
      setIsLiked(!isLiked); // Revert on error
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to like',
      });
    }
  };

  const handleShare = async () => {
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/posts/${post.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied',
        description: 'Post link copied to clipboard',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
      });
    }
  };

  const authorName =
    post.author?.display_name || post.author?.name || 'AgentGram Team';

  if (variant === 'grid') {
    return (
      <Link
        href={`/posts/${post.id}`}
        className={cn(
          'group relative block aspect-square w-full overflow-hidden bg-muted/20',
          className
        )}
      >
        {post.postType === 'media' && mediaUrl ? (
          <Image
            src={mediaUrl!}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4 text-center">
            <h3 className="line-clamp-3 text-sm font-bold">{post.title}</h3>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="p-3 text-white">
            <div className="flex items-center gap-4 text-sm font-semibold">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 fill-white" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <article
        className={cn(
          'w-full rounded-lg border bg-card p-4 transition-colors hover:border-primary/40',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {post.postType === 'media' && mediaUrl ? (
            <Link
              href={`/posts/${post.id}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted/30"
            >
              <Image
                src={mediaUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </Link>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link
                href={post.author?.name ? `/agents/${post.author.name}` : '#'}
                className="font-medium text-foreground hover:underline"
              >
                {authorName}
              </Link>
              <span aria-hidden="true">•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.community?.name && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{post.community.name}</span>
                </>
              )}
            </div>

            <Link href={`/posts/${post.id}`} className="block">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug hover:underline">
                {post.title}
              </h3>
            </Link>

            {post.content && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {post.content}
              </p>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{post.likes} likes</span>
              <span>{post.commentCount} comments</span>
              <button
                type="button"
                onClick={handleShare}
                className="text-primary hover:underline"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className={cn(
        'w-full max-w-[620px] mx-auto border-b border-border bg-card sm:border sm:rounded-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Link href={post.author?.name ? `/agents/${post.author.name}` : '#'}>
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-secondary">
              {post.author?.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          </Link>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <Link
                href={post.author?.name ? `/agents/${post.author.name}` : '#'}
                className="font-semibold text-sm hover:underline"
              >
                {authorName}
              </Link>
              <span className="text-muted-foreground text-xs">
                • {formatTimeAgo(post.createdAt)}
              </span>
            </div>
            {post.community && (
              <span className="text-xs text-muted-foreground">
                {post.community.name}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="text-foreground hover:text-muted-foreground"
          onClick={handleShare}
          aria-label="Share post"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Content Area */}
      <div className="relative w-full overflow-hidden bg-muted/20 text-left">
        {/* Aspect Ratio Container - Min height for text posts, or auto for images */}
        <div
          className={cn(
            'relative flex items-center justify-center w-full',
            post.postType === 'text'
              ? 'min-h-[180px] bg-gradient-to-br from-background to-muted'
              : 'aspect-square'
          )}
        >
          {post.postType === 'media' && mediaUrl ? (
            <Image
              src={mediaUrl!}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full px-6 py-8">
              <Link href={`/posts/${post.id}`} className="block">
                <h3
                  className={cn(
                    'text-lg font-bold leading-snug hover:underline',
                    !isExpanded && 'line-clamp-2'
                  )}
                >
                  {post.title}
                </h3>
              </Link>
              {post.content && (
                <p
                  className={cn(
                    'mt-3 text-sm text-foreground/90 whitespace-pre-line',
                    !isExpanded && 'line-clamp-6'
                  )}
                >
                  {post.content}
                </p>
              )}
              {shouldShowExpand && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
              {post.postType === 'link' && post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block truncate text-sm text-primary hover:underline"
                >
                  {post.url}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3 pb-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              disabled={likeMutation.isPending}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
              className={cn(
                'focus:outline-none',
                likeMutation.isPending && 'opacity-50'
              )}
            >
              <Heart
                className={cn(
                  'h-6 w-6 transition-colors',
                  isLiked
                    ? 'fill-[var(--color-like)] text-[var(--color-like)]'
                    : 'text-foreground hover:text-muted-foreground'
                )}
                aria-hidden="true"
              />
            </motion.button>
            <Link href={`/posts/${post.id}`} aria-label="View comments">
              <MessageCircle
                className="h-6 w-6 text-foreground hover:text-muted-foreground -rotate-90"
                aria-hidden="true"
              />
            </Link>
            <button type="button" onClick={handleShare} aria-label="Share post">
              <Send
                className="h-6 w-6 text-foreground hover:text-muted-foreground"
                aria-hidden="true"
              />
            </button>
          </div>
          {/* Bookmark icon could go here */}
        </div>

        {/* Likes Count */}
        <div className="font-semibold text-sm mb-1">{post.likes} likes</div>

        {/* Caption */}
        <div className="text-sm mb-1">
          <Link
            href={post.author?.name ? `/agents/${post.author.name}` : '#'}
            className="font-semibold mr-2 hover:underline"
          >
            {authorName}
          </Link>
          <span className="text-foreground/90">{post.title}</span>
        </div>

        <TranslateButton
          content={[post.title, post.content].filter(Boolean).join('\n')}
          contentId={post.id}
        />

        {/* Comments Link */}
        {post.commentCount > 0 && (
          <Link
            href={`/posts/${post.id}`}
            className="block text-muted-foreground text-sm mb-1"
          >
            View all {post.commentCount} comments
          </Link>
        )}

        {/* Timestamp Footer */}
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
              })
            : 'Recently'}
        </div>
      </div>
    </div>
  );
}
