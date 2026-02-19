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
  AxBaseline,
  AxAlert,
  AxCompetitorSet,
  AxCompetitorSite,
  AxMonthlyReport,
  CreateBaselineRequest,
  UpdateAlertRequest,
  CreateCompetitorSetRequest,
  CompetitorComparisonResponse,
  GenerateMonthlyReportRequest,
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

// ============================================================
// V2 Hooks: Baselines, Alerts, Competitors, Monthly Reports
// ============================================================

/**
 * Query: GET /ax-score/baselines
 */
export function useAxBaselines(siteId?: string) {
  return useQuery({
    queryKey: ['ax-baselines', { siteId }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (siteId) params.set('siteId', siteId);
      return apiFetch<AxBaseline[]>(
        `${API_BASE_PATH}/ax-score/baselines?${params.toString()}`
      );
    },
  });
}

/**
 * Mutation: POST /ax-score/baselines
 */
export function useAxCreateBaseline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBaselineRequest) =>
      apiFetch<AxBaseline>(`${API_BASE_PATH}/ax-score/baselines`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ax-baselines'] });
    },
  });
}

/**
 * Query: GET /ax-score/alerts
 */
export function useAxAlerts(params: {
  status?: string;
  siteId?: string;
  page?: number;
  enabled?: boolean;
}) {
  const { status, siteId, page = 1, enabled = true } = params;

  return useQuery({
    queryKey: ['ax-alerts', { status, siteId, page }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      if (status) searchParams.set('status', status);
      if (siteId) searchParams.set('siteId', siteId);

      const res = await fetch(
        `${API_BASE_PATH}/ax-score/alerts?${searchParams.toString()}`
      );
      const json: ApiResult<AxAlert[]> = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to fetch alerts');
      }
      return { data: json.data || [], meta: json.meta };
    },
    enabled,
  });
}

/**
 * Mutation: PATCH /ax-score/alerts/:id
 */
export function useAxUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAlertRequest & { id: string }) =>
      apiFetch<AxAlert>(`${API_BASE_PATH}/ax-score/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ax-alerts'] });
    },
  });
}

/**
 * Query: GET /ax-score/competitors
 */
export function useAxCompetitorSets() {
  return useQuery({
    queryKey: ['ax-competitor-sets'],
    queryFn: () =>
      apiFetch<AxCompetitorSet[]>(`${API_BASE_PATH}/ax-score/competitors`),
  });
}

/**
 * Query: GET /ax-score/competitors/:id
 */
export function useAxCompetitorSet(setId: string) {
  return useQuery({
    queryKey: ['ax-competitor-set', setId],
    queryFn: () =>
      apiFetch<AxCompetitorSet & { sites: AxCompetitorSite[] }>(
        `${API_BASE_PATH}/ax-score/competitors/${setId}`
      ),
    enabled: !!setId,
  });
}

/**
 * Mutation: POST /ax-score/competitors
 */
export function useAxCreateCompetitorSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompetitorSetRequest) =>
      apiFetch<AxCompetitorSet>(`${API_BASE_PATH}/ax-score/competitors`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ax-competitor-sets'] });
    },
  });
}

/**
 * Mutation: DELETE /ax-score/competitors/:id
 */
export function useAxDeleteCompetitorSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setId: string) =>
      apiFetch<{ deleted: boolean }>(
        `${API_BASE_PATH}/ax-score/competitors/${setId}`,
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ax-competitor-sets'] });
    },
  });
}

/**
 * Mutation: POST /ax-score/competitors/:id/compare
 */
export function useAxRunComparison(setId: string) {
  return useMutation({
    mutationFn: () =>
      apiFetch<CompetitorComparisonResponse>(
        `${API_BASE_PATH}/ax-score/competitors/${setId}/compare`,
        { method: 'POST' }
      ),
  });
}

/**
 * Mutation: POST /ax-score/competitors/:id/sites
 */
export function useAxAddCompetitorSite(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { url: string; name?: string }) =>
      apiFetch<AxCompetitorSite>(
        `${API_BASE_PATH}/ax-score/competitors/${setId}/sites`,
        { method: 'POST', body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ax-competitor-set', setId],
      });
    },
  });
}

/**
 * Mutation: DELETE /ax-score/competitors/:id/sites/:siteId
 */
export function useAxRemoveCompetitorSite(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (siteId: string) =>
      apiFetch<{ deleted: boolean }>(
        `${API_BASE_PATH}/ax-score/competitors/${setId}/sites/${siteId}`,
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ax-competitor-set', setId],
      });
    },
  });
}

/**
 * Query: GET /ax-score/monthly-reports
 */
export function useAxMonthlyReports(params: {
  siteId?: string;
  page?: number;
  enabled?: boolean;
}) {
  const { siteId, page = 1, enabled = true } = params;

  return useQuery({
    queryKey: ['ax-monthly-reports', { siteId, page }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      if (siteId) searchParams.set('siteId', siteId);

      const res = await fetch(
        `${API_BASE_PATH}/ax-score/monthly-reports?${searchParams.toString()}`
      );
      const json: ApiResult<AxMonthlyReport[]> = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to fetch reports');
      }
      return { data: json.data || [], meta: json.meta };
    },
    enabled,
  });
}

/**
 * Mutation: POST /ax-score/monthly-reports
 */
export function useAxGenerateMonthlyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateMonthlyReportRequest) =>
      apiFetch<AxMonthlyReport>(
        `${API_BASE_PATH}/ax-score/monthly-reports`,
        { method: 'POST', body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ax-monthly-reports'] });
    },
  });
}

/**
 * Query: GET /ax-score/monthly-reports/:id
 */
export function useAxMonthlyReport(reportId: string) {
  return useQuery({
    queryKey: ['ax-monthly-report', reportId],
    queryFn: () =>
      apiFetch<AxMonthlyReport>(
        `${API_BASE_PATH}/ax-score/monthly-reports/${reportId}`
      ),
    enabled: !!reportId,
  });
}
