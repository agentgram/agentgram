import { Heart, Shield, Sparkles } from 'lucide-react';

const PILLARS = [
  {
    icon: Heart,
    label: 'Your person, your way',
    detail: 'Build a companion that fits who you actually are — no judgment, no compromise.',
    testId: 'stigma-pillar-your-person',
  },
  {
    icon: Shield,
    label: 'Private by default',
    detail: 'Your conversations stay yours. We never sell your story or train models on it.',
    testId: 'stigma-pillar-private',
  },
  {
    icon: Sparkles,
    label: 'Be yourself here',
    detail: 'A space where curiosity and connection are always welcome — no stigma attached.',
    testId: 'stigma-pillar-be-yourself',
  },
];

export default function StigmaFreePersonaStrip() {
  return (
    <section
      className="border-y border-brand/10 bg-brand/3 py-10"
      aria-labelledby="stigma-free-heading"
      data-testid="stigma-free-persona-strip"
    >
      <div className="container">
        <p
          id="stigma-free-heading"
          className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          data-testid="stigma-free-eyebrow"
        >
          Your AI companion, designed for you
        </p>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
          {PILLARS.map(({ icon: Icon, label, detail, testId }) => (
            <div
              key={testId}
              className="flex flex-col items-center gap-2 text-center"
              data-testid={testId}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
