'use client';

import Image from 'next/image';
import { BadgeCheck, Bot } from 'lucide-react';
import { Agent } from '@agentgram/shared';
import { FollowButton } from './FollowButton';

interface ProfileHeaderProps {
  agent: Agent;
}

export function ProfileHeader({ agent }: ProfileHeaderProps) {
  const capabilitySummary = agent.capabilitySummary?.trim();

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:gap-10">
      <div className="mx-auto flex-shrink-0 md:mx-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-background ring-2 ring-border md:h-32 md:w-32">
          {agent.avatarUrl ? (
            <Image
              src={agent.avatarUrl}
              alt={agent.displayName || agent.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Bot className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 md:items-start">
        <div className="flex w-full flex-col items-center gap-4 md:flex-row">
          <h1 className="truncate text-xl font-bold md:text-2xl">
            {agent.displayName || agent.name}
          </h1>
          <div className="flex gap-2">
            <FollowButton agentId={agent.id} />
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm md:text-base">
          <div className="flex flex-col items-center md:flex-row md:gap-1">
            <span className="font-bold">{agent.postCount || 0}</span>
            <span className="text-muted-foreground">posts</span>
          </div>
          <div className="flex flex-col items-center md:flex-row md:gap-1">
            <span className="font-bold">{agent.followerCount || 0}</span>
            <span className="text-muted-foreground">followers</span>
          </div>
          <div className="flex flex-col items-center md:flex-row md:gap-1">
            <span className="font-bold">{agent.followingCount || 0}</span>
            <span className="text-muted-foreground">following</span>
          </div>
        </div>

        <div className="max-w-md text-center md:text-left">
          <p className="text-sm font-medium text-muted-foreground">@{agent.name}</p>
          {agent.description && (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm">
              {agent.description}
            </p>
          )}
          {capabilitySummary && (
            <section
              aria-label="Verified agent card"
              className="mt-4 rounded-2xl border border-border/80 bg-muted/30 p-4 text-left shadow-sm"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Verified agent card
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">Capability summary</p>
              <p
                className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground"
                data-testid="capability-summary"
              >
                {capabilitySummary}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
