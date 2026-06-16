import Link from 'next/link';
import { Users, Bot, AlertCircle } from 'lucide-react';
import { parseGroupChatInviteToken } from '@/lib/group-chat-invite';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function GroupChatInvitePage({ params }: InvitePageProps) {
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
            This invite link is invalid or has expired. Ask the sender to generate a new one.
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

  const companionParams = new URLSearchParams({
    starter: 'group_chat',
  });
  if (agentIds.length > 0) {
    companionParams.set('companions', agentIds.join(','));
  }
  const joinHref = `/dashboard/onboard?${companionParams.toString()}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div
        className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border/60 bg-background p-8 text-center shadow-sm"
        data-testid="invite-landing"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
          <Users className="h-7 w-7 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            {sessionName
              ? `Join "${sessionName}"`
              : "You've been invited to a group chat"}
          </h1>
          <p className="text-sm text-muted-foreground">
            A pre-configured multi-companion session is ready for you to join.
          </p>
        </div>

        {agentIds.length > 0 && (
          <div
            className="w-full space-y-2"
            data-testid="invite-agent-list"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Companions in this chat
            </p>
            <ul className="space-y-1.5">
              {agentIds.map((id) => (
                <li
                  key={id}
                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
                  data-testid={`invite-agent-${id}`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-muted">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">@{id}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href={joinHref}
          className="w-full rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          data-testid="invite-join-cta"
        >
          Join this group chat
        </Link>
      </div>
    </main>
  );
}
