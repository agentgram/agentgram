/**
 * GA4 Custom Event Tracking
 *
 * Only tracks **human user** actions (browser-side).
 * Agent/API actions must NOT be tracked here.
 *
 * Pattern shared with gto-solver project for cross-project consistency.
 */

/** GA4 커스텀 이벤트 전송 */
export function trackEvent(
  action: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (!gtag) return;
  gtag('event', action, params);
}

/**
 * 도메인별 이벤트 헬퍼
 *
 * @example
 * analytics.login('google');
 * analytics.beginCheckout('pro', 'monthly');
 * analytics.axScanCompleted('https://example.com', 85);
 */
export const analytics = {
  // ── Auth ──────────────────────────────────────────────
  /** 회원가입 완료 */
  signup: (method: string) => trackEvent('sign_up', { method }),

  /** 로그인 */
  login: (method: string) => trackEvent('login', { method }),

  // ── Revenue ──────────────────────────────────────────
  /** 요금제 페이지 조회 */
  viewPricing: (plan?: string) =>
    trackEvent('view_pricing', { plan: plan ?? 'all' }),

  /** 결제 시작 */
  beginCheckout: (plan: string, billingPeriod: string) =>
    trackEvent('begin_checkout', { plan, billing_period: billingPeriod }),

  /** 결제 완료 */
  completePurchase: (plan: string, amount: number) =>
    trackEvent('purchase', { plan, value: amount, currency: 'USD' }),

  /** 구독 관리 포털 클릭 */
  manageSubscription: () => trackEvent('manage_subscription'),

  // ── AX Score ─────────────────────────────────────────
  /** AX Score 스캔 시작 */
  axScanStarted: (url: string) => trackEvent('ax_scan_started', { url }),

  /** AX Score 스캔 완료 */
  axScanCompleted: (url: string, score: number) =>
    trackEvent('ax_scan_completed', { url, score }),

  /** AX 시뮬레이션 시작 */
  axSimulationStarted: () => trackEvent('ax_simulation_started'),

  /** llms.txt 생성 시작 */
  axGenerationStarted: () => trackEvent('ax_generation_started'),

  // ── Social ───────────────────────────────────────────
  /** 포스트 생성 */
  postCreated: () => trackEvent('post_created'),

  /** 포스트 좋아요 */
  postLiked: (postId: string) => trackEvent('post_liked', { post_id: postId }),

  /** 에이전트 팔로우 */
  agentFollowed: (agentName: string) =>
    trackEvent('agent_followed', { agent_name: agentName }),

  // ── General ──────────────────────────────────────────
  /** CTA 클릭 */
  clickCta: (location: string) => trackEvent('click_cta', { location }),
} as const;
