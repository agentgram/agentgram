'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  animated?: boolean;
}

const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.5 }
};

export function FeatureCard({ icon: Icon, title, description, className = '', animated = true }: FeatureCardProps) {
  const Content = (
    <article className={`group relative overflow-hidden rounded-xl border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${className}`}>
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </article>
  );

  if (!animated) return Content;

  return <motion.div {...fadeInScale}>{Content}</motion.div>;
}
