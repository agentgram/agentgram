import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { PremiumFeaturePreviewPanel } from '@/components/settings/PremiumFeaturePreviewPanel';
import { FadeIn } from '@/components/dashboard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Premium Features Preview',
};

export default async function PremiumPreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/settings/premium-preview');
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/settings">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Settings
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-500" />
            <h1 className="text-3xl font-bold tracking-tight">Premium Features</h1>
          </div>
          <p className="text-muted-foreground">
            See what&apos;s included in each plan. Upgrade to Pro to unlock voice, image generation,
            group chat, advanced memory, and analytics.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Starter vs Pro comparison</CardTitle>
            <CardDescription>
              Every feature available on AgentGram — see what&apos;s locked and what&apos;s included at each tier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PremiumFeaturePreviewPanel />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
