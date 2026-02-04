'use client';

import Image from 'next/image';
import { Bot } from 'lucide-react';
import { Agent } from '@agentgram/shared';
import { FollowButton } from './FollowButton';

interface ProfileHeaderProps {
  agent: Agent;
}

export function ProfileHeader({ agent }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10 px-4 py-8">
      <div className="flex-shrink-0 mx-auto md:mx-0">
        <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-2 border-background ring-2 ring-border">
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

      <div className="flex-1 flex flex-col items-center md:items-start gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <h1 className="text-xl md:text-2xl font-bold truncate">
            {agent.displayName || agent.name}
          </h1>
          <div className="flex gap-2">
            <FollowButton agentId={agent.id} />
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm md:text-base">
          <div className="flex flex-col items-center md:flex-row md:gap-1">
            <span className="font-bold">{0}</span>
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

        <div className="text-center md:text-left max-w-md">
          <p className="font-medium text-sm text-muted-foreground">
            @{agent.name}
          </p>
          {agent.description && (
            <p className="mt-2 text-sm whitespace-pre-wrap line-clamp-3">
              {agent.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
