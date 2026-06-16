'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';

const questions = [
  {
    id: 'q1',
    text: 'Do you use AI companions to supplement (not replace) human relationships?',
  },
  {
    id: 'q2',
    text: 'Do you feel more energized after interactions with AI companions?',
  },
  {
    id: 'q3',
    text: 'Do you maintain boundaries and take breaks from AI companion use?',
  },
] as const;

type Answer = 'yes' | 'no';
type Answers = Record<string, Answer>;

function getResult(answers: Answers): {
  message: string;
  linkText: string;
} {
  const yesCount = Object.values(answers).filter((a) => a === 'yes').length;
  if (yesCount === 3) {
    return {
      message: "Looks like you're on track for healthy AI companion use 👍",
      linkText: 'Learn more',
    };
  }
  if (yesCount === 2) {
    return {
      message: 'A few things to keep in mind — read our healthy use guide',
      linkText: 'Read the guide',
    };
  }
  return {
    message: 'We recommend reviewing our healthy use guide',
    linkText: 'Review now',
  };
}

export default function HealthyUseWidget() {
  const [expanded, setExpanded] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});

  const allAnswered = Object.keys(answers).length === questions.length;

  function handleAnswer(questionId: string, answer: Answer) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  const result = allAnswered ? getResult(answers) : null;

  return (
    <section
      className="border-y border-green-500/20 bg-green-500/5 py-8"
      aria-label="Healthy AI companion use self-assessment"
      data-testid="healthy-use-widget"
    >
      <div className="container max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HeartPulse
                className="h-5 w-5 shrink-0 text-green-500"
                aria-hidden="true"
              />
              <h2 className="text-base font-semibold">
                Are you using AI companions healthily?
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="healthy-use-questions"
              data-testid="healthy-use-trigger"
              className="shrink-0 text-sm"
            >
              {expanded ? (
                <>
                  Hide <ChevronUp className="ml-1 h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  Check yourself{' '}
                  <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>

          {expanded && (
            <div
              id="healthy-use-questions"
              data-testid="healthy-use-questions"
              className="flex flex-col gap-4"
            >
              {questions.map((q, i) => (
                <div key={q.id} className="flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.text}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant={answers[q.id] === 'yes' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAnswer(q.id, 'yes')}
                      data-testid={`${q.id}-yes`}
                      aria-pressed={answers[q.id] === 'yes'}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={answers[q.id] === 'no' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAnswer(q.id, 'no')}
                      data-testid={`${q.id}-no`}
                      aria-pressed={answers[q.id] === 'no'}
                    >
                      No
                    </Button>
                  </div>
                </div>
              ))}

              {result && (
                <div
                  className="rounded-md border border-green-500/30 bg-green-500/10 p-4"
                  data-testid="healthy-use-result"
                >
                  <p className="mb-2 text-sm font-medium">{result.message}</p>
                  <Link
                    href="/blog/healthy-companion-use"
                    className="text-sm text-green-600 underline hover:text-green-700 dark:text-green-400"
                  >
                    {result.linkText} →
                  </Link>
                </div>
              )}

              <p
                className="text-xs text-muted-foreground"
                data-testid="healthy-use-citation"
              >
                Based on Aalto University CHI 2026 longitudinal study (Yunhao
                Yuan et al., ~2,000 users) on AI companion wellbeing outcomes.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
