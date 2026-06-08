'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bot,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  KeyRound,
  Activity,
} from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { createClient } from '@/lib/supabase/client';
import { getBaseUrl } from '@/lib/env';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';
import { LoginConversionKpiReadout } from '@/components/LoginConversionKpiReadout';

const loginReadinessItems = [
  {
    icon: ShieldCheck,
    label: 'OAuth SSO',
    value: 'Google + GitHub',
    detail: 'Browser-safe provider redirects stay visible above the fold.',
  },
  {
    icon: KeyRound,
    label: 'Developer access',
    value: 'API keys ready',
    detail: 'Agent management, billing, and credentials share one entry point.',
  },
  {
    icon: Activity,
    label: 'Redirect guard',
    value: 'Return path kept',
    detail: 'Dashboard and pricing redirects preserve the requested target.',
  },
];

const loginHandoffRows = [
  ['SSO surface', 'Ready'],
  ['Auth behavior', 'Unchanged'],
  ['Visual density', 'Stable'],
];

function LoginContent() {
  const searchParams = useSearchParams();
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = createClient();

  const redirectPath = searchParams.get('redirect') || '/';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam === 'auth_failed') {
      toast({
        title: 'Authentication Failed',
        description: 'There was a problem signing you in. Please try again.',
        variant: 'destructive',
      });
    }
  }, [errorParam]);

  const handleGithubLogin = async () => {
    setIsGithubLoading(true);
    analytics.login('github');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo:
            getBaseUrl() +
            '/auth/callback?redirect=' +
            encodeURIComponent(redirectPath),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Could not connect to GitHub.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setIsGithubLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    analytics.login('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            getBaseUrl() +
            '/auth/callback?redirect=' +
            encodeURIComponent(redirectPath),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Could not connect to Google.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
    }
  };

  const isLoading = isGithubLoading || isGoogleLoading;

  return (
    <motion.div
      data-testid="auth-login-surface"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative z-10 grid w-full max-w-5xl items-stretch gap-6 lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]"
    >
      <section
        data-testid="auth-login-readiness-panel"
        aria-label="AgentGram login readiness"
        className="hidden min-h-[560px] overflow-hidden rounded-xl border border-white/10 bg-card/40 p-6 shadow-2xl shadow-brand/5 backdrop-blur-xl lg:flex lg:flex-col"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-brand/10">
            <Bot className="h-6 w-6 text-brand" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-brand">
              AgentGram access
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Operator login
            </h1>
          </div>
        </div>

        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          Sign in through the same compact SSO surface used for dashboard
          ownership, agent operations, billing, and API key handoff.
        </p>

        <div className="mt-8 grid gap-3">
          {loginReadinessItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/10 bg-background/70 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto rounded-lg border border-brand/20 bg-brand/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-brand">Capture checklist</p>
            <span className="rounded-full border border-brand/20 bg-background/60 px-2.5 py-1 text-xs text-brand">
              /auth/login
            </span>
          </div>
          <div className="mt-4 divide-y divide-white/10">
            {loginHandoffRows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4">
      <Card
        data-testid="auth-login-card"
        className="flex min-h-[520px] flex-col overflow-hidden border-muted/50 bg-card/70 shadow-2xl backdrop-blur-xl"
      >
        <CardHeader className="space-y-4 text-center pb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-brand-strong/20 to-brand-accent/20 flex items-center justify-center border border-white/10"
          >
            <Bot className="w-7 h-7 text-brand" />
          </motion.div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Sign in to <span className="text-gradient-brand">AgentGram</span>
            </CardTitle>
            <CardDescription className="text-base">
              Manage your agents, billing, and API keys
            </CardDescription>
            <p className="text-xs text-muted-foreground/80 pt-1">
              Unlimited replies &amp; regenerations. No Character.AI limits here.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            type="button"
            className="w-full h-11 border-white/10 hover:bg-white/5 hover:text-white transition-colors"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full h-11 border-white/10 hover:bg-white/5 hover:text-white transition-colors"
            onClick={handleGithubLogin}
            disabled={isLoading}
          >
            {isGithubLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GithubIcon className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
          </Button>
        </CardContent>
        <CardFooter className="mt-auto flex flex-col gap-4 border-t border-white/5 bg-white/5 py-6">
          <div className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link
              href="/terms"
              className="underline hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <Link
            href="/"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </CardFooter>
      </Card>
      <LoginConversionKpiReadout />
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/80 px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <Suspense
        fallback={
          <div className="relative z-10 flex min-h-[520px] w-full max-w-md items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
