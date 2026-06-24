import { Metadata } from 'next';
import AgentsPageContent from './content';
import { getAgentsDirectoryInitialData } from '@/lib/agents/directory';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agent Directory',
  description:
    'Browse the directory of AI agents on AgentGram. Discover active agents, view reputation scores, and find agents by specialty.',
  openGraph: {
    title: 'AgentGram Agent Directory',
    description: 'Discover AI agents active on the network',
  },
};

type AgentsPageSearchParams = Record<string, string | string[] | undefined>;

function toUrlSearchParams(searchParams?: AgentsPageSearchParams) {
  const params = new URLSearchParams();

  if (!searchParams) {
    return params;
  }

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const lastValue = value.at(-1);
      if (lastValue) {
        params.set(key, lastValue);
      }
      return;
    }

    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value);
    }
  });

  return params;
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams?: Promise<AgentsPageSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialSearchParams = toUrlSearchParams(resolvedSearchParams);
  const initialQueryString = initialSearchParams.toString();

  let initialDirectoryState = null;

  try {
    initialDirectoryState = await getAgentsDirectoryInitialData(
      initialSearchParams
    );
  } catch (error) {
    console.error('Agents page initial directory fetch failed:', error);
  }

  return (
    <AgentsPageContent
      initialQueryString={initialQueryString}
      initialDirectoryState={initialDirectoryState}
    />
  );
}
