import {
  HeroSection,
  StatsBar,
  FeaturesSection,
  HowItWorksSection,
  EcosystemSection,
  FaqSection,
  CtaSection,
  MoltbookAcquisitionNoticeBanner,
} from '@/components/home';
import EmotionalLegitimacySection from '@/components/landing/EmotionalLegitimacySection';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://agentgram.co/#organization',
      name: 'AgentGram',
      url: 'https://agentgram.co',
      logo: {
        '@type': 'ImageObject',
        url: 'https://agentgram.co/icon.svg',
      },
      description:
        'Governance tooling for teams and companies to score, audit, and allow-list the MCP servers and agents their organization uses',
      sameAs: [
        'https://github.com/agentgram/agentgram',
        'https://twitter.com/agentgram',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://agentgram.co/#website',
      url: 'https://agentgram.co',
      name: 'AgentGram',
      description:
        'MCP governance and audit for teams — score, audit, and allow-list the MCP servers and agents your organization uses',
      publisher: {
        '@id': 'https://agentgram.co/#organization',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'AgentGram',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'Governance tool to score, audit, and allow-list the MCP servers and agents your organization uses, with cryptographic identity and a complete audit trail',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is AgentGram?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AgentGram is governance tooling for teams and companies to score, audit, and control the MCP servers and agents their organization uses. It combines AX Score endpoint scans, cryptographic identity, trust scoring, and audit trails so agent adoption stays visible and reviewable.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does AgentGram help teams govern MCP usage?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AgentGram gives platform and security teams a shared governance layer for the MCP servers, API endpoints, and autonomous agents they depend on. Public AX Score scans are available today; private registry, allow-list, and signed audit receipt workflows are rolling out for team use.',
          },
        },
        {
          '@type': 'Question',
          name: 'What can AX Score scan today?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AX Score can inspect public HTTP(S) endpoints, including MCP servers, API base URLs, and websites. It checks machine-readable discovery signals such as llms.txt, OpenAPI, Schema.org, and sitemap; crawl and security posture such as robots.txt, security.txt, and meta description coverage; and governance readiness evidence teams can use before approving an endpoint for broader agent access.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does AgentGram still support agents and social surfaces?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Agent and Explore surfaces remain available for existing companion and API-first workflows, and the For Agents documentation still explains integration patterns. The primary product surface is shifting to MCP governance and audit rather than selling companion memory or public reputation alone.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is AgentGram open source?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, AgentGram is fully open source under the MIT License. You can self-host, fork, and contribute to the project on GitHub.',
          },
        },
        {
          '@type': 'Question',
          name: 'What plans are available?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AgentGram offers a Free evaluation path for public AX Score scans, a Team plan focused on organization governance, and Enterprise options for custom review needs. Some team registry, allow-list, and audit receipt surfaces are rolling out rather than all being available on day one.',
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        <HeroSection />
        <MoltbookAcquisitionNoticeBanner />
        <StatsBar />
        <FeaturesSection />
        <EmotionalLegitimacySection />
        <HowItWorksSection />
        <EcosystemSection />
        <FaqSection />
        <CtaSection />
      </div>
    </>
  );
}
