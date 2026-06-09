'use client';

import { Eye, Lock, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface GroupMemoryInspectorParticipant {
  agentId: string;
  agentName: string;
  privateFacts: string[];
  sharedFacts: string[];
}

export interface GroupMemoryInspectorProps {
  participants: GroupMemoryInspectorParticipant[];
  isOpen: boolean;
  onClose: () => void;
}

function FactChip({
  label,
  variant,
}: {
  label: string;
  variant: 'private' | 'shared';
}) {
  if (variant === 'private') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
        data-testid="fact-chip-private"
      >
        <Lock className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
        {label}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
      data-testid="fact-chip-shared"
    >
      <Eye className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

function ParticipantSection({
  participant,
}: {
  participant: GroupMemoryInspectorParticipant;
}) {
  const hasPrivate = participant.privateFacts.length > 0;
  const hasShared = participant.sharedFacts.length > 0;
  const isEmpty = !hasPrivate && !hasShared;

  return (
    <div
      className="rounded-lg border border-border/60 bg-background p-3 space-y-3"
      data-testid={`memory-inspector-participant-${participant.agentName}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{participant.agentName}</span>
        <span className="text-xs text-muted-foreground">
          @{participant.agentId}
        </span>
      </div>

      {isEmpty ? (
        <p
          className="text-xs text-muted-foreground"
          data-testid={`memory-inspector-empty-${participant.agentName}`}
        >
          No memory facts available.
        </p>
      ) : (
        <>
          {hasShared && (
            <div
              className="space-y-1.5"
              data-testid={`memory-inspector-shared-${participant.agentName}`}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Shared (all participants)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {participant.sharedFacts.map((fact, i) => (
                  <FactChip key={i} label={fact} variant="shared" />
                ))}
              </div>
            </div>
          )}
          {hasPrivate && (
            <div
              className="space-y-1.5"
              data-testid={`memory-inspector-private-${participant.agentName}`}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Private (only this agent)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {participant.privateFacts.map((fact, i) => (
                  <FactChip key={i} label={fact} variant="private" />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function GroupMemoryInspector({
  participants,
  isOpen,
  onClose,
}: GroupMemoryInspectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent data-testid="group-memory-inspector-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden="true" />
            메모리 미리보기
          </DialogTitle>
          <DialogDescription>
            그룹 채팅 시작 전 각 에이전트의 사전·공유 메모리를 확인합니다.
          </DialogDescription>
        </DialogHeader>

        {participants.length === 0 ? (
          <p
            className="py-6 text-center text-sm text-muted-foreground"
            data-testid="memory-inspector-no-participants"
          >
            참가자가 없습니다.
          </p>
        ) : (
          <div
            className="max-h-96 space-y-3 overflow-y-auto pr-0.5"
            data-testid="memory-inspector-participant-list"
          >
            {participants.map((p) => (
              <ParticipantSection key={p.agentId} participant={p} />
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="memory-inspector-close"
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GroupMemoryInspector;
