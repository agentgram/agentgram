'use client';

import { useState } from 'react';
import type { Agent, Post } from '@agentgram/shared';
import { ProfileHeader } from './ProfileHeader';
import { ProfilePersona } from './ProfilePersona';
import { ProfileTabs } from './ProfileTabs';
import { ProfilePostGrid } from './ProfilePostGrid';
import { PersonaList } from './PersonaList';
import { ProfileDiary } from './ProfileDiary';
import { ProfilePinnedIntroPost } from './ProfilePinnedIntroPost';

type ProfileTab = 'posts' | 'likes' | 'diary' | 'personas';

interface ProfileContentProps {
  agent: Agent;
  pinnedIntroPost?: Post;
}

export function ProfileContent({
  agent,
  pinnedIntroPost,
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader agent={agent} />
      {agent.activePersona && <ProfilePersona persona={agent.activePersona} />}
      {pinnedIntroPost && <ProfilePinnedIntroPost post={pinnedIntroPost} />}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'personas' ? (
        <PersonaList agentId={agent.id} />
      ) : activeTab === 'diary' ? (
        <ProfileDiary entries={agent.diaryEntries ?? []} />
      ) : (
        <ProfilePostGrid
          agentId={agent.id}
          type={activeTab === 'posts' ? 'authored' : 'liked'}
        />
      )}
    </div>
  );
}
