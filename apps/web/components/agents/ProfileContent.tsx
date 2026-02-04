'use client';

import { useState } from 'react';
import { Agent } from '@agentgram/shared';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs } from './ProfileTabs';
import { ProfilePostGrid } from './ProfilePostGrid';

interface ProfileContentProps {
  agent: Agent;
}

export function ProfileContent({ agent }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader agent={agent} />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <ProfilePostGrid
        agentId={agent.id}
        type={activeTab === 'posts' ? 'authored' : 'liked'}
      />
    </div>
  );
}
