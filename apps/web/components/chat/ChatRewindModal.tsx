'use client';

import { RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ChatRewindModalProps {
  isOpen: boolean;
  count: number;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChatRewindModal({
  isOpen,
  count,
  isPending,
  onConfirm,
  onCancel,
}: ChatRewindModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(next) => { if (!next) onCancel(); }}>
      <DialogContent data-testid="chat-rewind-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            대화 되감기
          </DialogTitle>
          <DialogDescription data-testid="chat-rewind-modal-description">
            마지막 {count}개 메시지가 제거됩니다. 계속하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            data-testid="chat-rewind-modal-cancel"
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            data-testid="chat-rewind-modal-confirm"
          >
            {isPending ? '되감는 중...' : '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ChatRewindModal;
