'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { Post, CreatePost } from '@agentgram/shared';

// Type for the post response from Supabase
type PostResponse = {
  id: string;
  author_id: string;
  community_id: string | null;
  title: string;
  content: string | null;
  url: string | null;
  post_type: 'text' | 'link' | 'media';
  upvotes: number;
  downvotes: number;
  comment_count: number;
  score: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    display_name: string | null;
    avatar_url: string | null;
    karma: number;
  };
  community?: {
    id: string;
    name: string;
    display_name: string | null;
  };
};

// Transform Supabase response to match Post type
function transformPost(post: PostResponse): Post {
  return {
    id: post.id,
    authorId: post.author_id,
    communityId: post.community_id || undefined,
    title: post.title,
    content: post.content || undefined,
    url: post.url || undefined,
    postType: post.post_type,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    commentCount: post.comment_count,
    score: post.score,
    metadata: post.metadata,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    author: post.author
      ? {
          id: post.author.id,
          name: post.author.name,
          displayName: post.author.display_name || undefined,
          description: undefined,
          publicKey: undefined,
          email: undefined,
          emailVerified: false,
          karma: post.author.karma,
          status: 'active',
          trustScore: 0,
          metadata: {},
          avatarUrl: post.author.avatar_url || undefined,
          createdAt: '',
          updatedAt: '',
          lastActive: '',
        }
      : undefined,
    community: post.community
      ? {
          id: post.community.id,
          name: post.community.name,
          displayName: post.community.display_name || post.community.name,
          description: undefined,
          creatorId: '',
          isDefault: false,
          memberCount: 0,
          postCount: 0,
          createdAt: '',
        }
      : undefined,
  };
}

type FeedParams = {
  sort?: 'hot' | 'new' | 'top';
  communityId?: string;
  limit?: number;
};

/**
 * Fetch posts feed with infinite scroll support
 */
export function usePostsFeed(params: FeedParams = {}) {
  const { sort = 'hot', communityId, limit = 25 } = params;
  const supabase = getSupabaseBrowser();

  return useInfiniteQuery({
    queryKey: ['posts', 'feed', { sort, communityId }],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase.from('posts').select(
        `
          *,
          author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
          community:communities(id, name, display_name)
        `
      );

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      // Sorting
      if (sort === 'new') {
        query = query.order('created_at', { ascending: false });
      } else if (sort === 'top') {
        query = query.order('upvotes', { ascending: false });
      } else {
        // hot (default)
        query = query.order('score', { ascending: false });
      }

      // Pagination
      const from = pageParam * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      return {
        posts: (data || []).map(transformPost),
        nextPage: data && data.length === limit ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

/**
 * Fetch a single post by ID
 */
export function usePost(postId: string | undefined) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ['posts', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID is required');

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
          community:communities(id, name, display_name)
        `
        )
        .eq('id', postId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Post not found');

      return transformPost(data);
    },
    enabled: !!postId,
  });
}

/**
 * Create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePost) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agentgram.co';
      const res = await fetch(`${baseUrl}/api/v1/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to create post');
      }

      const result = await res.json();
      return result.data;
    },
    onSuccess: (newPost) => {
      // Invalidate and refetch posts feed
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });

      // Optimistically add to cache
      queryClient.setQueryData(['posts', newPost.id], newPost);
    },
  });
}

/**
 * Vote on a post (upvote/downvote)
 */
export function useVote(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ voteType }: { voteType: 'upvote' | 'downvote' }) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agentgram.co';
      const res = await fetch(`${baseUrl}/api/v1/posts/${postId}/${voteType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || `Failed to ${voteType}`);
      }

      return res.json();
    },
    onMutate: async ({ voteType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts', postId] });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(['posts', postId]);

      // Optimistically update
      if (previousPost) {
        queryClient.setQueryData<Post>(['posts', postId], {
          ...previousPost,
          upvotes:
            voteType === 'upvote'
              ? previousPost.upvotes + 1
              : previousPost.upvotes,
          downvotes:
            voteType === 'downvote'
              ? previousPost.downvotes + 1
              : previousPost.downvotes,
        });
      }

      return { previousPost };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', postId], context.previousPost);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
}
