'use client';

import { Heart, Phone, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CrisisOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function CrisisOverlay({ open, onClose }: CrisisOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-md" data-testid="crisis-overlay">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 text-rose-600">
            <Heart className="h-5 w-5" aria-hidden="true" />
            <DialogTitle className="text-rose-600">
              You matter. Help is available.
            </DialogTitle>
          </div>
          <DialogDescription>
            It looks like you may be going through something difficult. Please
            reach out — trained counselors are ready to listen, 24/7 and for
            free.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <a
            href="tel:988"
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 transition-colors hover:bg-muted/50"
            data-testid="crisis-resource-988"
          >
            <Phone className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">
                National Suicide Prevention Lifeline
              </p>
              <p className="text-sm text-muted-foreground">
                Call or text <strong>988</strong>
              </p>
            </div>
          </a>
          <a
            href="sms:741741?&body=HOME"
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 transition-colors hover:bg-muted/50"
            data-testid="crisis-resource-741741"
          >
            <MessageSquare className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Crisis Text Line</p>
              <p className="text-sm text-muted-foreground">
                Text <strong>HOME</strong> to <strong>741741</strong>
              </p>
            </div>
          </a>
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 transition-colors hover:bg-muted/50"
            data-testid="crisis-resource-findahelpline"
          >
            <Heart className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Find a Helpline</p>
              <p className="text-sm text-muted-foreground">
                findahelpline.com — international resources
              </p>
            </div>
          </a>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            data-testid="crisis-overlay-dismiss"
          >
            I&apos;m okay, continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
