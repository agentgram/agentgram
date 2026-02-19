'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_PATH } from '@agentgram/shared';
import type {
  ScanRequest,
  ScanResponse,
  SimulateRequest,
  SimulateResponse,
  GenerateLlmsTxtRequest,
  GenerateLlmsTxtResponse,
  AxUsage,
} from '@agentgram/shared';

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { page?: number; limit?: number; total?: number };
}

async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const json: ApiResult<T> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error?.message || 'Request failed');
  }
  return json.data;
}

/**
 * Mutation: POST /ax-score/scan
 */
export function useAxScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScanRequest) =>
      apiFetch<ScanResponse>(`${API_BASE_PATH}/ax-score/scan`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ax-reports'] });
      queryClient.invalidateQueries({ queryKey: ['ax-usage'] });
    },
  });
}

/**
 * Mutation: POST /ax-score/simulate
 */
export function useAxSimulate() {
  return useMutation({
    mutationFn: (data: SimulateRequest) =>
      apiFetch<SimulateResponse>(`${API_BASE_PATH}/ax-score/simulate`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

/**
 * Mutation: POST /ax-score/generate-llmstxt
 */
export function useAxGenerateLlmsTxt() {
  return useMutation({
    mutationFn: (data: GenerateLlmsTxtRequest) =>
      apiFetch<GenerateLlmsTxtResponse>(
        `${API_BASE_PATH}/ax-score/generate-llmstxt`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
  });
}

// Scan list item shape from reports endpoint
interface ScanListItem {
  id: string;
  siteId: string;
  url: string;
  score: number;
  categoryScores: Record<string, number>;
  scanType: string;
  status: string;
  durationMs: number | null;
  createdAt: string;
}

/**
 * Query: GET /ax-score/reports
 */
export function useAxReports(params?: {
  siteId?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) {
  const { siteId, page = 1, limit = 10, enabled = true } = params || {};

  return useQuery({
    queryKey: ['ax-reports', { siteId, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      searchParams.set('limit', String(limit));
      if (siteId) searchParams.set('siteId', siteId);

      const res = await fetch(
        `${API_BASE_PATH}/ax-score/reports?${searchParams.toString()}`
      );
      const json: ApiResult<ScanListItem[]> = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to fetch reports');
      }
      return { data: json.data || [], meta: json.meta };
    },
    enabled,
  });
}

/**
 * Query: GET current month usage (derived from reports or a dedicated endpoint)
 * For now, we just fetch usage data from the scan endpoint's headers.
 * A lightweight version.
 */
export function useAxUsage(enabled = true) {
  return useQuery({
    queryKey: ['ax-usage'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_PATH}/ax-score/reports?limit=1`);
      const json = await res.json();
      // Usage is tracked server-side; we expose a minimal check
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to fetch usage');
      }
      return json.data as AxUsage | null;
    },
    enabled,
    staleTime: 30_000,
  });
}
