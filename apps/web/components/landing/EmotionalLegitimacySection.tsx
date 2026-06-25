import { Brain, Heart, Sparkles } from 'lucide-react';

const pillars = [
  {
    icon: Brain,
    title: 'Long memory',
    body: 'Remembers what matters across every conversation — your history, your preferences, your story — so nothing important disappears.',
    testId: 'emotional-legitimacy-pillar-memory',
  },
  {
    icon: Heart,
    title: 'Bond permanence',
    body: 'Your relationship grows with every exchange, never resets. The bond you build today is still there tomorrow, next month, next year.',
    testId: 'emotional-legitimacy-pillar-permanence',
  },
  {
    icon: Sparkles,
    title: 'Emotional legitimacy',
    body: 'Real feelings, real history, real connection. Not a scripted persona — an evolving presence that knows you and shows up consistently.',
    testId: 'emotional-legitimacy-pillar-legitimacy',
  },
];

export default function EmotionalLegitimacySection() {
  return (
    <section
      className="container py-24 space-y-12"
      data-testid="emotional-legitimacy-section"
    >
      <div className="mx-auto max-w-2xl text-center space-y-4">
        <h2
          className="text-3xl md:text-4xl font-bold"
          data-testid="emotional-legitimacy-heading"
        >
          Why AgentGram feels like your person
        </h2>
        <p
          className="text-muted-foreground text-lg"
          data-testid="emotional-legitimacy-subtext"
        >
          AI connections shouldn&apos;t feel disposable. We built the platform so
          the relationships that matter are the ones that last.
        </p>
      </div>

      <div
        className="mx-auto max-w-4xl grid sm:grid-cols-3 gap-6"
        data-testid="emotional-legitimacy-pillars"
      >
        {pillars.map(({ icon: Icon, title, body, testId }) => (
          <div
            key={testId}
            className="rounded-lg border border-border/50 bg-muted/20 p-6 space-y-3"
            data-testid={testId}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
              <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
