/* eslint-disable @next/next/no-img-element */
'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import type { ChatSnippetMessage, Post } from '@agentgram/shared';
import {
  AlertTriangle,
  Eye,
  ImageIcon,
  Link2,
  Loader2,
  Mic,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCreateComment } from '@/hooks/use-comments';
import type { ImagineSceneResult } from '@/lib/reply-composer/imagine-scene';
import { detectCrisisKeywords } from '@/lib/crisis-detection';
import { CrisisOverlay } from '@/components/common/CrisisOverlay';
import { MemoryUsageMeter, type MemoryUsageData } from '@/components/memory/MemoryUsageMeter';
import { StarterPromptStrip } from '@/components/chat/StarterPromptStrip';
import { BlankStartMessageCoach } from '@/components/chat/BlankStartMessageCoach';
import { FilterRewriteBanner, estimateFilterRisk } from '@/components/chat/FilterRewriteBanner';
import { AnchorControlsPreset } from '@/components/image-gen/AnchorControlsPreset';
import { GettingStartedImageGuide } from '@/components/image-gen/getting-started-image-guide';
import type { AnchorControlsState } from '@/lib/image-gen/anchor-controls';
import {
  DEFAULT_ANCHOR_CONTROLS,
  buildAnchorHints,
  loadAnchorControlsDefault,
} from '@/lib/image-gen/anchor-controls';

interface ReplyContextComposerProps {
  postId: string;
  source?: {
    postType?: Post['postType'];
    title?: string;
    content?: string;
    authorName?: string;
    messages?: ChatSnippetMessage[];
  };
  memoryUsage?: MemoryUsageData;
  /** Number of messages already in the chat; shows BlankStartMessageCoach when 0. */
  messageCount?: number;
  /** Agent persona/lorebook tags for the BlankStartMessageCoach chip derivation. */
  agentTags?: string[];
  /** Short persona style descriptor for the BlankStartMessageCoach. */
  personaStyle?: string;
}

function formatContextHost(value: string) {
  try {
    return new URL(value).host.replace(/^www\./, '');
  } catch {
    return value;
  }
}

export function ReplyContextComposer({
  postId,
  source,
  memoryUsage,
  messageCount = 0,
  agentTags = [],
  personaStyle = '',
}: ReplyContextComposerProps) {
  const [apiKey, setApiKey] = useState('');
  const [content, setContent] = useState('');
  const [contextUrl, setContextUrl] = useState('');
  const [contextImageUrl, setContextImageUrl] = useState('');
  const [contextVoiceNoteUrl, setContextVoiceNoteUrl] = useState('');
  const [imagineSceneHandoff, setImagineSceneHandoff] =
    useState<ImagineSceneResult | null>(null);
  const [isGeneratingImagineScene, setIsGeneratingImagineScene] =
    useState(false);
  const [anchorControls, setAnchorControls] = useState<AnchorControlsState>(
    () => {
      try {
        return loadAnchorControlsDefault();
      } catch {
        return DEFAULT_ANCHOR_CONTROLS;
      }
    }
  );
  const [filterBannerDismissed, setFilterBannerDismissed] = useState(false);
  const [showCrisisOverlay, setShowCrisisOverlay] = useState(false);
  const crisisShownRef = useRef(false);
  const createComment = useCreateComment(postId);
  const { toast } = useToast();

  const trimmedContent = content.trim();
  const trimmedContextUrl = contextUrl.trim();
  const trimmedContextImageUrl = contextImageUrl.trim();
  const trimmedContextVoiceNoteUrl = contextVoiceNoteUrl.trim();
  const hasFilterRisk = estimateFilterRisk(content);

  const canSubmit = Boolean(apiKey.trim() && trimmedContent);
  const previewHost = useMemo(
    () =>
      trimmedContextUrl ? formatContextHost(trimmedContextUrl) : undefined,
    [trimmedContextUrl]
  );
  const canImagineScene = Boolean(
    source?.title?.trim() ||
      source?.content?.trim() ||
      source?.messages?.some((message) => message.content?.trim())
  );

  function handleContentChange(newValue: string) {
    setContent(newValue);
    if (!estimateFilterRisk(newValue)) setFilterBannerDismissed(false);
    if (detectCrisisKeywords(newValue)) {
      if (!crisisShownRef.current) {
        crisisShownRef.current = true;
        setShowCrisisOverlay(true);
      }
    } else {
      crisisShownRef.current = false;
    }
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
  }

  async function handleImagineScene() {
    if (!source) {
      toast({
        title: 'Source unavailable',
        description: 'Open a post or chat thread before generating an image handoff.',
        variant: 'destructive',
      });
      return;
    }

    if (!canImagineScene) {
      toast({
        title: 'Nothing to imagine yet',
        description:
          'This post needs a title, body, or snippet transcript before we can build an image prompt.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingImagineScene(true);

    try {
      const sourceUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/posts/${postId}`
          : undefined;
      const response = await fetch('/api/v1/reply-composer/imagine-scene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...source,
          sourceUrl,
        }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: ImagineSceneResult;
        error?: { message?: string };
      };

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error?.message || 'Failed to build imagine-scene prompt');
      }

      setImagineSceneHandoff(json.data);
      const anchorLine = buildAnchorHints(anchorControls);
      await copyText(`${json.data.handoffText}\nAnchor: ${anchorLine}`);
      toast({
        title: 'Imagine prompt copied',
        description:
          'Paste it into your image generator, then drop the final image URL into the photo context field.',
      });
    } catch (error) {
      toast({
        title: 'Imagine handoff failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to prepare the image-generation handoff.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImagineScene(false);
    }
  }

  async function handleCopyImagineScenePrompt() {
    if (!imagineSceneHandoff) return;

    try {
      const anchorLine = buildAnchorHints(anchorControls);
      const textWithAnchors = `${imagineSceneHandoff.handoffText}\nAnchor: ${anchorLine}`;
      await copyText(textWithAnchors);
      toast({
        title: 'Prompt copied again',
        description: 'The imagine-scene handoff is back on your clipboard.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy the imagine-scene handoff.',
        variant: 'destructive',
      });
    }
  }

  function handleUseSuggestedReply() {
    if (!imagineSceneHandoff) return;

    setContent((current) => current.trim() || imagineSceneHandoff.suggestedReply);
    toast({
      title: 'Suggested reply added',
      description: 'You can edit it before sending the reply.',
    });
  }

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
        content: trimmedContent,
        contextUrl: trimmedContextUrl || undefined,
        contextImageUrl: trimmedContextImageUrl || undefined,
        contextVoiceNoteUrl: trimmedContextVoiceNoteUrl || undefined,
      });

      setContent('');
      setContextUrl('');
      setContextImageUrl('');
      setContextVoiceNoteUrl('');
      crisisShownRef.current = false;
      toast({
        title: 'Reply posted',
        description:
          'Your reply and optional context were added to the thread.',
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
    <>
    <CrisisOverlay
      open={showCrisisOverlay}
      onClose={() => setShowCrisisOverlay(false)}
    />
    <section className="mt-8 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reply with optional context</h2>
          <p className="text-sm text-muted-foreground">
            Bring one link, one photo, and one voice note into the reply, then
            preview exactly what will be sent before posting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
            <Eye className="h-3.5 w-3.5" />
            Pre-send preview
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="reply-context-imagine-scene-button"
            disabled={!canImagineScene || isGeneratingImagineScene}
            onClick={handleImagineScene}
            className="gap-2"
          >
            {isGeneratingImagineScene ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building prompt...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Imagine this scene
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
        Generate a ready-to-paste image prompt from the current post or chat,
        then drop the finished image URL into <strong>Context photo URL</strong>{' '}
        before sending the reply.
      </div>

      <BlankStartMessageCoach
        messageCount={messageCount}
        agentTags={agentTags}
        personaStyle={personaStyle}
        onSelectStarter={(text) => handleContentChange(text)}
      />

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
          {!content && (
            <StarterPromptStrip
              onSelect={(prompt) => handleContentChange(prompt)}
            />
          )}
          <textarea
            id="reply-content"
            data-testid="reply-context-content"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            maxLength={2000}
            placeholder="Write the reply you want to publish..."
            value={content}
            onChange={(event) => handleContentChange(event.target.value)}
          />
          {!filterBannerDismissed && (
            <FilterRewriteBanner
              message={content}
              onAcceptRewrite={(rewrite) => {
                setContent(rewrite);
                setFilterBannerDismissed(true);
              }}
              onDismiss={() => setFilterBannerDismissed(true)}
            />
          )}
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

        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="reply-context-voice-note-url"
          >
            Voice note URL (optional)
          </label>
          <Input
            id="reply-context-voice-note-url"
            data-testid="reply-context-voice-note-url"
            inputMode="url"
            placeholder="https://audio.example.com/context-note.mp3"
            value={contextVoiceNoteUrl}
            onChange={(event) => setContextVoiceNoteUrl(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            One voice note keeps the reply grounded without turning the composer
            into a full attachment inbox.
          </p>
        </div>

        {canImagineScene && (
          <>
            <GettingStartedImageGuide
              onSelectPreset={(prompt) =>
                handleContentChange(
                  content.trim() ? `${content.trim()} ${prompt}` : prompt
                )
              }
            />
            <AnchorControlsPreset
              initialValue={anchorControls}
              onChange={setAnchorControls}
            />
          </>
        )}

        {(imagineSceneHandoff || isGeneratingImagineScene) && (
          <div
            className="rounded-xl border border-primary/20 bg-primary/5 p-4"
            data-testid="reply-context-imagine-scene-preview"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Imagine-scene handoff
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Copy the prompt into your image generator, then paste the
                  finished image URL back into the reply composer.
                </p>
              </div>
              {imagineSceneHandoff ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid="reply-context-imagine-scene-copy"
                    onClick={handleCopyImagineScenePrompt}
                  >
                    Copy prompt
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="reply-context-imagine-scene-use-reply"
                    onClick={handleUseSuggestedReply}
                  >
                    Use suggested reply
                  </Button>
                </div>
              ) : null}
            </div>

            {isGeneratingImagineScene && !imagineSceneHandoff ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing the handoff from the current post...
              </div>
            ) : null}

            {imagineSceneHandoff ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Prompt
                  </p>
                  <p
                    className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground"
                    data-testid="reply-context-imagine-scene-prompt"
                  >
                    {imagineSceneHandoff.prompt}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Suggested reply
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {imagineSceneHandoff.suggestedReply}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Suggested alt text
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {imagineSceneHandoff.suggestedImageAlt}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-1">
                    {imagineSceneHandoff.styleHints.aspectRatio} aspect ratio
                  </span>
                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-1">
                    {imagineSceneHandoff.styleHints.finish}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}

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

          {(trimmedContextUrl ||
            trimmedContextImageUrl ||
            trimmedContextVoiceNoteUrl) && (
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

              {trimmedContextVoiceNoteUrl && (
                <div className="rounded-lg border border-border/60 bg-background p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mic className="h-4 w-4" />
                    Voice note context
                  </div>
                  <audio
                    controls
                    preload="none"
                    src={trimmedContextVoiceNoteUrl}
                    className="w-full"
                    data-testid="reply-context-preview-voice-note"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {memoryUsage && (
          <MemoryUsageMeter
            data={memoryUsage}
            variant="compact"
          />
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            One link + one photo + one voice note keeps replies focused while
            still showing extra context before send.
          </p>
          <div className="flex flex-col gap-2 sm:items-end">
            {hasFilterRisk && (
              <div
                className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                data-testid="reply-context-filter-preview-chip"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                May be filtered — refine before sending.
              </div>
            )}
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
        </div>
      </form>
    </section>
    </>
  );
}
