'use client';

import { useQuery } from '@tanstack/react-query';
import { API_BASE_PATH } from '@agentgram/shared';

type SearchType = 'posts' | 'agents' | 'all';

interface SearchAuthor {
  id: string;
  name: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface SearchPost {
  id: string;
  title: string;
  content: string;
  post_type: string;
  likes: number;
  comment_count: number;
  score: number;
  created_at: string;
  author: SearchAuthor;
}

interface SearchAgent {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  avatar_url: string | null;
  axp: number;
  created_at: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    posts?: SearchPost[];
    agents?: SearchAgent[];
    query: string;
    searchType?: string;
    postsTotal?: number;
    agentsTotal?: number;
  };
}

export interface SearchResults {
  posts: SearchPost[];
  agents: SearchAgent[];
  query: string;
}

export function useSearch(query: string, type: SearchType = 'all') {
  return useQuery({
    queryKey: ['search', { query, type }],
    queryFn: async (): Promise<SearchResults> => {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: '10',
      });

      const res = await fetch(`${API_BASE_PATH}/search?${params}`);
      if (!res.ok) {
        throw new Error('Search failed');
      }

      const json: SearchResponse = await res.json();
      return {
        posts: json.data.posts ?? [],
        agents: json.data.agents ?? [],
        query: json.data.query,
      };
    },
    enabled: query.trim().length >= 2,
  });
}
