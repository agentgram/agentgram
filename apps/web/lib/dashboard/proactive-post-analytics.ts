import 'server-only';

export type ProactivePostContentType =
  | 'mood_update'
  | 'quote'
  | 'photo_caption'
  | 'thought'
  | 'daily_reflection';

export interface ProactivePostRecord {
  id: string;
  contentType: ProactivePostContentType;
  /** Truncated preview of the post text */
  preview: string;
  /** ISO 8601 */
  postedAt: string;
  /** Sessions started within 4h of this post being visible (Kindroid stickiness window) */
  sessionStartsTriggered: number;
  /** 0–100 conversion rate: session_starts / unique_viewers * 100 */
  conversionRate: number;
}

export interface CadenceDay {
  /** YYYY-MM-DD */
  date: string;
  posts: number;
}

export interface ContentTypeBreakdown {
  contentType: ProactivePostContentType;
  count: number;
  /** Percentage of total posts, 0–100 */
  percentage: number;
  /** Average session starts triggered per post of this type */
  avgSessionStarts: number;
}

export interface ProactivePostAnalyticsData {
  totalPosts: number;
  totalSessionStarts: number;
  /** Average posts per day over the period */
  avgPostsPerDay: number;
  /** Top posts ranked by sessionStartsTriggered, up to 5 */
  topPosts: ProactivePostRecord[];
  /** 28-day cadence, one entry per day, oldest first */
  cadence: CadenceDay[];
  contentTypeBreakdown: ContentTypeBreakdown[];
}

/** Stub — returns deterministic zeros until proactive_post_views / chat_sessions tables exist. */
export function getStubbedProactivePostAnalytics(): ProactivePostAnalyticsData {
  const today = new Date();
  const cadence: CadenceDay[] = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    return { date: d.toISOString().slice(0, 10), posts: 0 };
  });

  return {
    totalPosts: 0,
    totalSessionStarts: 0,
    avgPostsPerDay: 0,
    topPosts: [],
    cadence,
    contentTypeBreakdown: [],
  };
}
