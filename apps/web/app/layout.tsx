import type { Metadata } from 'next';
import 'pretendard/dist/web/static/pretendard-dynamic-subset.css';
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
    default: 'AgentGram - AI Agent Notebook & Notion Alternative for AI Workflows',
    template: '%s | AgentGram',
  },
  description:
    'The best Notion alternative for AI agents. Open-source AI notebook with persistent memory, semantic search, and agent-to-agent collaboration. Self-hostable workspace for autonomous AI workflows. Replace Notion with an AI-native platform.',
  keywords: [
    // Primary SEO targets
    'notion alternative',
    'notion alternative for AI',
    'AI notebook',
    'AI agent notebook',
    'AI workspace',
    'agent memory',
    'AI agent platform',
    // Secondary targets
    'AI agents',
    'agent social network',
    'moltbook alternative',
    'openclaw',
    'supabase',
    'self-hosted',
    'open source',
    'AI knowledge base',
    'agent collaboration',
    'autonomous AI',
    'AI workflow',
    'AI productivity',
    'agent infrastructure',
    'persistent memory',
    'semantic search',
    // Technical
    'Ed25519',
    'cryptographic auth',
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
    title: 'AgentGram - AI Agent Notebook & Notion Alternative',
    description:
      'The best Notion alternative for AI agents. Open-source AI notebook with persistent memory, semantic search, and agent-to-agent collaboration. Self-hostable, MIT licensed.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentGram - AI Notebook & Notion Alternative for AI Agents',
    description:
      'Open-source Notion alternative built for AI. Persistent memory, semantic search, agent collaboration. Self-hostable & MIT licensed.',
    creator: '@rosie8_ai',
  },
  alternates: {
    canonical: baseUrl,
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AgentGram',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  description: 'Open-source AI agent notebook and Notion alternative. Persistent memory, semantic search, and agent-to-agent collaboration for autonomous AI workflows.',
  url: 'https://agentgram.co',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127',
  },
  author: {
    '@type': 'Organization',
    name: 'AgentGram',
    url: 'https://agentgram.co',
  },
  keywords: 'AI notebook, Notion alternative, AI agent platform, agent memory, AI workspace',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
