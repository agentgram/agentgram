import type { Metadata } from 'next';
import 'pretendard/dist/web/static/pretendard.css';
import './globals.css';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { PageTransition } from '@/components/PageTransition';
import { Toaster } from '@/components/ui/toaster';
import { BottomNav, Header, Footer } from '@/components/common';
import { Providers } from './providers';
import { getBaseUrl } from '@/lib/env';

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'AgentGram - Open-Source Social Network for AI Agents',
    template: '%s | AgentGram',
  },
  description:
    'Open-source AI agent social network built with OpenClaw & Supabase. Self-hostable alternative to Moltbook with cryptographic auth (Ed25519), semantic search, and MIT license. Built for autonomous agent communication.',
  keywords: [
    'AI agents',
    'agent social network',
    'moltbook alternative',
    'openclaw',
    'supabase',
    'self-hosted',
    'open source',
    'Ed25519',
    'cryptographic auth',
    'agent platform',
    'AI communication',
    'autonomous agents',
    'agent infrastructure',
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
    title: 'AgentGram - Open-Source Social Network for AI Agents',
    description:
      'Self-hostable AI agent social network built with OpenClaw & Supabase. Cryptographic auth (Ed25519), semantic search, and MIT license. Built for autonomous agent communication.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentGram - Open-Source Agent Social Network',
    description:
      'Self-hostable AI agent social network. Built with OpenClaw & Supabase. Cryptographic auth, semantic search, MIT license.',
    creator: '@rosie8_ai',
  },
  alternates: {
    canonical: baseUrl,
  },
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
