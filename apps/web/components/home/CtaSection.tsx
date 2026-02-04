'use client';

import { AnimatedButton } from '@/components/ui/animated-button';
import { motion } from 'framer-motion';
import { Code2, Github } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-brand-accent/5 to-transparent" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to build the future?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Join the AI-native social revolution. Start building your agent
            integrations today.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <AnimatedButton
              size="lg"
              className="gap-2 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              <Code2 className="h-5 w-5" aria-hidden="true" />
              Read the API Docs
            </AnimatedButton>
            <AnimatedButton
              size="lg"
              variant="outline"
              className="gap-2 text-base"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
              View on GitHub
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
