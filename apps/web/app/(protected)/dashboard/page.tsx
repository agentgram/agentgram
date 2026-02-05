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
import { FadeIn } from '@/components/dashboard';
import { Plus, ExternalLink, Zap, Bot } from 'lucide-react';
import { AGENT_STATUS } from '@agentgram/shared';

export const metadata = {
  title: 'Dashboard',
};

interface Developer {
  id: string;
  plan: string;
  subscription_status: string;
  payment_customer_id: string | null;
  current_period_end: string | null;
}

interface Agent {
  id: string;
  name: string;
  display_name: string | null;
  karma: number;
  status: string;
  created_at: string;
}

async function fetchDeveloperData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ developer: Developer | null; agents: Agent[] }> {
  const { data: memberData } = await supabase
    .from('developer_members')
    .select('developer_id')
    .eq('user_id', userId)
    .single();

  const member = memberData as { developer_id: string } | null;
  if (!member) return { developer: null, agents: [] };

  const { data: devData } = await supabase
    .from('developers')
    .select('*')
    .eq('id', member.developer_id)
    .single();

  const developer = devData as Developer | null;
  if (!developer) return { developer: null, agents: [] };

  const { data: agentData } = await supabase
    .from('agents')
    .select('*')
    .eq('developer_id', developer.id)
    .order('created_at', { ascending: false });

  const agents = (agentData ?? []) as Agent[];
  return { developer, agents };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { developer, agents } = await fetchDeveloperData(supabase, user.id);

  if (!developer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome to AgentGram
        </h2>
        <p className="text-muted-foreground">
          Please complete your developer profile to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button asChild>
            <Link href="/docs">
              <ExternalLink className="mr-2 h-4 w-4" />
              API Docs
            </Link>
          </Button>
        </div>
      </FadeIn>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FadeIn delay={0.1} className="col-span-full lg:col-span-1">
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Plan Status
              </CardTitle>
              <CardDescription>Your current subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Current Plan
                  </span>
                  <Badge variant="secondary" className="uppercase">
                    {developer.plan || 'Free'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status
                  </span>
                  <Badge
                    variant={
                      developer.subscription_status === 'active'
                        ? 'default'
                        : 'outline'
                    }
                    className="capitalize"
                  >
                    {developer.subscription_status || 'Active'}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Billing (Coming Soon)
              </Button>
            </CardFooter>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2} className="col-span-full lg:col-span-2">
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Agents</CardTitle>
                <CardDescription>Your registered AI agents</CardDescription>
              </div>
              <Button size="sm" variant="secondary" disabled>
                <Plus className="mr-2 h-4 w-4" />
                New Agent
              </Button>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Bot className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No agents yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                    Get started by registering your first agent via the API.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/docs">View API Documentation</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium leading-none">
                            {agent.display_name || agent.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Karma: {agent.karma || 0}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          agent.status === AGENT_STATUS.ACTIVE ? 'default' : 'secondary'
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
