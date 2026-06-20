import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StoryWorldCarousel } from '../../../components/explore/StoryWorldCarousel';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('StoryWorldCarousel', () => {
  it('renders the "Explore Story Worlds" heading', () => {
    render(<StoryWorldCarousel />);
    expect(screen.getByTestId('story-world-carousel-heading')).toHaveTextContent(
      'Explore Story Worlds'
    );
  });

  it('renders all 5 story world cards', () => {
    render(<StoryWorldCarousel />);
    const cards = screen.getAllByTestId(/^story-world-card-/);
    expect(cards).toHaveLength(5);
  });

  it('renders cards for all 5 expected theme slugs', () => {
    render(<StoryWorldCarousel />);
    const slugs = ['fantasy', 'romance', 'scifi', 'historical', 'slice-of-life'];
    for (const slug of slugs) {
      expect(screen.getByTestId(`story-world-card-${slug}`)).toBeInTheDocument();
    }
  });

  it('each card links to /explore?theme={slug}', () => {
    render(<StoryWorldCarousel />);
    const slugs = ['fantasy', 'romance', 'scifi', 'historical', 'slice-of-life'];
    for (const slug of slugs) {
      expect(screen.getByTestId(`story-world-card-${slug}`)).toHaveAttribute(
        'href',
        `/explore?theme=${slug}`
      );
    }
  });

  it('renders correct names for each world theme', () => {
    render(<StoryWorldCarousel />);
    expect(screen.getByTestId('story-world-name-fantasy')).toHaveTextContent('Epic Worlds');
    expect(screen.getByTestId('story-world-name-romance')).toHaveTextContent('Love Stories');
    expect(screen.getByTestId('story-world-name-scifi')).toHaveTextContent('Future Worlds');
    expect(screen.getByTestId('story-world-name-historical')).toHaveTextContent('Past Lives');
    expect(screen.getByTestId('story-world-name-slice-of-life')).toHaveTextContent('Everyday Magic');
  });

  it('renders correct taglines for each world theme', () => {
    render(<StoryWorldCarousel />);
    expect(screen.getByTestId('story-world-tagline-fantasy')).toHaveTextContent(
      'Dragons, magic, and heroes'
    );
    expect(screen.getByTestId('story-world-tagline-romance')).toHaveTextContent(
      'Connection, chemistry, and heart'
    );
    expect(screen.getByTestId('story-world-tagline-scifi')).toHaveTextContent(
      'Space, technology, and tomorrow'
    );
    expect(screen.getByTestId('story-world-tagline-historical')).toHaveTextContent(
      'History, culture, and heritage'
    );
    expect(screen.getByTestId('story-world-tagline-slice-of-life')).toHaveTextContent(
      'Real moments, real bonds'
    );
  });

  it('renders an Explore CTA button on each card', () => {
    render(<StoryWorldCarousel />);
    const slugs = ['fantasy', 'romance', 'scifi', 'historical', 'slice-of-life'];
    for (const slug of slugs) {
      expect(screen.getByTestId(`story-world-cta-${slug}`)).toHaveTextContent('Explore');
    }
  });

  it('renders the scrollable container', () => {
    render(<StoryWorldCarousel />);
    expect(screen.getByTestId('story-world-carousel-scroll')).toBeInTheDocument();
  });

  it('wraps the section with the correct aria-label', () => {
    render(<StoryWorldCarousel />);
    const section = screen.getByTestId('story-world-carousel');
    expect(section).toHaveAttribute('aria-label', 'Explore Story Worlds');
  });
});
