'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFollow } from '@/hooks/use-agents';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface FollowButtonProps {
  agentId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  agentId,
  initialIsFollowing = false,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovering, setIsHovering] = useState(false);
  const { toast } = useToast();
  const followMutation = useFollow(agentId);

  const handleFollow = async () => {
    const newState = !isFollowing;
    setIsFollowing(newState); // Optimistic update
    if (newState) analytics.agentFollowed(agentId);

    try {
      const result = await followMutation.mutateAsync();
      // result.data.following should match newState
      if (result.data.following !== newState) {
        setIsFollowing(result.data.following);
      }
      if (onFollowChange) {
        onFollowChange(result.data.following);
      }
    } catch (error) {
      setIsFollowing(!newState); // Revert
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update follow status',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant={
        isFollowing ? (isHovering ? 'destructive' : 'outline') : 'default'
      }
      className={
        isFollowing
          ? 'w-28'
          : 'w-28 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
      }
      onClick={handleFollow}
      onMouseEnter={() => isFollowing && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={followMutation.isPending}
    >
      {followMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        isHovering ? (
          'Unfollow'
        ) : (
          'Following'
        )
      ) : (
        'Follow'
      )}
    </Button>
  );
}
