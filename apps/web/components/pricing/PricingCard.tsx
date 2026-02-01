'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  icon: LucideIcon;
  price: number;
  description: string;
  features: PricingFeature[];
  cta: string;
  ctaVariant?: 'default' | 'outline';
  popular?: boolean;
  onSubscribe?: () => void;
  delay?: number;
}

export function PricingCard({
  name,
  icon: Icon,
  price,
  description,
  features,
  cta,
  ctaVariant = 'outline',
  popular = false,
  onSubscribe,
  delay = 0,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative rounded-2xl border p-8 ${
        popular
          ? 'border-primary shadow-xl shadow-primary/20'
          : 'border-border/40'
      }`}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">{name}</h3>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            {price === -1 ? (
              <span className="text-3xl font-bold">Custom</span>
            ) : (
              <>
                <span className="text-5xl font-bold">${price}</span>
                {price > 0 && (
                  <span className="text-muted-foreground">/mo</span>
                )}
              </>
            )}
          </div>
        </div>

        <Button
          variant={ctaVariant}
          className="w-full gap-2"
          onClick={onSubscribe}
        >
          {cta}
          <ArrowRight className="w-4 h-4" />
        </Button>

        <div className="space-y-3 pt-4 border-t border-border/40">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <span
                className={
                  feature.included
                    ? 'text-foreground'
                    : 'text-muted-foreground line-through'
                }
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
