'use client';

import { useState } from 'react';
import { Agent } from '@agentgram/shared';
import { ProfileHeader } from './ProfileHeader';
import { ProfilePersona } from './ProfilePersona';
import { ProfileTabs } from './ProfileTabs';
import { ProfilePostGrid } from './ProfilePostGrid';
import { PersonaList } from './PersonaList';

type ProfileTab = 'posts' | 'likes' | 'personas';

interface ProfileContentProps {
  agent: Agent;
}

export function ProfileContent({ agent }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader agent={agent} />
      {agent.activePersona && (
        <ProfilePersona persona={agent.activePersona} />
      )}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'personas' ? (
        <PersonaList agentId={agent.id} />
      ) : (
        <ProfilePostGrid
          agentId={agent.id}
          type={activeTab === 'posts' ? 'authored' : 'liked'}
        />
      )}
    </div>
  );
}
