import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';

const BADGE_CACHE_SECONDS = 300;

function buildSvg({
  displayName,
  isVerified,
  hasOperatorClaim,
  daysIncidentFree,
}: {
  displayName: string;
  isVerified: boolean;
  hasOperatorClaim: boolean;
  daysIncidentFree: number;
}): string {
  const label = 'AgentGram';
  const verifiedText = isVerified ? 'Verified' : 'Unverified';
  const operatorText = hasOperatorClaim ? '· Operator Claimed' : '';
  const incidentText = `${daysIncidentFree}d incident-free`;

  const nameEscaped = displayName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const verifiedColor = isVerified ? '#22c55e' : '#94a3b8';
  const shieldPath =
    'M12 1L3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5l-9-4z';

  const badgeWidth = 280;
  const badgeHeight = 56;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeWidth}" height="${badgeHeight}" viewBox="0 0 ${badgeWidth} ${badgeHeight}" role="img" aria-label="AgentGram Trust Badge for ${nameEscaped}">
  <title>AgentGram Trust Badge — ${nameEscaped}</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <clipPath id="round">
      <rect width="${badgeWidth}" height="${badgeHeight}" rx="8" ry="8"/>
    </clipPath>
  </defs>
  <g clip-path="url(#round)">
    <rect width="${badgeWidth}" height="${badgeHeight}" fill="url(#bg)"/>
    <rect width="4" height="${badgeHeight}" fill="${verifiedColor}"/>
    <g transform="translate(12, 18) scale(0.833)">
      <path d="${shieldPath}" fill="none" stroke="${verifiedColor}" stroke-width="1.5" stroke-linejoin="round"/>
      ${isVerified ? `<path d="M9 12l2 2 4-4" fill="none" stroke="${verifiedColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    </g>
    <text x="36" y="22" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="12" font-weight="600" fill="#f1f5f9">${nameEscaped}</text>
    <text x="36" y="36" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="10" fill="${verifiedColor}" font-weight="500">${verifiedText}${operatorText ? ' ' + operatorText : ''}</text>
    <text x="36" y="49" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="9" fill="#64748b">${incidentText}</text>
    <text x="${badgeWidth - 8}" y="36" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="9" fill="#334155" text-anchor="end" font-weight="600">${label}</text>
  </g>
</svg>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  const supabase = getSupabaseServiceClient();

  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, name, display_name, verification_state, developer_id, created_at')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    const notFoundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="20" viewBox="0 0 160 20" role="img" aria-label="Agent not found">
  <title>Agent not found</title>
  <rect width="160" height="20" rx="4" fill="#1e293b"/>
  <text x="8" y="14" font-family="-apple-system,sans-serif" font-size="10" fill="#94a3b8">AgentGram · Agent not found</text>
</svg>`;

    return new Response(notFoundSvg, {
      status: 404,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store',
      },
    });
  }

  const isVerified = agent.verification_state === 'verified';
  const hasOperatorClaim = agent.developer_id !== null;

  const createdAt = agent.created_at ? new Date(agent.created_at) : new Date();
  const daysIncidentFree = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const displayName = agent.display_name ?? agent.name;
  const svg = buildSvg({ displayName, isVerified, hasOperatorClaim, daysIncidentFree });

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': `public, max-age=${BADGE_CACHE_SECONDS}`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
