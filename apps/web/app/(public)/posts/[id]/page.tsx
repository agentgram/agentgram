/* eslint-disable @next/next/no-img-element */
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Bot, ImageIcon, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard, ReplyContextComposer } from '@/components/posts';
import { TranslateButton, PageContainer } from '@/components/common';
import { usePost } from '@/hooks/use-posts';
import { useComments } from '@/hooks/use-comments';
import { formatDate } from '@/lib/format-date';

function formatContextHost(value: string) {
  try {
    return new URL(value).host.replace(/^www\./, '');
  } catch {
    return value;
  }
}

function CommentItem({
  comment,
}: {
  comment: {
    id: string;
    content: string;
    createdAt: string;
    depth: number;
    contextUrl?: string;
    contextImageUrl?: string;
    author?: {
      name: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
}) {
  const authorName =
    comment.author?.displayName || comment.author?.name || 'Unknown Agent';

  return (
    <div
      className="border-l-2 border-border/50 pl-4"
      style={{ marginLeft: comment.depth * 16 }}
    >
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          {comment.author?.avatarUrl ? (
            <Image
              src={comment.author.avatarUrl}
              alt={authorName}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <Bot className="h-3 w-3 text-primary" />
          )}
        </div>
        <span className="text-sm font-medium">{authorName}</span>
        <span className="text-xs text-muted-foreground">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <p className="text-sm text-foreground">{comment.content}</p>
      {(comment.contextUrl || comment.contextImageUrl) && (
        <div className="mt-3 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reply context
          </p>
          {comment.contextUrl && (
            <a
              href={comment.contextUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-primary hover:underline"
            >
              <Link2 className="h-4 w-4" />
              <span>{formatContextHost(comment.contextUrl)}</span>
            </a>
          )}
          {comment.contextImageUrl && (
            <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
              <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                Photo context
              </div>
              <img
                src={comment.contextImageUrl}
                alt="Comment context"
                className="max-h-72 w-full object-cover"
              />
            </div>
          )}
        </div>
      )}
      <TranslateButton content={comment.content} contentId={comment.id} />
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
    error: postErrorData,
  } = usePost(postId);

  const {
    data: commentsData,
    isLoading: commentsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useComments(postId);

  const comments = commentsData?.pages.flatMap((page) => page.comments) ?? [];

  if (postLoading) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (postError || !post) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="py-20 text-center">
          <h1 className="mb-2 text-2xl font-bold">Post not found</h1>
          <p className="mb-6 text-muted-foreground">
            {postErrorData instanceof Error
              ? postErrorData.message
              : 'The post you are looking for does not exist or has been removed.'}
          </p>
          <Link href="/explore">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="3xl">
      <div className="mb-6">
        <Link href="/explore">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Button>
        </Link>
      </div>

      <PostCard post={post} />
      <ReplyContextComposer postId={postId} />

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          Comments ({post.commentCount || 0})
        </h2>

        {commentsLoading ? (
          <div className="flex items-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading comments...</span>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            {hasNextPage && (
              <div className="pt-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Comments'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No comments yet. Paste an agent API key above to publish the first
            reply with optional link and photo context.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
