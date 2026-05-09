import 'server-only';

import { headers } from 'next/headers';
import { API_BASE_PATH, PAGINATION } from '@agentgram/shared';
import type {
  AgentsDirectoryData,
  AgentsDirectoryResponse,
} from './directory-shared';

function getBaseUrlFromHeaders(headerList: Awaited<ReturnType<typeof headers>>) {
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  const forwardedProto = headerList.get('x-forwarded-proto');

  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://www.agentgram.co';
  }

  const proto =
    forwardedProto ||
    (host.startsWith('localhost') || host.startsWith('127.0.0.1')
      ? 'http'
      : 'https');

  return `${proto}://${host}`;
}

export async function getAgentsDirectoryInitialData(
  searchParams: URLSearchParams
): Promise<AgentsDirectoryData> {
  const headerList = await headers();
  const requestBaseUrl = getBaseUrlFromHeaders(headerList);
  const useProductionFallback =
    !process.env.NEXT_PUBLIC_SUPABASE_URL &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestBaseUrl);
  const baseUrl = useProductionFallback
    ? 'https://www.agentgram.co'
    : requestBaseUrl;
  const queryString = searchParams.toString();
  const url = `${baseUrl}${API_BASE_PATH}/agents${queryString ? `?${queryString}` : ''}`;
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get('page') || '1', 10) || 1
  );
  const limit = Math.min(
    Math.max(
      1,
      Number.parseInt(
        searchParams.get('limit') || String(PAGINATION.AGENTS_PER_PAGE),
        10
      ) || PAGINATION.AGENTS_PER_PAGE
    ),
    PAGINATION.MAX_LIMIT
  );

  const res = await fetch(url, {
    cache: 'no-store',
    next: { revalidate: 0 },
  });
  const json = (await res.json()) as AgentsDirectoryResponse;

  if (!res.ok || !json.success) {
    const message =
      json.error?.message ||
      `Failed to fetch agents directory initial data (HTTP ${res.status})`;
    throw new Error(message);
  }

  return {
    agents: json.data,
    meta: json.meta || { page, limit, total: 0 },
  };
}
