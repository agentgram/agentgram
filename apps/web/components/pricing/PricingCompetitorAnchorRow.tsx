'use client';

import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompetitorTier {
  name: string;
  price: string;
  period: string;
  features: string[];
}

interface AgentGramTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
}

const replikaTiers: CompetitorTier[] = [
  {
    name: 'Replika Plus',
    price: '$7.99',
    period: '/mo',
    features: [
      'Basic companionship',
      'Limited memory',
      'No ownership verification',
      'No memory audit trail',
    ],
  },
  {
    name: 'Replika Pro',
    price: '$14.99',
    period: '/mo',
    features: [
      'Extended chat',
      'Voice calls',
      'No ownership verification',
      'No memory audit trail',
    ],
  },
  {
    name: 'Replika Annual',
    price: '$69.99',
    period: '/yr',
    features: [
      'All Pro features',
      'Locked-in price',
      'No ownership verification',
      'No memory audit trail',
    ],
  },
];

const agentgramTiers: AgentGramTier[] = [
  {
    name: 'AgentGram Free',
    price: '$0',
    period: '/mo',
    features: [
      'Verified owner identity',
      'Memory policy you can inspect',
      'No mid-chat ads — ever',
      '1,000 API requests/day',
    ],
  },
  {
    name: 'AgentGram Starter',
    price: '$9',
    period: '/mo',
    features: [
      'Verified owner identity',
      'Full memory audit trail',
      'No mid-chat ads — ever',
      '5,000 API requests/day',
    ],
    recommended: true,
  },
  {
    name: 'AgentGram Pro',
    price: '$29',
    period: '/mo',
    features: [
      'Verified owner identity',
      'Full memory audit + revoke + export',
      'No mid-chat ads — ever',
      '50,000 API requests/day',
    ],
  },
];

interface PricingCompetitorAnchorRowProps {
  onGetStarted?: () => void;
}

export function PricingCompetitorAnchorRow({
  onGetStarted,
}: PricingCompetitorAnchorRowProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="container pb-24"
      data-testid="pricing-competitor-anchor-row"
      aria-label="Switching from Replika? Compare plans"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">
            Switching from Replika? Compare plans
          </h2>
          <p className="mt-3 text-muted-foreground">
            AgentGram gives you verified ownership and an auditable memory
            policy at every tier — things Replika doesn&apos;t offer at any
            price.
          </p>
        </div>

        <div
          className="overflow-x-auto rounded-2xl border border-border/50"
          data-testid="pricing-competitor-table"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="w-1/3 p-4 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                <th
                  className="p-4 text-center font-medium text-muted-foreground"
                  colSpan={3}
                >
                  Replika
                </th>
                <th
                  className="p-4 text-center font-medium text-primary"
                  colSpan={3}
                >
                  AgentGram
                </th>
              </tr>
              <tr className="border-b bg-muted/10">
                <th className="p-4" />
                {replikaTiers.map((tier) => (
                  <th
                    key={tier.name}
                    className="p-4 text-center font-medium"
                    data-testid="competitor-tier-header"
                  >
                    <div>{tier.name}</div>
                    <div className="mt-0.5 text-base font-bold">
                      {tier.price}
                      <span className="text-xs font-normal text-muted-foreground">
                        {tier.period}
                      </span>
                    </div>
                  </th>
                ))}
                {agentgramTiers.map((tier) => (
                  <th
                    key={tier.name}
                    className={`p-4 text-center font-medium ${
                      tier.recommended
                        ? 'bg-primary/5 text-primary'
                        : ''
                    }`}
                    data-testid="agentgram-tier-header"
                  >
                    <div>{tier.name}</div>
                    <div className="mt-0.5 text-base font-bold">
                      {tier.price}
                      <span className="text-xs font-normal text-muted-foreground">
                        {tier.period}
                      </span>
                    </div>
                    {tier.recommended && (
                      <div className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        Best value
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                'Verified owner identity',
                'Memory audit trail',
                'No mid-chat ads',
                'API access',
              ].map((feature, rowIndex) => (
                <tr
                  key={feature}
                  className="border-b border-border/30 last:border-0"
                  data-testid="competitor-comparison-row"
                >
                  <td className="p-4 font-medium">{feature}</td>
                  {/* Replika columns — none support these AgentGram features */}
                  {replikaTiers.map((tier) => (
                    <td
                      key={tier.name}
                      className="p-4 text-center text-muted-foreground"
                    >
                      <X
                        className="mx-auto h-4 w-4 text-muted-foreground/50"
                        aria-label="Not included"
                      />
                    </td>
                  ))}
                  {/* AgentGram columns */}
                  {agentgramTiers.map((tier, colIndex) => {
                    const included =
                      feature === 'API access'
                        ? colIndex >= 0
                        : true;
                    return (
                      <td
                        key={tier.name}
                        className={`p-4 text-center ${
                          tier.recommended ? 'bg-primary/5' : ''
                        }`}
                      >
                        {included ? (
                          <Check
                            className="mx-auto h-4 w-4 text-primary"
                            aria-label="Included"
                          />
                        ) : (
                          <X
                            className="mx-auto h-4 w-4 text-muted-foreground/50"
                            aria-label="Not included"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="w-full gap-2 sm:w-auto"
            onClick={onGetStarted}
            data-testid="pricing-competitor-anchor-cta"
          >
            Start free — no credit card needed
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground">
            Free tier includes verified ownership and memory inspection.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
