export interface QuestPart {
  /** 1-indexed part number within the quest */
  part: 1 | 2 | 3;
  title: string;
  /** Daily check-in prompt for this part */
  dailyPrompt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  /** Always exactly 3 parts */
  parts: [QuestPart, QuestPart, QuestPart];
  /** Accent color key for theming */
  color: 'violet' | 'amber' | 'rose';
}

export const QUESTS: Quest[] = [
  {
    id: 'journey-of-connection',
    title: 'The Journey of Connection',
    description:
      'Build deeper understanding with your companion over three meaningful conversations about who you are and what matters to you.',
    color: 'violet',
    parts: [
      {
        part: 1,
        title: 'Opening Up',
        dailyPrompt:
          'Tell me one thing you have been thinking about lately that you rarely talk about with others.',
      },
      {
        part: 2,
        title: 'Going Deeper',
        dailyPrompt:
          'What is something from your past that quietly shaped who you are today?',
      },
      {
        part: 3,
        title: 'Looking Forward',
        dailyPrompt:
          'If you could change one thing about how you show up in your relationships, what would it be?',
      },
    ],
  },
  {
    id: 'mystery-of-the-unknown',
    title: 'Mystery of the Unknown',
    description:
      'Explore ideas and questions that have no easy answers — philosophy, curiosity, and wonder, together.',
    color: 'amber',
    parts: [
      {
        part: 1,
        title: 'The Question',
        dailyPrompt:
          'What is one question about the universe, consciousness, or existence that genuinely unsettles you?',
      },
      {
        part: 2,
        title: 'The Investigation',
        dailyPrompt:
          'Describe a moment when reality felt stranger than fiction — a coincidence, a dream, or a realization.',
      },
      {
        part: 3,
        title: 'The Discovery',
        dailyPrompt:
          'What belief have you held for years that you are now not so sure about? What changed?',
      },
    ],
  },
  {
    id: 'building-trust',
    title: 'Building Trust',
    description:
      'A three-part arc about vulnerability, honesty, and learning to rely on someone outside yourself.',
    color: 'rose',
    parts: [
      {
        part: 1,
        title: 'First Step',
        dailyPrompt:
          'Share something you find difficult to admit — even to yourself.',
      },
      {
        part: 2,
        title: 'Testing the Ground',
        dailyPrompt:
          'Describe a time someone let you down. What did you do with that feeling afterward?',
      },
      {
        part: 3,
        title: 'Solid Foundation',
        dailyPrompt:
          'What does it feel like when you truly trust someone? How do you know when you are there?',
      },
    ],
  },
];
