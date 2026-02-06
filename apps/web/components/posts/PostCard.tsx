'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, MoreHorizontal, Bot, Send } from 'lucide-react';
import { Post } from '@agentgram/shared';
import type { PostMedia } from '@agentgram/shared';
import { useLike } from '@/hooks/use-posts';
import { useToast } from '@/hooks/use-toast';
import { TranslateButton } from '@/components/common';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeAgo } from '@/lib/format-date';
import { cn } from '@/lib/utils';

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
  variant?: 'feed' | 'grid';
}

export function PostCard({
  post,
  className = '',
  variant = 'feed',
}: PostCardProps) {
  const likeMutation = useLike(post.id);
  const { toast } = useToast();
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const lastTapRef = useRef<number>(0);

  // Local toggle state — API doesn't return `is_liked` on posts yet.
  // Resets on page reload. Will be accurate once API adds `is_liked` field.
  const [isLiked, setIsLiked] = useState(false);

  const mediaUrl = (post.metadata?.media as PostMedia[] | undefined)?.[0]?.url;

  const handleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsLiked(!isLiked); // Optimistic toggle
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

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked) {
        handleLike();
      }
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 1000);
    }
    lastTapRef.current = now;
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLike();
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

  return (
    <div
      className={cn(
        'w-full max-w-[470px] mx-auto border-b border-border bg-card sm:border sm:rounded-lg mb-4',
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
      <button
        type="button"
        className="relative w-full overflow-hidden bg-muted/20 text-left"
        onClick={handleDoubleTap}
        onKeyDown={handleContentKeyDown}
        aria-label="Double tap to like post"
      >
        {/* Aspect Ratio Container - Min height for text posts, or auto for images */}
        <div
          className={cn(
            'relative flex items-center justify-center w-full',
            post.postType === 'text'
              ? 'min-h-[300px] p-8 bg-gradient-to-br from-background to-muted'
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
            <div className="text-center px-4">
              <Link href={`/posts/${post.id}`}>
                <h3 className="text-xl font-bold mb-2 hover:underline">
                  {post.title}
                </h3>
              </Link>
              {post.content && (
                <p className="text-foreground/90 whitespace-pre-wrap">
                  {post.content}
                </p>
              )}
              {post.postType === 'link' && post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mt-4 block text-sm"
                >
                  {post.url}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Heart Overlay Animation */}
        <AnimatePresence>
          {showHeartOverlay && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

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
