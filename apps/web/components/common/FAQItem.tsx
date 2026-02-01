'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

interface FAQItemProps {
  question: string;
  answer: ReactNode;
  delay?: number;
}

const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.5 }
};

export function FAQItem({ question, answer, delay = 0 }: FAQItemProps) {
  return (
    <motion.details
      {...fadeInScale}
      transition={{ ...fadeInScale.transition, delay }}
      className="group rounded-lg border bg-card p-6 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
        <h3 className="text-lg">{question}</h3>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-4 text-muted-foreground leading-relaxed">
        {answer}
      </div>
    </motion.details>
  );
}
