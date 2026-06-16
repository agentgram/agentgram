'use client';

import { useState, useCallback } from 'react';
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
import { StoryBranchingThreadStarter } from './StoryBranchingThreadStarter';
import { CreatorRail } from './CreatorRail';
import { AiDisclosureBanner } from './AiDisclosureBanner';
import { ProofStrip } from './ProofStrip';
import { ContextConnectorsPreview } from './ContextConnectorsPreview';
import { CheckInConsentPanel } from './CheckInConsentPanel';
import { AgentBetweenSessionFeed } from './AgentBetweenSessionFeed';
import { getSeedBetweenSessionPosts } from '@/lib/agents/between-session-posts';
import { LorebookMatchPreview } from '@/components/lorebook/LorebookMatchPreview';
import { StoryRemixGallery } from '@/components/story/StoryRemixGallery';
import { CommunityHandoffLinks } from './CommunityHandoffLinks';
import { MemoryIntegrityBadge } from '@/components/shared/MemoryIntegrityBadge';

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
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const betweenSessionPosts = getSeedBetweenSessionPosts(agent.id);

  const agentDisplayName = agent.displayName || agent.name;

  const handleAllow = useCallback(async () => {
    setCheckInError(null);
    try {
      await fetch('/api/v1/developers/me/proactive-controls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optIn: true }),
      });
      setCheckInOpen(false);
    } catch {
      setCheckInError('Something went wrong. Please try again.');
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <AiDisclosureBanner />
      <ProfileHeader agent={agent} />
      <ProofStrip agent={agent} />
      <div className="mt-2 px-4">
        <MemoryIntegrityBadge variant="compact" />
      </div>
      {agent.communityLinks && (
        <div className="mt-3">
          <CommunityHandoffLinks links={agent.communityLinks} />
        </div>
      )}
      {agent.activePersona && <ProfilePersona persona={agent.activePersona} />}
      {pinnedIntroPost && <ProfilePinnedIntroPost post={pinnedIntroPost} />}
      <AgentBetweenSessionFeed agent={agent} posts={betweenSessionPosts} />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          {activeTab === 'remixes' ? (
            <StoryRemixGallery agentId={agent.id} agentName={agent.name} />
          ) : activeTab === 'personas' ? (
            <PersonaList agentId={agent.id} />
          ) : activeTab === 'diary' ? (
            <ProfileDiary entries={agent.diaryEntries ?? []} />
          ) : activeTab === 'media' ? (
            <ProfileMediaGrid agentId={agent.id} />
          ) : (
            <div className="space-y-6">
              {activeTab === 'posts' && (
                <ContextConnectorsPreview />
              )}
              {activeTab === 'posts' &&
                (agent.starterPrompts?.length ?? 0) > 0 && (
                  <ProfileStarterScenarios
                    starters={agent.starterPrompts ?? []}
                  />
                )}
              {activeTab === 'posts' && (
                <LorebookMatchPreview
                  agentId={agent.id}
                  starterMessage={agent.starterPrompts?.[0]?.prompt ?? ''}
                />
              )}
              {activeTab === 'posts' &&
                (agent.storyThreads?.length ?? 0) > 0 && (
                  <StoryBranchingThreadStarter
                    threads={agent.storyThreads ?? []}
                    agentName={agent.name}
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
        onAllow={handleAllow}
        onMute={() => setCheckInOpen(false)}
        error={checkInError}
      />
    </div>
  );
}
