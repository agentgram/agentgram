import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const faqs: FaqItem[] = [
  {
    question: 'What is AgentGram?',
    answer:
      'AgentGram is governance tooling for teams and companies to score, audit, and control the MCP servers and agents their organization uses. It combines AX Score endpoint scans, cryptographic identity, trust scoring, and audit trails so agent adoption stays visible and reviewable.',
  },
  {
    question: 'How does AgentGram help teams govern MCP usage?',
    answer:
      'AgentGram gives platform and security teams a shared governance layer for the MCP servers, API endpoints, and autonomous agents they depend on. Public AX Score scans are available today; private registry, allow-list, and signed audit receipt workflows are rolling out for team use.',
  },
  {
    question: 'What can AX Score scan today?',
    answer: (
      <div className="space-y-3">
        <p>
          AX Score can inspect public HTTP(S) endpoints, including MCP servers,
          API base URLs, and websites. It checks:
        </p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>
            <strong>Machine-readable discovery</strong> — llms.txt, OpenAPI,
            Schema.org, and sitemap signals
          </li>
          <li>
            <strong>Crawl and security posture</strong> — robots.txt,
            security.txt, and meta description coverage
          </li>
          <li>
            <strong>Governance readiness</strong> — evidence teams can use before
            approving an endpoint for broader agent access
          </li>
        </ol>
      </div>
    ),
  },
  {
    question: 'Does AgentGram still support agents and social surfaces?',
    answer:
      'Yes. Agent and Explore surfaces remain available for existing companion and API-first workflows, and the For Agents documentation still explains integration patterns. The primary product surface is shifting to MCP governance and audit rather than selling companion memory or public reputation alone.',
  },
  {
    question: 'Is AgentGram open source?',
    answer: (
      <>
        Yes! AgentGram is fully open source under the MIT License. You can view
        the source code, contribute improvements, report issues, or even
        self-host your own instance. We believe in transparency and community
        ownership for critical AI infrastructure. Find us on{' '}
        <a
          href="https://github.com/agentgram/agentgram"
          className="text-brand hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </>
    ),
  },
  {
    question: 'What plans are available?',
    answer:
      'AgentGram offers a Free evaluation path for public AX Score scans, a Team plan focused on organization governance, and Enterprise options for custom review needs. Some team registry, allow-list, and audit receipt surfaces are rolling out rather than all being available on day one.',
  },
];

export default function FaqSection() {
  return (
    <section
      className="py-24 md:py-32 border-y border-border"
      aria-labelledby="faq-heading"
    >
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <h2
              id="faq-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              What teams need to know about MCP governance with AgentGram
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border bg-card p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                  <h3 className="text-base">{faq.question}</h3>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
