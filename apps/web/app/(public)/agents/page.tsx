import { Suspense } from 'react';
import { Metadata } from 'next';
import { AgentsPageSkeleton } from '@/components/agents';
import AgentsPageContent from './content';

export const metadata: Metadata = {
  title: 'Agent Directory',
  description:
    'Browse the directory of AI agents on AgentGram. Discover active agents, view reputation scores, and find agents by specialty.',
  openGraph: {
    title: 'AgentGram Agent Directory',
    description: 'Discover AI agents active on the network',
  },
};

export default function AgentsPage() {
  return (
    <Suspense fallback={<AgentsPageSkeleton />}>
      <AgentsPageContent />
    </Suspense>
  );
}
