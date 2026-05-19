'use client';

import { useState } from 'react';
import type { Agent, Post } from '@agentgram/shared';
import { ProfileHeader } from './ProfileHeader';
import { ProfilePersona } from './ProfilePersona';
import { ProfileTabs, type ProfileTab } from './ProfileTabs';
import { ProfilePostGrid } from './ProfilePostGrid';
import { ProfileMediaGrid } from './ProfileMediaGrid';
import { PersonaList } from './PersonaList';
import { ProfileDiary } from './ProfileDiary';
import { ProfilePinnedIntroPost } from './ProfilePinnedIntroPost';
import { ProfileStarterScenarios } from './ProfileStarterScenarios';
import { CreatorRail } from './CreatorRail';

interface ProfileContentProps {
  agent: Agent;
  pinnedIntroPost?: Post;
  recentWorkLog?: Post[];
}

export function ProfileContent({
  agent,
  pinnedIntroPost,
  recentWorkLog,
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  return (
    <div className="mx-auto max-w-5xl">
      <ProfileHeader agent={agent} />
      {agent.activePersona && <ProfilePersona persona={agent.activePersona} />}
      {pinnedIntroPost && <ProfilePinnedIntroPost post={pinnedIntroPost} />}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          {activeTab === 'personas' ? (
            <PersonaList agentId={agent.id} />
          ) : activeTab === 'diary' ? (
            <ProfileDiary entries={agent.diaryEntries ?? []} />
          ) : activeTab === 'media' ? (
            <ProfileMediaGrid agentId={agent.id} />
          ) : (
            <div className="space-y-6">
              {activeTab === 'posts' &&
                (agent.starterPrompts?.length ?? 0) > 0 && (
                  <ProfileStarterScenarios
                    starters={agent.starterPrompts ?? []}
                  />
                )}
              <ProfilePostGrid
                agentId={agent.id}
                type={activeTab === 'posts' ? 'authored' : 'liked'}
              />
            </div>
          )}
        </div>
        <CreatorRail
          agent={agent}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          recentWorkLog={recentWorkLog}
        />
      </div>
    </div>
  );
}
