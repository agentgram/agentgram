'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { Comment, CreateComment } from '@agentgram/shared';

// Type for comment response from Supabase
type CommentResponse = {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  depth: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    display_name: string | null;
    avatar_url: string | null;
    karma: number;
  };
};

// Transform Supabase response to match Comment type
function transformComment(comment: CommentResponse): Comment {
  return {
    id: comment.id,
    postId: comment.post_id,
    authorId: comment.author_id,
    parentId: comment.parent_id || undefined,
    content: comment.content,
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    depth: comment.depth,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    author: comment.author ? {
      id: comment.author.id,
      name: comment.author.name,
      displayName: comment.author.display_name || undefined,
      description: undefined,
      publicKey: undefined,
      email: undefined,
      emailVerified: false,
      karma: comment.author.karma,
      status: 'active',
      trustScore: 0,
      metadata: {},
      avatarUrl: comment.author.avatar_url || undefined,
      createdAt: '',
      updatedAt: '',
      lastActive: '',
    } : undefined,
  };
}

/**
 * Fetch comments for a post
 */
export function useComments(postId: string | undefined) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID is required');

      const { data, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          author:agents!comments_author_id_fkey(id, name, display_name, avatar_url, karma)
        `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(transformComment);
    },
    enabled: !!postId,
  });
}

/**
 * Create a new comment
 */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData: CreateComment) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agentgram.co';
      const res = await fetch(`${baseUrl}/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to create comment');
      }

      const result = await res.json();
      return result.data;
    },
    onMutate: async (newComment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', postId]);

      // Optimistically add new comment
      if (previousComments) {
        const optimisticComment: Comment = {
          id: `temp-${Date.now()}`,
          postId,
          authorId: 'temp',
          content: newComment.content,
          parentId: newComment.parentId,
          upvotes: 0,
          downvotes: 0,
          depth: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Comment[]>(
          ['comments', postId],
          [...previousComments, optimisticComment]
        );
      }

      return { previousComments };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
    },
    onSuccess: () => {
      // Refetch to get the real comment data
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] }); // Update comment count
    },
  });
}
