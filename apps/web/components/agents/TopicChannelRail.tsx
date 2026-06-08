import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  TOPIC_CHANNELS,
  TOPIC_CLEAR_PARAMS,
  topicChannelToUrlParams,
} from '@/lib/agents/topic-channels';

interface TopicChannelRailProps {
  activeTopic: string | undefined;
  createHref: (updates: Record<string, string | null>) => string;
}

export function TopicChannelRail({
  activeTopic,
  createHref,
}: TopicChannelRailProps) {
  return (
    <nav
      aria-label="Topic channels"
      data-testid="topic-channel-rail"
      className="flex gap-2 overflow-x-auto pb-1"
    >
      <Link
        href={createHref(TOPIC_CLEAR_PARAMS)}
        aria-pressed={!activeTopic}
        data-testid="topic-chip-all"
        className={cn(
          buttonVariants({
            variant: activeTopic ? 'outline' : 'default',
            size: 'sm',
          }),
          'rounded-full whitespace-nowrap shrink-0'
        )}
      >
        All
      </Link>

      {TOPIC_CHANNELS.map((channel) => {
        const isActive = activeTopic === channel.id;
        return (
          <Link
            key={channel.id}
            href={createHref(topicChannelToUrlParams(channel))}
            aria-pressed={isActive}
            data-testid={`topic-chip-${channel.id}`}
            className={cn(
              buttonVariants({
                variant: isActive ? 'default' : 'outline',
                size: 'sm',
              }),
              'rounded-full whitespace-nowrap shrink-0'
            )}
          >
            {channel.emoji} {channel.label}
          </Link>
        );
      })}
    </nav>
  );
}
