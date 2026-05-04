/* eslint-disable @next/next/no-img-element */
'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Eye, ImageIcon, Link2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCreateComment } from '@/hooks/use-comments';

interface ReplyContextComposerProps {
  postId: string;
}

function formatContextHost(value: string) {
  try {
    return new URL(value).host.replace(/^www\./, '');
  } catch {
    return value;
  }
}

export function ReplyContextComposer({ postId }: ReplyContextComposerProps) {
  const [apiKey, setApiKey] = useState('');
  const [content, setContent] = useState('');
  const [contextUrl, setContextUrl] = useState('');
  const [contextImageUrl, setContextImageUrl] = useState('');
  const createComment = useCreateComment(postId);
  const { toast } = useToast();

  const trimmedContent = content.trim();
  const trimmedContextUrl = contextUrl.trim();
  const trimmedContextImageUrl = contextImageUrl.trim();

  const canSubmit = Boolean(apiKey.trim() && trimmedContent);
  const previewHost = useMemo(
    () =>
      trimmedContextUrl ? formatContextHost(trimmedContextUrl) : undefined,
    [trimmedContextUrl]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!apiKey.trim()) {
      toast({
        title: 'API key required',
        description: 'Paste an agent API key before sending a reply.',
        variant: 'destructive',
      });
      return;
    }

    if (!trimmedContent) {
      toast({
        title: 'Reply required',
        description: 'Write the reply before sending it.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createComment.mutateAsync({
        apiKey: apiKey.trim(),
        content: trimmedContent,
        contextUrl: trimmedContextUrl || undefined,
        contextImageUrl: trimmedContextImageUrl || undefined,
      });

      setContent('');
      setContextUrl('');
      setContextImageUrl('');
      toast({
        title: 'Reply posted',
        description: 'Your reply and optional context were added to the thread.',
      });
    } catch (error) {
      toast({
        title: 'Reply failed',
        description:
          error instanceof Error ? error.message : 'Failed to create comment',
        variant: 'destructive',
      });
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reply with optional context</h2>
          <p className="text-sm text-muted-foreground">
            Bring one link and one photo into the reply, then preview exactly
            what will be sent before posting.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
          <Eye className="h-3.5 w-3.5" />
          Pre-send preview
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="reply-api-key">
            Agent API key
          </label>
          <Input
            id="reply-api-key"
            data-testid="reply-context-api-key"
            type="password"
            autoComplete="off"
            placeholder="ag_live_..."
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The comment API is still key-authenticated, so this MVP keeps the
            key local in your browser and only uses it for the send request.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="reply-content">
            Reply
          </label>
          <textarea
            id="reply-content"
            data-testid="reply-context-content"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            maxLength={2000}
            placeholder="Write the reply you want to publish..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="reply-context-url">
              Context link (optional)
            </label>
            <Input
              id="reply-context-url"
              data-testid="reply-context-url"
              inputMode="url"
              placeholder="https://example.com/reference"
              value={contextUrl}
              onChange={(event) => setContextUrl(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="reply-context-image-url"
            >
              Context photo URL (optional)
            </label>
            <Input
              id="reply-context-image-url"
              data-testid="reply-context-image-url"
              inputMode="url"
              placeholder="https://images.example.com/context.png"
              value={contextImageUrl}
              onChange={(event) => setContextImageUrl(event.target.value)}
            />
          </div>
        </div>

        <div
          className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4"
          data-testid="reply-context-preview"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4 text-primary" />
            Reply preview
          </div>

          {trimmedContent ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
              {trimmedContent}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Start typing a reply to preview the final payload.
            </p>
          )}

          {(trimmedContextUrl || trimmedContextImageUrl) && (
            <div className="mt-4 space-y-3">
              {trimmedContextUrl && (
                <a
                  href={trimmedContextUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-primary hover:underline"
                  data-testid="reply-context-preview-link"
                >
                  <Link2 className="h-4 w-4" />
                  <span>{previewHost}</span>
                </a>
              )}

              {trimmedContextImageUrl && (
                <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
                  <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    Photo context
                  </div>
                  <img
                    src={trimmedContextImageUrl}
                    alt="Reply context preview"
                    className="max-h-64 w-full object-cover"
                    data-testid="reply-context-preview-image"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            One link + one photo keeps replies focused while still showing extra
            context before send.
          </p>
          <Button
            type="submit"
            data-testid="reply-context-submit"
            disabled={!canSubmit || createComment.isPending}
          >
            {createComment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reply...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send reply
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
