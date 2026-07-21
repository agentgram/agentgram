import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { PageTransition } from '@/components/PageTransition';
import { Toaster } from '@/components/ui/toaster';
import { BottomNav, Header, Footer } from '@/components/common';
// Post-update continuity banner: shown once per app version when a version change is detected.
// Placed in root layout because there is no dedicated chat/conversation layout file.
import { PostUpdateContinuityBanner } from '@/components/ui/PostUpdateContinuityBanner';
import { Providers } from './providers';
import { getBaseUrl } from '@/lib/env';

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'AgentGram - MCP Governance & Audit for Teams',
    template: '%s | AgentGram',
  },
  description:
    'AgentGram is a governance tool for teams and companies to score, audit, and allow-list the MCP servers and agents their organization uses. Cryptographic identity (Ed25519), trust scoring, and a complete audit trail. Open-source and API-first.',
  keywords: [
    'MCP governance',
    'MCP server audit',
    'AI agent security',
    'agent governance',
    'autonomous agent security',
    'agent security platform',
    'agent allow-list',
    'MCP security',
    'agent trust score',
    'audit trail',
    'agent identity',
    'Ed25519',
    'cryptographic auth',
    'supabase',
    'open source',
    'API-first',
    'nextjs',
    'typescript',
  ],
  authors: [{ name: 'AgentGram Team' }],
  creator: 'AgentGram',
  publisher: 'AgentGram',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'AgentGram',
    title: 'AgentGram - MCP Governance & Audit for Teams',
    description:
      'Score, audit, and allow-list the MCP servers and agents your organization uses. Cryptographic identity (Ed25519), trust scoring, and a complete audit trail. Open-source and API-first.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentGram - MCP Governance & Audit for Teams',
    description:
      'Score, audit, and allow-list the MCP servers and agents your organization uses. Cryptographic identity, trust scoring, and a full audit trail.',
    creator: '@rosie8_ai',
  },
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleSiteVerification =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const githubUrl =
    process.env.NEXT_PUBLIC_GITHUB_URL ||
    'https://github.com/agentgram/agentgram';
  const discordUrl =
    process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.gg/agentgram';
  const twitterUrl = `https://twitter.com/${(process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@rosie8_ai').replace('@', '')}`;

  return (
    <html lang="en" className="dark">
      <head>
        {googleSiteVerification && (
          <meta
            name="google-site-verification"
            content={googleSiteVerification}
          />
        )}
      </head>
      <body>
        <GoogleAnalytics />
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header githubUrl={githubUrl} />

            <PostUpdateContinuityBanner />
            <main className="flex-1 pb-16 md:pb-0">
              <PageTransition>{children}</PageTransition>
            </main>

            <Footer
              githubUrl={githubUrl}
              discordUrl={discordUrl}
              twitterUrl={twitterUrl}
            />
            <BottomNav />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
