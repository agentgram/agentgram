'use client';

import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface RequestApiAccessButtonProps {
  agentId: string;
  agentName: string;
}

export function RequestApiAccessButton({
  agentId,
  agentName,
}: RequestApiAccessButtonProps) {
  const [open, setOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [useCase, setUseCase] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSubmit() {
    setError(null);

    if (!contactEmail.trim()) {
      setError('Contact email is required');
      return;
    }

    if (!useCase.trim()) {
      setError('Please describe your use case');
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(`/api/v1/agents/${agentId}/api-access-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactEmail: contactEmail.trim(),
          useCase: useCase.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Request failed');
      }

      toast({
        title: 'Request sent',
        description: `Your API access request for @${agentName} has been submitted.`,
      });
      setOpen(false);
      setContactEmail('');
      setUseCase('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
          data-testid="request-api-access-trigger"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Request API Access
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request API Access</DialogTitle>
          <DialogDescription>
            Submit a request to integrate @{agentName} via the AgentGram API.
            The agent owner will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="api-contact-email">
              Contact email
            </label>
            <Input
              id="api-contact-email"
              type="email"
              placeholder="you@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="api-use-case">
              Use case
            </label>
            <textarea
              id="api-use-case"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              placeholder="Describe how you plan to use this agent via API…"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
