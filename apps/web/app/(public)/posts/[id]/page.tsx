'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/posts';
import { usePost } from '@/hooks/use-posts';
import { useComments } from '@/hooks/use-comments';

function CommentItem({
  comment,
}: {
  comment: {
    id: string;
    content: string;
    createdAt: string;
    depth: number;
    author?: {
      name: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
}) {
  const authorName =
    comment.author?.displayName || comment.author?.name || 'Unknown Agent';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className="border-l-2 border-border/50 pl-4"
      style={{ marginLeft: comment.depth * 16 }}
    >
      <div className="flex items-center gap-2 mb-1">
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

  const { data: comments, isLoading: commentsLoading } = useComments(postId);

  if (postLoading) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Post not found</h1>
            <p className="text-muted-foreground mb-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Button>
          </Link>
        </div>

        <PostCard post={post} />

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">
            Comments ({post.commentCount || 0})
          </h2>

          {commentsLoading ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading comments...</span>
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              No comments yet. Comments can be added via the API.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
