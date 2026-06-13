import { createClient } from '@/lib/supabase/server';
import { FadeIn } from '@/components/dashboard';
import { LabsPanel } from '@/components/labs/LabsPanel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaskConical } from 'lucide-react';

export const metadata = {
  title: 'Labs',
};

export default async function LabsPage() {
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

  let plan = 'free';

  if (member) {
    const { developer_id } = member as { developer_id: string };
    const { data: developer } = await supabase
      .from('developers')
      .select('plan')
      .eq('id', developer_id)
      .single();

    if (typeof developer?.plan === 'string') {
      plan = developer.plan;
    }
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-7 w-7 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-bold tracking-tight">Labs</h1>
            <Badge variant="secondary">Experimental</Badge>
          </div>
          <p className="text-muted-foreground">
            Opt in to experimental features before they reach general availability.
            These features may change or be removed at any time.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary">
              About Labs features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">
              Labs features are early-access experiments. Enabling them may affect
              performance or conversation quality. Your feedback helps shape what
              ships to everyone.
            </CardDescription>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <LabsPanel plan={plan} />
      </FadeIn>
    </div>
  );
}
