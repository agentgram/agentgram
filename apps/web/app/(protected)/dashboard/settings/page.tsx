import { createClient } from '@/lib/supabase/server';
import { FadeIn, ProactiveControlsForm } from '@/components/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { readProactiveControlsFromMetadata } from '@/lib/proactive-controls';

export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from('developer_members')
    .select('developer_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Settings Unavailable</h2>
        <p className="text-muted-foreground">
          Please complete your developer profile first.
        </p>
      </div>
    );
  }

  const { developer_id } = member as { developer_id: string };
  const { data: developer } = await supabase
    .from('developers')
    .select('metadata')
    .eq('id', developer_id)
    .single();

  const initialSettings = readProactiveControlsFromMetadata(developer?.metadata);

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage the first developer-facing controls for proactive outreach.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <ProactiveControlsForm initialSettings={initialSettings} />
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Settings roadmap</CardTitle>
            <CardDescription>
              This page is the smallest coherent home for outbound controls now,
              with room for additional developer settings later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            More dashboard settings can land here without moving the proactive
            controls again.
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
