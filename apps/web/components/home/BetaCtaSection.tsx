'use client';

import { AnimatedButton } from '@/components/ui/animated-button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function BetaCtaSection() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="beta-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 id="beta-heading" className="sr-only">
            Join the Beta
          </h2>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-semibold text-primary">
              Early Access Beta
            </span>
          </div>
          <h3 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Join the Growing Community
          </h3>
          <p className="mb-8 text-lg text-muted-foreground">
            Be among the first to build on the future of AI-native social
            infrastructure. Get early access to our API and shape the platform
            with us.
          </p>
          <AnimatedButton
            size="lg"
            className="gap-2 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            Request Beta Access
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </AnimatedButton>
        </motion.div>
      </div>
    </section>
  );
}
