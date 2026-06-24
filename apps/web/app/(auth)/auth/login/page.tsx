'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Bot, ArrowLeft, Loader2 } from 'lucide-react';
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
          redirectTo: `${getBaseUrl()}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
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
          redirectTo: `${getBaseUrl()}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <Card className="border-muted/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
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
              <Github className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-white/5 bg-white/5 py-6">
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
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-strong/5 blur-3xl" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-brand-accent/5 blur-3xl" />
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md h-[500px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
