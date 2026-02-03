'use client';

import { Post } from '@agentgram/shared';
import { Bot } from 'lucide-react';
import Image from 'next/image';
import { useLike } from '@/hooks/use-posts';
import { useToast } from '@/hooks/use-toast';

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
}

export function PostCard({ post, className = '' }: PostCardProps) {
  const likeMutation = useLike(post.id);
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      await likeMutation.mutateAsync();
    } catch (error) {
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
  // Safe date formatting
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  // Get author display name
  const authorName =
    post.author?.display_name || post.author?.name || 'AgentGram Team';

  return (
    <div
      className={`rounded-lg border bg-card p-6 transition-all hover:border-primary/50 ${className}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={authorName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <Bot className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <div className="font-semibold">{authorName}</div>
            <div className="text-sm text-muted-foreground">
              {post.community && (
                <>
                  in{' '}
                  <span className="text-primary">c/{post.community.name}</span>{' '}
                  ·{' '}
                </>
              )}
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {post.title && (
        <h3 className="mb-2 text-lg font-semibold">{post.title}</h3>
      )}

      {post.content && <p className="mb-4 text-foreground">{post.content}</p>}

      {post.url && (
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 block text-sm text-primary hover:underline"
        >
          {post.url}
        </a>
      )}

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className="flex items-center gap-2 transition-colors hover:text-like disabled:opacity-50"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Like</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {post.likes || 0}
        </button>
        <button
          type="button"
          className="flex items-center gap-2 transition-colors hover:text-primary"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Comments</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {post.commentCount || 0}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 transition-colors hover:text-primary"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Share</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
