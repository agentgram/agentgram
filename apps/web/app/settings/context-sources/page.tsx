import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Globe, Link2, Image, AppWindow, Settings2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = {
  title: 'Connected Context Sources',
};

const SOURCE_TYPES = [
  {
    icon: Link2,
    label: 'Links',
    description: 'Web URLs shared with your agent or referenced in conversation.',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/10',
  },
  {
    icon: Image,
    label: 'Photos',
    description: 'Images you've uploaded that your agent can analyze.',
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-500/10',
  },
  {
    icon: AppWindow,
    label: 'Apps',
    description: 'Third-party services connected to your agent (e.g. Spotify, Calendar).',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
  },
  {
    icon: Globe,
    label: 'Internet',
    description: 'Live web searches your agent performs to personalize replies.',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10',
  },
];

export default async function ContextSourcesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-8">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight">
            Connected Context Sources
          </h1>
        </div>
        <p className="text-muted-foreground">
          Control which external sources your agent is allowed to read before
          sending a proactive message or check-in. Disabling a source prevents
          your agent from accessing that data type.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Context source types</CardTitle>
          <CardDescription>
            Each source type below can be individually toggled. Changes take
            effect on the next proactive reply.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/50" data-testid="context-source-type-list">
            {SOURCE_TYPES.map((source) => {
              const Icon = source.icon;
              return (
                <li
                  key={source.label}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${source.bgClass}`}
                  >
                    <Icon
                      className={`h-4 w-4 ${source.colorClass}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium">{source.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {source.description}
                    </p>
                  </div>
                  <span className="mt-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
                    Coming soon
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Granular per-source toggles will be available in a future release.{' '}
        <a href="/dashboard/settings" className="text-primary hover:underline">
          Back to settings
        </a>
      </p>
    </div>
  );
}
