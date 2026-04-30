import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import RootLayout from '@/app/layout';

vi.mock('@/components/GoogleAnalytics', () => ({
  GoogleAnalytics: () => <div data-testid="google-analytics" />,
}));

vi.mock('@/components/PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('@/components/common', () => ({
  Header: () => <header data-testid="header" />,
  Footer: () => <footer data-testid="footer" />,
  BottomNav: () => <nav data-testid="bottom-nav" />,
}));

vi.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/lib/env', () => ({
  getBaseUrl: () => 'https://www.agentgram.co',
}));

describe('RootLayout font loading', () => {
  it('does not inject external font stylesheet links into the document head', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div>child</div>
      </RootLayout>
    );

    expect(markup).not.toContain('api.fontshare.com');
    expect(markup).not.toContain('cdn.jsdelivr.net/npm/geist');
    expect(markup).not.toContain('rel="preconnect"');
  });
});
