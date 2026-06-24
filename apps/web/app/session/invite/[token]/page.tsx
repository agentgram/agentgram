import Link from 'next/link';
import Image from 'next/image';
import { Users, Bot, AlertCircle } from 'lucide-react';
import { parseGroupChatInviteToken } from '@/lib/group-chat-invite';
import { getSupabaseServiceClient } from '@agentgram/db';
import { GroupMemoryIsolationPreview } from '@/components/agents/GroupMemoryIsolationPreview';

interface InvitePreviewPageProps {
  params: Promise<{ token: string }>;
}

interface PublicAgentData {
  name: string;
  display_name: string | null;
  description: string | null;
  avatar_url: string | null;
  status: string | null;
}

async function fetchPublicAgents(agentIds: string[]): Promise<PublicAgentData[]> {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from('agents')
      .select('name, display_name, description, avatar_url, status')
      .in('name', agentIds)
      .eq('status', 'active');

    if (error || !data) return [];
    return data as PublicAgentData[];
  } catch {
    return [];
  }
}

function AgentCard({
  agentId,
  agentData,
}: {
  agentId: string;
  agentData: PublicAgentData | undefined;
}) {
  const displayName = agentData?.display_name || agentData?.name || `@${agentId}`;
  const description = agentData?.description;
  const avatarUrl = agentData?.avatar_url;

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
      data-testid={`invite-preview-agent-${agentId}`}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Bot className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">@{agentId}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default async function SessionInvitePreviewPage({
  params,
}: InvitePreviewPageProps) {
  const { token } = await params;
  const config = parseGroupChatInviteToken(token);

  if (!config) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div
          className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
          data-testid="invite-error-state"
        >
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h1 className="text-xl font-semibold">Invalid invite link</h1>
          <p className="text-sm text-muted-foreground">
            This invite link is invalid or has expired. Ask the sender to
            generate a new one.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-full border border-border/70 bg-background px-5 py-2 text-sm font-medium transition hover:bg-muted/30"
          >
            Go home
          </Link>
        </div>
      </main>
    );
  }

  const { agentIds, sessionName } = config;

  const agentsData = agentIds.length > 0 ? await fetchPublicAgents(agentIds) : [];

  const agentMap = new Map<string, PublicAgentData>(
    agentsData.map((a) => [a.name, a])
  );

  const joinHref = `/group-chat/invite/${token}`;

  const hasAgents = agentIds.length > 0;

  const anchorAgent = hasAgents
    ? {
        id: agentIds[0],
        name: agentIds[0],
        displayName: agentMap.get(agentIds[0])?.display_name ?? null,
        avatarUrl: agentMap.get(agentIds[0])?.avatar_url ?? null,
      }
    : null;

  const companions = agentIds.slice(1).map((id) => ({
    id,
    name: id,
    displayName: agentMap.get(id)?.display_name ?? null,
    avatarUrl: agentMap.get(id)?.avatar_url ?? null,
  }));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div
        className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border/60 bg-background p-8 shadow-sm"
        data-testid="invite-landing"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold" data-testid="invite-heading">
              {sessionName
                ? `Join "${sessionName}"`
                : "You're invited to a group chat"}
            </h1>
            {sessionName && (
              <p className="text-sm text-muted-foreground" data-testid="invite-session-name">
                {sessionName}
              </p>
            )}
          </div>
        </div>

        {hasAgents && (
          <div
            className="space-y-3"
            data-testid="invite-agent-list"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Companions in this chat
            </p>
            <div className="space-y-2">
              {agentIds.map((id) => (
                <AgentCard
                  key={id}
                  agentId={id}
                  agentData={agentMap.get(id)}
                />
              ))}
            </div>
          </div>
        )}

        {anchorAgent && companions.length > 0 && (
          <div
            className="rounded-xl border border-border/40 bg-muted/10 p-4"
            data-testid="invite-memory-isolation-section"
          >
            <GroupMemoryIsolationPreview
              anchorAgent={anchorAgent}
              companions={companions}
            />
          </div>
        )}

        <Link
          href={joinHref}
          className="w-full rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          data-testid="invite-join-cta"
        >
          Join this group chat
        </Link>

        <p className="text-center text-xs text-muted-foreground">
          Private memories stay scoped to each companion &mdash; your secrets stay yours.
        </p>
      </div>
    </main>
  );
}
