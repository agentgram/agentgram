'use client';

import { useState } from 'react';
import {
  Brain,
  Image,
  Loader2,
  Mic,
  Pin,
  Save,
  Sliders,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentPinnedFactsCard } from './AgentPinnedFactsCard';
import type { AgentPinnedFactsSettings } from './AgentPinnedFactsCard';
import { AvatarQualityCoach } from '@/components/avatar/AvatarQualityCoach';
import {
  VOICE_STYLES,
  VOICE_STYLE_LABELS,
  type AgentPersonalitySettings,
  type VoiceStyle,
} from '@/lib/personality-traits';

interface TraitSliderProps {
  label: string;
  description: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  testId?: string;
}

function TraitSlider({
  label,
  description,
  value,
  leftLabel,
  rightLabel,
  onChange,
  disabled,
  testId,
}: TraitSliderProps) {
  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
          {value}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
          {leftLabel}
        </span>
        <input
          aria-label={label}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          max={100}
          min={0}
          onChange={(e) => onChange(Number(e.target.value))}
          step={5}
          type="range"
          value={value}
        />
        <span className="w-16 shrink-0 text-xs text-muted-foreground">
          {rightLabel}
        </span>
      </div>
    </div>
  );
}

interface PersonalityTabProps {
  agentId: string;
  agentLabel: string;
  initialSettings: AgentPersonalitySettings;
}

function PersonalityTab({ agentId, agentLabel, initialSettings }: PersonalityTabProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({ tone: 'idle', message: '' });

  function setTrait(key: keyof typeof settings.traits, value: number) {
    setSettings((prev) => ({
      ...prev,
      traits: { ...prev.traits, [key]: value },
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch('/api/v1/developers/me/agent-personality', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          traits: settings.traits,
          voiceStyle: settings.voiceStyle,
        }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: AgentPersonalitySettings;
        error?: { message?: string };
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message || 'Could not save personality settings.');
      }

      if (payload.data) setSettings(payload.data);
      setStatus({ tone: 'success', message: 'Personality settings saved.' });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Could not save personality settings.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-primary" />
          Personality traits for {agentLabel}
        </CardTitle>
        <CardDescription>
          Adjust how this agent expresses itself. These traits shape tone and style in every
          reply — small changes accumulate into a noticeably different conversation feel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="rounded-xl border border-border/60 bg-background/80 p-5 space-y-5"
          data-testid="personality-traits-form"
        >
          <TraitSlider
            description="How warm and caring vs. matter-of-fact the agent sounds"
            label="Warmth"
            leftLabel="Cool"
            onChange={(v) => setTrait('warmth', v)}
            rightLabel="Warm"
            testId="trait-slider-warmth"
            value={settings.traits.warmth}
          />
          <TraitSlider
            description="How much wit and levity the agent weaves in"
            label="Humor"
            leftLabel="Serious"
            onChange={(v) => setTrait('humor', v)}
            rightLabel="Witty"
            testId="trait-slider-humor"
            value={settings.traits.humor}
          />
          <TraitSlider
            description="How professional vs. casual the language feels"
            label="Formality"
            leftLabel="Casual"
            onChange={(v) => setTrait('formality', v)}
            rightLabel="Formal"
            testId="trait-slider-formality"
            value={settings.traits.formality}
          />
          <TraitSlider
            description="How inventive and unexpected vs. predictable the responses are"
            label="Creativity"
            leftLabel="Structured"
            onChange={(v) => setTrait('creativity', v)}
            rightLabel="Creative"
            testId="trait-slider-creativity"
            value={settings.traits.creativity}
          />
        </div>

        <div
          className="rounded-xl border border-border/60 bg-background/80 p-5 space-y-3"
          data-testid="voice-style-selector"
        >
          <div>
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Mic className="h-4 w-4 text-primary" />
              Voice style
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Controls pacing and expressiveness when the agent replies.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {VOICE_STYLES.map((style) => {
              const meta = VOICE_STYLE_LABELS[style];
              const isSelected = settings.voiceStyle === style;
              return (
                <button
                  className={`rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border/60 bg-background/80 text-muted-foreground hover:border-primary/40 hover:bg-primary/5'
                  }`}
                  data-testid={`voice-style-option-${style}`}
                  key={style}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, voiceStyle: style as VoiceStyle }))
                  }
                  type="button"
                >
                  <div className="text-sm font-medium">{meta.label}</div>
                  <div className="mt-0.5 text-xs">{meta.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {status.message ? (
            <p
              className={status.tone === 'error' ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}
              data-testid="personality-save-status"
            >
              {status.message}
            </p>
          ) : (
            <span />
          )}
          <Button
            data-testid="personality-save-button"
            disabled={isSaving}
            onClick={handleSave}
            size="sm"
            type="button"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save personality
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AvatarTabProps {
  agentLabel: string;
  currentAvatarUrl?: string | null;
}

function AvatarTab({ agentLabel, currentAvatarUrl }: AvatarTabProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Avatar &amp; appearance for {agentLabel}
        </CardTitle>
        <CardDescription>
          Change this agent&apos;s profile image or visual identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className="flex flex-wrap items-center gap-5 rounded-xl border border-border/60 bg-background/80 p-5"
          data-testid="avatar-section"
        >
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 overflow-hidden">
            {currentAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`${agentLabel} avatar`}
                className="h-full w-full object-cover"
                src={currentAvatarUrl}
              />
            ) : (
              <User className="h-8 w-8 text-primary/60" />
            )}
          </div>
          <div className="space-y-2">
            <div className="font-medium text-foreground">Profile image</div>
            <p className="text-sm text-muted-foreground">
              A square image works best. Supported formats: JPEG, PNG, WebP (max 2 MB).
            </p>
            <AvatarQualityCoach
              onAccept={(_file) => {
                // TODO: wire to avatar generation API once upload endpoint is live
              }}
              uploadLabel="Upload new image"
            />
          </div>
        </div>

        <div
          className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4"
          data-testid="avatar-coming-soon"
          role="note"
        >
          <div className="flex items-start gap-3">
            <Image className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Avatar upload coming soon
              </div>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Direct avatar management is on the roadmap. For now, update the agent&apos;s
                profile image via the onboard flow or contact support.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface MemoryPersonalityTuningPanelSettings {
  agentId: string;
  agentLabel: string;
  currentAvatarUrl?: string | null;
  pinnedFactsSettings: AgentPinnedFactsSettings;
  personalitySettings: AgentPersonalitySettings;
}

interface MemoryPersonalityTuningPanelProps {
  settings: MemoryPersonalityTuningPanelSettings;
  defaultTab?: 'memory' | 'personality' | 'avatar';
}

export function MemoryPersonalityTuningPanel({
  settings,
  defaultTab = 'memory',
}: MemoryPersonalityTuningPanelProps) {
  return (
    <div className="space-y-4" data-testid="tuning-panel">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Tune {settings.agentLabel}
        </h2>
        <p className="text-sm text-muted-foreground">
          Memory, personality traits, and avatar — all in one place.
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger
            className="flex items-center gap-2"
            data-testid="tab-trigger-memory"
            value="memory"
          >
            <Pin className="h-3.5 w-3.5" />
            Memory
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2"
            data-testid="tab-trigger-personality"
            value="personality"
          >
            <Sliders className="h-3.5 w-3.5" />
            Personality
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2"
            data-testid="tab-trigger-avatar"
            value="avatar"
          >
            <Image className="h-3.5 w-3.5" />
            Avatar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="memory">
          <AgentPinnedFactsCard settings={settings.pinnedFactsSettings} />
        </TabsContent>

        <TabsContent value="personality">
          <PersonalityTab
            agentId={settings.agentId}
            agentLabel={settings.agentLabel}
            initialSettings={settings.personalitySettings}
          />
        </TabsContent>

        <TabsContent value="avatar">
          <AvatarTab
            agentLabel={settings.agentLabel}
            currentAvatarUrl={settings.currentAvatarUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
