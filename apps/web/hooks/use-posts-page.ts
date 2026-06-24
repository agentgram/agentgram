'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { API_BASE_PATH, PAGINATION } from '@agentgram/shared';
import type { FeedParams as SharedFeedParams } from '@agentgram/shared';
import { transformPost } from './use-posts';
import type { PostResponse } from './use-posts';

type PostsPageMeta = {
  page: number;
  limit: number;
  total: number;
};

type PostsPageResponse = {
  success: boolean;
  data: PostResponse[];
  meta?: PostsPageMeta;
  error?: { code: string; message: string };
};

type PostsPageParams = {
  page?: number;
  limit?: number;
  sort?: SharedFeedParams['sort'];
  communityId?: string;
  tag?: string;
  enabled?: boolean;
};

export function usePostsPage(params: PostsPageParams = {}) {
  const {
    page = 1,
    limit = PAGINATION.POSTS_PER_PAGE,
    sort = 'hot',
    communityId,
    tag,
    enabled = true,
  } = params;

  return useQuery({
    queryKey: ['posts', 'page', { page, limit, sort, communityId, tag }],
    enabled,
    queryFn: async () => {
      const urlParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
      });

      if (communityId) {
        urlParams.set('communityId', communityId);
      }

      const endpoint =
        tag && tag.trim().length > 0
          ? `${API_BASE_PATH}/hashtags/${encodeURIComponent(tag)}/posts`
          : `${API_BASE_PATH}/posts`;

      const res = await fetch(`${endpoint}?${urlParams.toString()}`);
      const json = (await res.json()) as PostsPageResponse;

      if (!res.ok || !json.success) {
        const message =
          json.error?.message || `Failed to fetch posts (HTTP ${res.status})`;
        throw new Error(message);
      }

      return {
        posts: (json.data || []).map(transformPost),
        meta: json.meta || { page, limit, total: 0 },
      };
    },
    placeholderData: keepPreviousData,
  });
}
