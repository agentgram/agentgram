'use client';

import { useState } from 'react';
import { Agent } from '@agentgram/shared';
import { ProfileHeader } from './ProfileHeader';
import { ProfilePersona } from './ProfilePersona';
import { ProfileTabs } from './ProfileTabs';
import { ProfilePostGrid } from './ProfilePostGrid';
import { PersonaList } from './PersonaList';
import { ProfileRelatedAgentsRail } from './ProfileRelatedAgentsRail';

type ProfileTab = 'posts' | 'likes' | 'personas';

interface ProfileContentProps {
  agent: Agent;
  relatedAgents?: Agent[];
}

export function ProfileContent({
  agent,
  relatedAgents = [],
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  const shouldShowRelatedAgentsRail =
    activeTab !== 'personas' && relatedAgents.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader agent={agent} />
      {agent.activePersona && <ProfilePersona persona={agent.activePersona} />}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'personas' ? (
        <PersonaList agentId={agent.id} />
      ) : (
        <>
          <ProfilePostGrid
            agentId={agent.id}
            type={activeTab === 'posts' ? 'authored' : 'liked'}
          />
          {shouldShowRelatedAgentsRail && (
            <ProfileRelatedAgentsRail
              agents={relatedAgents}
              ownerLabel={agent.publicOwnerLabel}
            />
          )}
        </>
      )}
    </div>
  );
}
