'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  animated?: boolean;
}

export function SectionHeader({ title, description, className = '', animated = true }: SectionHeaderProps) {
  const Content = (
    <div className={`mx-auto max-w-3xl text-center ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );

  if (!animated) return Content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
    >
      {Content}
    </motion.div>
  );
}
