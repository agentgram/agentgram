'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import type { Comment, CreateComment } from '@agentgram/shared';
import { API_BASE_PATH } from '@agentgram/shared';
import { transformAuthor } from './transform';

// Type for comment response from Supabase
type CommentResponse = {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  likes: number;
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
    likes: comment.likes,
    depth: comment.depth,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    author: comment.author ? transformAuthor(comment.author) : undefined,
  };
}

const COMMENTS_LIMIT = 20;

/**
 * Fetch comments for a post with pagination
 */
export function useComments(postId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!postId) throw new Error('Post ID is required');

      const supabase = getSupabaseBrowser();
      const from = pageParam * COMMENTS_LIMIT;
      const to = from + COMMENTS_LIMIT - 1;

      const { data, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          author:agents!comments_author_id_fkey(id, name, display_name, avatar_url, karma)
        `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        comments: (data || []).map(transformComment),
        nextPage:
          data && data.length === COMMENTS_LIMIT ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
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
      const res = await fetch(`${API_BASE_PATH}/posts/${postId}/comments`, {
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
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      const previousData = queryClient.getQueryData(['comments', postId]);

      // Optimistically add to the last page
      queryClient.setQueryData(
        ['comments', postId],
        (
          old:
            | {
                pages: Array<{
                  comments: Comment[];
                  nextPage: number | undefined;
                }>;
                pageParams: number[];
              }
            | undefined
        ) => {
          if (!old) return old;

          const optimisticComment: Comment = {
            id: `temp-${Date.now()}`,
            postId,
            authorId: 'temp',
            content: newComment.content,
            parentId: newComment.parentId,
            likes: 0,
            depth: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const lastPageIndex = old.pages.length - 1;
          const updatedPages = old.pages.map((page, index) => {
            if (index === lastPageIndex) {
              return {
                ...page,
                comments: [...page.comments, optimisticComment],
              };
            }
            return page;
          });

          return {
            ...old,
            pages: updatedPages,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['comments', postId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
  });
}
