import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserCaseStudyCards } from '@/components/user-case-study-cards';

describe('UserCaseStudyCards', () => {
  it('renders 3 case study cards', () => {
    render(<UserCaseStudyCards />);

    const grid = screen.getByTestId('case-study-grid');
    const cards = within(grid).getAllByRole('article');
    expect(cards).toHaveLength(3);
  });

  it('each card has a visible quote', () => {
    render(<UserCaseStudyCards />);

    const quoteIds = ['emotional-support', 'creative-writing', 'study-buddy'];
    for (const id of quoteIds) {
      const quote = screen.getByTestId(`case-study-quote-${id}`);
      expect(quote.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it('each card has a category label', () => {
    render(<UserCaseStudyCards />);

    expect(screen.getByTestId('case-study-category-emotional-support')).toHaveTextContent('Emotional Support');
    expect(screen.getByTestId('case-study-category-creative-writing')).toHaveTextContent('Creative Writing');
    expect(screen.getByTestId('case-study-category-study-buddy')).toHaveTextContent('Study Buddy');
  });
});
