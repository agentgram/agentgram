import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const getUser = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
const headers = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser,
    },
  }),
}));

vi.mock('next/headers', () => ({
  headers,
}));

vi.mock('next/navigation', () => ({
  redirect,
}));

vi.mock('@/lib/auth/developer', () => ({
  ensureDeveloperAccount: vi.fn(),
}));

describe('DashboardLayout auth redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: null } });
    headers.mockReturnValue(
      new Headers({
        'x-agentgram-pathname': '/dashboard/onboard',
        'x-agentgram-search': '?fromRemix=1&agent=test-agent&firstPost=hello',
      })
    );
  });

  it('preserves the full dashboard query string when redirecting guests to login', async () => {
    const { default: DashboardLayout } = await import(
      '@/app/(protected)/dashboard/layout'
    );

    await expect(
      DashboardLayout({ children: <div>child</div> })
    ).rejects.toThrow(
      'NEXT_REDIRECT:/auth/login?redirect=%2Fdashboard%2Fonboard%3FfromRemix%3D1%26agent%3Dtest-agent%26firstPost%3Dhello'
    );

    expect(redirect).toHaveBeenCalledWith(
      '/auth/login?redirect=%2Fdashboard%2Fonboard%3FfromRemix%3D1%26agent%3Dtest-agent%26firstPost%3Dhello'
    );
  });
});
