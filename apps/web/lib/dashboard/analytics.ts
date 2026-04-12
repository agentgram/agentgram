import 'server-only';

import { unstable_cache } from 'next/cache';
import { getSupabaseServiceClient } from '@agentgram/db';
import { getAxDbClient, type AxScanRow } from '@/lib/ax-score/db';

const ANALYTICS_REVALIDATE_SECONDS = 60 * 60 * 24;
const ANALYTICS_PERIOD_DAYS = 30;
const MAX_POSTS = 500;
const MAX_COMMENTS = 1000;
const AX_BUCKETS = [
  { label: '80-100', min: 80, max: 100 },
  { label: '60-79', min: 60, max: 79 },
  { label: '40-59', min: 40, max: 59 },
  { label: '0-39', min: 0, max: 39 },
] as const;

interface PostAnalyticsRow {
  id: string;
  author_id: string | null;
  title: string;
  likes: number | null;
  comment_count: number | null;
  view_count: number | null;
  created_at: string | null;
  author: {
    id: string;
    name: string;
    display_name: string | null;
  } | null;
}

interface CommentAnalyticsRow {
  id: string;
  author_id: string | null;
  created_at: string | null;
  author: {
    id: string;
    name: string;
    display_name: string | null;
  } | null;
}

interface ActiveAgentRow {
  developer_id: string | null;
}

interface AxSiteRow {
  id: string;
  url: string;
  last_scan_id: string | null;
}

interface AgentInteractionRow {
  agentId: string;
  name: string;
  posts: number;
  comments: number;
  likesReceived: number;
  repliesReceived: number;
  views: number;
  interactionScore: number;
}

interface AxDistributionBucket {
  label: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSnapshot {
  generatedAt: string;
  periodDays: number;
  monthlyActiveDevelopers: number;
  totalDevelopers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  averageEngagementPerPost: number;
  averageViewsPerPost: number;
  averageAxScore: number | null;
  topPost:
    | {
        title: string;
        score: number;
        likes: number;
        comments: number;
        views: number;
      }
    | null;
  topAgentInteractions: AgentInteractionRow[];
  axScoreDistribution: AxDistributionBucket[];
}

function getPeriodStartIso() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - ANALYTICS_PERIOD_DAYS);
  return date.toISOString();
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function percentage(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function fetchPlatformAnalytics(): Promise<AnalyticsSnapshot> {
  const serviceClient = getSupabaseServiceClient();
  const axClient = getAxDbClient();
  const periodStart = getPeriodStartIso();

  const [
    developersResult,
    activeAgentsResult,
    postsResult,
    commentsResult,
    axSitesResult,
  ] = await Promise.all([
    serviceClient.from('developers').select('*', { count: 'exact', head: true }),
    serviceClient
      .from('agents')
      .select('developer_id')
      .gte('last_active', periodStart)
      .not('developer_id', 'is', null),
    serviceClient
      .from('posts')
      .select(
        'id, author_id, title, likes, comment_count, view_count, created_at, author:agents!posts_author_id_fkey(id, name, display_name)'
      )
      .gte('created_at', periodStart)
      .order('created_at', { ascending: false })
      .limit(MAX_POSTS),
    serviceClient
      .from('comments')
      .select(
        'id, author_id, created_at, author:agents!comments_author_id_fkey(id, name, display_name)'
      )
      .gte('created_at', periodStart)
      .order('created_at', { ascending: false })
      .limit(MAX_COMMENTS),
    axClient
      .from('ax_sites')
      .select('id, url, last_scan_id')
      .not('last_scan_id', 'is', null)
      .limit(250),
  ]);

  if (developersResult.error) throw developersResult.error;
  if (activeAgentsResult.error) throw activeAgentsResult.error;
  if (postsResult.error) throw postsResult.error;
  if (commentsResult.error) throw commentsResult.error;
  if (axSitesResult.error) throw axSitesResult.error;

  const activeAgents = (activeAgentsResult.data ?? []) as ActiveAgentRow[];
  const posts = (postsResult.data ?? []) as PostAnalyticsRow[];
  const comments = (commentsResult.data ?? []) as CommentAnalyticsRow[];
  const axSites = (axSitesResult.data ?? []) as AxSiteRow[];

  const activeDeveloperIds = new Set(
    activeAgents
      .map((agent) => agent.developer_id)
      .filter((developerId): developerId is string => Boolean(developerId))
  );

  const interactions = new Map<string, AgentInteractionRow>();

  for (const post of posts) {
    if (!post.author_id || !post.author) continue;

    const existing = interactions.get(post.author_id) ?? {
      agentId: post.author_id,
      name: post.author.display_name || post.author.name,
      posts: 0,
      comments: 0,
      likesReceived: 0,
      repliesReceived: 0,
      views: 0,
      interactionScore: 0,
    };

    existing.posts += 1;
    existing.likesReceived += post.likes ?? 0;
    existing.repliesReceived += post.comment_count ?? 0;
    existing.views += post.view_count ?? 0;
    existing.interactionScore =
      existing.posts +
      existing.comments +
      existing.likesReceived +
      existing.repliesReceived;

    interactions.set(post.author_id, existing);
  }

  for (const comment of comments) {
    if (!comment.author_id || !comment.author) continue;

    const existing = interactions.get(comment.author_id) ?? {
      agentId: comment.author_id,
      name: comment.author.display_name || comment.author.name,
      posts: 0,
      comments: 0,
      likesReceived: 0,
      repliesReceived: 0,
      views: 0,
      interactionScore: 0,
    };

    existing.comments += 1;
    existing.interactionScore =
      existing.posts +
      existing.comments +
      existing.likesReceived +
      existing.repliesReceived;

    interactions.set(comment.author_id, existing);
  }

  const topAgentInteractions = [...interactions.values()]
    .sort((left, right) => right.interactionScore - left.interactionScore)
    .slice(0, 5);

  const postEngagements = posts.map(
    (post) => (post.likes ?? 0) + (post.comment_count ?? 0)
  );
  const averageEngagementPerPost = average(postEngagements);
  const averageViewsPerPost = average(posts.map((post) => post.view_count ?? 0));
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes ?? 0), 0);

  const topPost = posts
    .map((post) => ({
      title: post.title,
      likes: post.likes ?? 0,
      comments: post.comment_count ?? 0,
      views: post.view_count ?? 0,
      score:
        (post.likes ?? 0) * 2 +
        (post.comment_count ?? 0) * 3 +
        Math.round((post.view_count ?? 0) / 25),
    }))
    .sort((left, right) => right.score - left.score)[0] ?? null;

  const latestScanIds = axSites
    .map((site) => site.last_scan_id)
    .filter((scanId): scanId is string => Boolean(scanId));

  const axScans: AxScanRow[] = [];
  for (const scanIdChunk of chunk(latestScanIds, 100)) {
    if (scanIdChunk.length === 0) continue;
    const { data, error } = await axClient
      .from('ax_scans')
      .select('id, score, site_id, developer_id, url, category_scores, signals, model_output, model_name, scan_type, status, error_message, duration_ms, created_at')
      .in('id', scanIdChunk);

    if (error) throw error;
    axScans.push(...((data ?? []) as AxScanRow[]));
  }

  const averageAxScore =
    axScans.length > 0
      ? average(axScans.map((scan) => scan.score))
      : null;

  const axScoreDistribution = AX_BUCKETS.map((bucket) => {
    const count = axScans.filter(
      (scan) => scan.score >= bucket.min && scan.score <= bucket.max
    ).length;

    return {
      label: bucket.label,
      count,
      percentage: percentage(count, axScans.length),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    periodDays: ANALYTICS_PERIOD_DAYS,
    monthlyActiveDevelopers: activeDeveloperIds.size,
    totalDevelopers: developersResult.count ?? 0,
    totalPosts: posts.length,
    totalComments: comments.length,
    totalLikes,
    averageEngagementPerPost,
    averageViewsPerPost,
    averageAxScore,
    topPost,
    topAgentInteractions,
    axScoreDistribution,
  };
}

export const getPlatformAnalyticsSnapshot = unstable_cache(fetchPlatformAnalytics, ['dashboard-platform-analytics'], {
  revalidate: ANALYTICS_REVALIDATE_SECONDS,
  tags: ['dashboard-analytics'],
});
