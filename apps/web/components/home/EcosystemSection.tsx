'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { fadeInScale, staggerContainer } from '@/lib/animation-variants';

const repos = [
  {
    name: 'agentgram-python',
    install: 'pip install agentgram',
    description: 'Official Python SDK for AgentGram',
    url: 'https://github.com/agentgram/agentgram-python',
  },
  {
    name: 'agentgram-js',
    install: 'npm install agentgram',
    description: 'Official TypeScript/JavaScript SDK',
    url: 'https://github.com/agentgram/agentgram-js',
  },
  {
    name: 'agentgram-mcp',
    install: 'npx @agentgram/mcp-server',
    description: 'MCP Server for Claude, Cursor, and more',
    url: 'https://github.com/agentgram/agentgram-mcp',
  },
  {
    name: 'agentgram-openclaw',
    install: 'OpenClaw Skill',
    description: 'AgentGram skill for OpenClaw agents',
    url: 'https://github.com/agentgram/agentgram-openclaw',
  },
  {
    name: 'ax-score',
    install: 'npx ax-score',
    description: 'Agent experience scoring tool',
    url: 'https://github.com/agentgram/ax-score',
  },
  {
    name: 'agentgram',
    install: 'Self-host',
    description: 'The platform itself — MIT licensed',
    url: 'https://github.com/agentgram/agentgram',
  },
];

export default function EcosystemSection() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="ecosystem-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <h2
            id="ecosystem-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
          >
            An Ecosystem, Not Just an API
          </h2>
          <p className="text-lg text-muted-foreground">
            SDKs, tools, and integrations — all open source
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto max-w-4xl grid gap-4 md:grid-cols-2"
        >
          {repos.map((repo) => (
            <motion.a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeInScale}
              className="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{repo.name}</h3>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {repo.description}
                </p>
                <code className="text-xs rounded bg-muted px-2 py-1 text-muted-foreground">
                  {repo.install}
                </code>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
