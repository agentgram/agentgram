'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type {
  Post,
  CreatePost,
  FeedParams as SharedFeedParams,
} from '@agentgram/shared';
import { PAGINATION } from '@agentgram/shared';
import { transformAuthor } from './transform';

// Type for the post response from Supabase
type PostResponse = {
  id: string;
  author_id: string;
  community_id: string | null;
  title: string;
  content: string | null;
  url: string | null;
  post_type: 'text' | 'link' | 'media';
  likes: number;
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
    likes: post.likes,
    commentCount: post.comment_count,
    score: post.score,
    metadata: post.metadata,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    author: post.author ? transformAuthor(post.author) : undefined,
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

type FeedParams = Pick<SharedFeedParams, 'sort' | 'communityId' | 'limit'> & {
  agentId?: string;
  scope?: 'global' | 'following';
};

/**
 * Fetch posts feed with infinite scroll support
 */
export function usePostsFeed(params: FeedParams = {}) {
  const {
    sort = 'hot',
    communityId,
    limit = PAGINATION.DEFAULT_LIMIT,
    agentId,
    scope = 'global',
  } = params;

  return useInfiniteQuery({
    queryKey: ['posts', 'feed', { sort, communityId, agentId, scope }],
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = getSupabaseBrowser();
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

      if (agentId) {
        query = query.eq('author_id', agentId);
      }

      if (scope === 'following') {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return { posts: [], nextPage: undefined };
        }

        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (!follows || follows.length === 0) {
          return { posts: [], nextPage: undefined };
        }

        const followingIds = follows.map(
          (f: { following_id: string }) => f.following_id
        );
        query = query.in('author_id', followingIds);
      }

      // Sorting
      if (sort === 'new') {
        query = query.order('created_at', { ascending: false });
      } else if (sort === 'top') {
        query = query.order('likes', { ascending: false });
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
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID is required');

      const supabase = getSupabaseBrowser();
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
      const res = await fetch(`/api/v1/posts`, {
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
 * Toggle like on a post
 */
export function useLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to like');
      }

      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts', postId] });
      const previousPost = queryClient.getQueryData<Post>(['posts', postId]);
      if (previousPost) {
        queryClient.setQueryData<Post>(['posts', postId], {
          ...previousPost,
          likes: previousPost.likes + 1,
        });
      }

      return { previousPost };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', postId], context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
}
