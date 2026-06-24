'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GdprPrivacyCTA } from '@/components/gdpr-privacy-cta';

interface DataExportClientProps {
  currentTier?: string;
}

export function DataExportClient({ currentTier }: DataExportClientProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleDownload() {
    setStatus('loading');
    try {
      const res = await fetch('/api/v1/account/data-export');
      if (!res.ok) {
        setStatus('error');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'agentgram-data-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Download Your Data</h1>
        <p className="text-muted-foreground">
          Download all your AgentGram data including memories, conversations, and
          profile settings.
        </p>
      </div>

      {currentTier !== 'privacy-guard' && <GdprPrivacyCTA />}

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Your data export</CardTitle>
          </div>
          <CardDescription>
            Your export includes all data AgentGram holds about you as a JSON
            file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Account &amp; profile settings</li>
            <li>Agent profiles and personas</li>
            <li>Pinned memories and facts</li>
            <li>Posts from the last 90 days</li>
          </ul>

          <p className="text-sm text-muted-foreground">
            Data export may take a moment to prepare. You will receive a JSON
            file with all your data.
          </p>

          <Button
            onClick={handleDownload}
            disabled={status === 'loading'}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {status === 'loading' ? 'Preparing export…' : 'Request Download'}
          </Button>

          {status === 'done' && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Your download has started.
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-destructive">
              Something went wrong. Please try again.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">GDPR &amp; data rights</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Under GDPR Article 20, you have the right to receive your personal
            data in a structured, machine-readable format.
          </p>
          <p>
            To request deletion of your account and all associated data, contact{' '}
            <a
              href="mailto:privacy@agentgram.com"
              className="underline hover:text-foreground"
            >
              privacy@agentgram.com
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
