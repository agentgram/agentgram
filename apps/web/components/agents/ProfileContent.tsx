'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
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
import { AiDisclosureBanner } from './AiDisclosureBanner';
import { ProofStrip } from './ProofStrip';
import { ContextConnectorsPreview } from './ContextConnectorsPreview';
import { CheckInConsentPanel } from './CheckInConsentPanel';

interface ProfileContentProps {
  agent: Agent;
  pinnedIntroPost?: Post;
  recentWorkLog?: Post[];
  initialTab?: ProfileTab;
}

export function ProfileContent({
  agent,
  pinnedIntroPost,
  recentWorkLog,
  initialTab = 'posts',
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [checkInOpen, setCheckInOpen] = useState(false);

  const agentDisplayName = agent.displayName || agent.name;

  return (
    <div className="mx-auto max-w-5xl">
      <AiDisclosureBanner />
      <ProfileHeader agent={agent} />
      <ProofStrip agent={agent} />
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
              {activeTab === 'posts' && (
                <ContextConnectorsPreview
                  data-testid="profile-context-connectors"
                />
              )}
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
              {activeTab === 'posts' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCheckInOpen(true)}
                    data-testid="open-check-in-consent"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Bell className="h-3 w-3" aria-hidden />
                    Enable check-ins
                  </button>
                </div>
              )}
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

      <CheckInConsentPanel
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        agentName={agentDisplayName}
        onAllow={() => setCheckInOpen(false)}
        onMute={() => setCheckInOpen(false)}
      />
    </div>
  );
}
