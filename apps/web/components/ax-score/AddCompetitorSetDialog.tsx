'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
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
import { useAxCreateCompetitorSet } from '@/hooks/use-ax-score';

export function AddCompetitorSetDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [urls, setUrls] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createSet = useAxCreateCompetitorSet();

  function handleSubmit() {
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const urlList = urls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    if (urlList.length === 0) {
      setError('At least one URL is required');
      return;
    }

    createSet.mutate(
      {
        name: name.trim(),
        industry: industry.trim() || undefined,
        urls: urlList,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
          setIndustry('');
          setUrls('');
        },
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          New Set
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Competitor Set</DialogTitle>
          <DialogDescription>
            Add URLs to compare against your sites.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="set-name">
              Name
            </label>
            <Input
              id="set-name"
              placeholder="e.g., SaaS Competitors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="set-industry">
              Industry (optional)
            </label>
            <Input
              id="set-industry"
              placeholder="e.g., Developer Tools"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="set-urls">
              URLs (one per line)
            </label>
            <textarea
              id="set-urls"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={'https://competitor1.com\nhttps://competitor2.com'}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createSet.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createSet.isPending}
          >
            {createSet.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
