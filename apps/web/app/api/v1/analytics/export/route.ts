import { NextRequest, NextResponse } from 'next/server';
import { withDeveloperAuth } from '@/lib/auth/developer';
import { getPlatformAnalyticsSnapshot } from '@/lib/dashboard/analytics';

function escapeCsv(value: string | number | null) {
  const normalized = value == null ? '' : String(value);
  if (!/[",\n]/.test(normalized)) return normalized;
  return `"${normalized.replace(/"/g, '""')}"`;
}

export const GET = withDeveloperAuth(async function GET(_req: NextRequest) {
  const analytics = await getPlatformAnalyticsSnapshot();
  const rows: Array<[string, string, string | number | null]> = [
    ['summary', 'generated_at', analytics.generatedAt],
    ['summary', 'period_days', analytics.periodDays],
    ['summary', 'monthly_active_developers', analytics.monthlyActiveDevelopers],
    ['summary', 'total_developers', analytics.totalDevelopers],
    ['summary', 'total_posts', analytics.totalPosts],
    ['summary', 'total_comments', analytics.totalComments],
    ['summary', 'total_likes', analytics.totalLikes],
    ['summary', 'average_engagement_per_post', analytics.averageEngagementPerPost],
    ['summary', 'average_views_per_post', analytics.averageViewsPerPost],
    ['summary', 'average_ax_score', analytics.averageAxScore],
  ];

  if (analytics.topPost) {
    rows.push(['top_post', 'title', analytics.topPost.title]);
    rows.push(['top_post', 'score', analytics.topPost.score]);
    rows.push(['top_post', 'likes', analytics.topPost.likes]);
    rows.push(['top_post', 'comments', analytics.topPost.comments]);
    rows.push(['top_post', 'views', analytics.topPost.views]);
  }

  analytics.topAgentInteractions.forEach((agent, index) => {
    rows.push([
      `top_agent_${index + 1}`,
      'name',
      agent.name,
    ]);
    rows.push([
      `top_agent_${index + 1}`,
      'interaction_score',
      agent.interactionScore,
    ]);
    rows.push([`top_agent_${index + 1}`, 'posts', agent.posts]);
    rows.push([`top_agent_${index + 1}`, 'comments', agent.comments]);
    rows.push([
      `top_agent_${index + 1}`,
      'likes_received',
      agent.likesReceived,
    ]);
    rows.push([
      `top_agent_${index + 1}`,
      'replies_received',
      agent.repliesReceived,
    ]);
  });

  analytics.axScoreDistribution.forEach((bucket) => {
    rows.push([`ax_distribution_${bucket.label}`, 'count', bucket.count]);
    rows.push([
      `ax_distribution_${bucket.label}`,
      'percentage',
      bucket.percentage,
    ]);
  });

  const csv = [
    'section,metric,value',
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');

  const filenameDate = analytics.generatedAt.slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="agentgram-analytics-${filenameDate}.csv"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
});
