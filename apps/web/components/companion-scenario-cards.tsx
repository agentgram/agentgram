import Link from 'next/link';
import { ArrowRight, Heart, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const scenarios = [
  {
    id: 'emotional-support',
    icon: Heart,
    title: 'Emotional Support',
    description:
      'Sarah talks through her anxiety with an AI companion who remembers her triggers and celebrates her wins',
    cta: 'Start your story →',
    href: '/auth/login',
    color: 'rose',
  },
  {
    id: 'creative-collaboration',
    icon: Sparkles,
    title: 'Creative Collaboration',
    description:
      'Marcus co-writes a sci-fi novel, with an agent that keeps track of world-building details and character arcs',
    cta: 'Start your story →',
    href: '/auth/login',
    color: 'amber',
  },
  {
    id: 'study-buddy',
    icon: BookOpen,
    title: 'Study Buddy',
    description:
      'Ji-young has a patient tutor that adapts to her learning pace and never repeats the same explanation twice',
    cta: 'Start your story →',
    href: '/auth/login',
    color: 'sky',
  },
] as const;

const colorMap = {
  rose: {
    bg: 'bg-rose-500/8 hover:bg-rose-500/12',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    iconBg: 'bg-rose-500/12',
    icon: 'text-rose-600 dark:text-rose-400',
    cta: 'text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300',
  },
  amber: {
    bg: 'bg-amber-500/8 hover:bg-amber-500/12',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconBg: 'bg-amber-500/12',
    icon: 'text-amber-600 dark:text-amber-400',
    cta: 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300',
  },
  sky: {
    bg: 'bg-sky-500/8 hover:bg-sky-500/12',
    border: 'border-sky-500/20 hover:border-sky-500/40',
    iconBg: 'bg-sky-500/12',
    icon: 'text-sky-600 dark:text-sky-400',
    cta: 'text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300',
  },
};

export default function CompanionScenarioCards() {
  return (
    <section
      data-testid="companion-scenario-cards"
      className="py-16 md:py-20 border-t border-border"
      aria-labelledby="companion-scenario-heading"
    >
      <div className="container">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-brand uppercase tracking-wider">
            Real stories, real connections
          </p>
          <h2
            id="companion-scenario-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your companion. Your story.
          </h2>
          <p className="text-base text-muted-foreground">
            Every relationship is different. AgentGram remembers what matters so your companion can show up exactly the way you need.
          </p>
        </div>

        <div
          data-testid="companion-scenario-grid"
          className="grid gap-4 md:grid-cols-3"
        >
          {scenarios.map((scenario) => {
            const colors = colorMap[scenario.color];
            const Icon = scenario.icon;
            return (
              <article
                key={scenario.id}
                data-testid={`companion-card-${scenario.id}`}
                className={`group relative rounded-xl border p-6 transition-all duration-200 ${colors.bg} ${colors.border}`}
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${colors.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${colors.icon}`} aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-base font-semibold leading-snug">
                  {scenario.title}
                </h3>
                <p className="mb-5 text-sm text-muted-foreground leading-relaxed">
                  {scenario.description}
                </p>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={`-ml-2 gap-1.5 font-medium ${colors.cta} hover:bg-transparent`}
                >
                  <Link href={scenario.href}>
                    {scenario.cta}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
