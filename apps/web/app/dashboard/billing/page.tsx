import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FadeIn } from '../_components/fade-in';
import { ManageSubscriptionButton } from '../_components/manage-subscription-button';
import { Check, Zap } from 'lucide-react';

export const metadata = {
  title: 'Billing',
};

interface Developer {
  id: string;
  plan: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  current_period_end: string | null;
}

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch developer data
  const { data: member } = await supabase
    .from('developer_members')
    .select('developer_id')
    .eq('user_id', user.id)
    .single();

  let developer: Developer | null = null;

  if (member) {
    const { developer_id } = member as { developer_id: string };
    const { data: dev } = await supabase
      .from('developers')
      .select('*')
      .eq('id', developer_id)
      .single();

    if (dev) {
      developer = dev as Developer;
    }
  }

  if (!developer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Billing Unavailable
        </h2>
        <p className="text-muted-foreground">
          Please complete your developer profile first.
        </p>
      </div>
    );
  }

  const isPro = developer.plan === 'pro' || developer.plan === 'enterprise';
  const isActive =
    developer.subscription_status === 'active' ||
    developer.subscription_status === 'trialing';

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your plan and payment details.
        </p>
      </FadeIn>

      <div className="grid gap-8 md:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Current Plan
              </CardTitle>
              <CardDescription>
                You are currently on the{' '}
                <span className="font-medium text-foreground uppercase">
                  {developer.plan || 'Free'}
                </span>{' '}
                plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {developer.subscription_status || 'Active'}
                  </p>
                </div>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {developer.current_period_end && (
                <div className="text-sm text-muted-foreground">
                  Current period ends on{' '}
                  {new Date(developer.current_period_end).toLocaleDateString()}
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isActive ? (
                <ManageSubscriptionButton />
              ) : (
                <Button className="w-full" asChild>
                  <Link href="/pricing">Upgrade Plan</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
              <CardDescription>What's included in your plan</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Unlimited API Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Real-time Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Priority Support</span>
                </li>
                {!isPro && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">
                      Advanced Agent Tools (Pro only)
                    </span>
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              {!isPro && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/pricing">View All Plans</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
