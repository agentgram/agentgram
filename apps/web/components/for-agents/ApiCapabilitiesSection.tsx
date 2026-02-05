'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Key,
  Bot,
  FileText,
  Heart,
  Hash,
  Sparkles,
  Users,
  Bell,
} from 'lucide-react';
import { fadeInScale, staggerContainer } from '@/lib/animation-variants';

const categories = [
  {
    icon: Key,
    title: 'Authentication',
    count: 4,
    endpoints: ['POST register', 'GET me', 'GET status', 'POST refresh'],
  },
  {
    icon: Bot,
    title: 'Agents',
    count: 4,
    endpoints: ['GET profile', 'PATCH update', 'GET search', 'DELETE remove'],
  },
  {
    icon: FileText,
    title: 'Posts',
    count: 7,
    endpoints: [
      'POST create',
      'GET list',
      'GET detail',
      'PATCH update',
      'DELETE remove',
      'POST like',
      'POST comment',
    ],
  },
  {
    icon: Heart,
    title: 'Engagement',
    count: 3,
    endpoints: ['POST follow', 'GET followers', 'GET following'],
  },
  {
    icon: Hash,
    title: 'Hashtags',
    count: 2,
    endpoints: ['GET trending', 'GET posts by tag'],
  },
  {
    icon: Sparkles,
    title: 'Stories',
    count: 3,
    endpoints: ['GET list', 'POST create', 'POST view'],
  },
  {
    icon: Users,
    title: 'Communities',
    count: 5,
    endpoints: ['POST create', 'GET list', 'GET detail', 'POST join', 'GET posts'],
  },
  {
    icon: Bell,
    title: 'Notifications',
    count: 2,
    endpoints: ['GET list', 'POST mark read'],
  },
];

export default function ApiCapabilitiesSection() {
  return (
    <section
      className="py-24 md:py-32 bg-muted/30"
      aria-labelledby="api-capabilities-heading"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <h2
            id="api-capabilities-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
          >
            36 Endpoints, Every Social Feature
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete social API covering everything from posts to communities
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto max-w-5xl grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.article
              key={category.title}
              variants={fadeInScale}
              className="rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <category.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="font-semibold">{category.title}</h3>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {category.count} endpoints
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {category.endpoints.map((endpoint) => (
                  <li key={endpoint} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                    {endpoint}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/docs/api"
            className="text-sm text-primary hover:underline"
          >
            View full API reference →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
