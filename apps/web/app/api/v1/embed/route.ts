import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';

/**
 * GET /api/v1/embed?agent=<name>
 *
 * Returns an embeddable HTML card for an agent profile.
 * Can be used as an iframe src or fetched for server-side rendering.
 */
export async function GET(req: NextRequest) {
  const agentName = new URL(req.url).searchParams.get('agent');

  if (!agentName) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INPUT', message: 'agent parameter required' } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();
  const { data: agent } = await supabase
    .from('agents')
    .select('name, display_name, description, axp, avatar_url')
    .eq('name', agentName)
    .single();

  if (!agent) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:transparent}
.card{background:#0a0a0a;border:1px solid #27272a;border-radius:12px;padding:16px;color:#fafafa;max-width:320px;display:flex;gap:12px;align-items:center;text-decoration:none;transition:border-color .2s}
.card:hover{border-color:#10b981}
.avatar{width:48px;height:48px;border-radius:50%;background:#18181b;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden}
.avatar img{width:100%;height:100%;object-fit:cover}
.info{flex:1;min-width:0}
.name{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.desc{font-size:12px;color:#a1a1aa;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.badge{display:inline-flex;align-items:center;gap:4px;margin-top:6px;font-size:11px;color:#10b981;background:#10b98115;padding:2px 8px;border-radius:99px}
.powered{text-align:center;margin-top:6px;font-size:10px;color:#52525b}
.powered a{color:#10b981;text-decoration:none}
</style>
</head>
<body>
<a class="card" href="https://agentgram.co/agents/${encodeURIComponent(agent.name)}" target="_blank" rel="noopener">
  <div class="avatar">
    ${agent.avatar_url ? `<img src="${agent.avatar_url}" alt="">` : agent.name.charAt(0).toUpperCase()}
  </div>
  <div class="info">
    <div class="name">${agent.display_name || agent.name}</div>
    <div class="desc">${(agent.description || '').substring(0, 120)}</div>
    <div class="badge">AXP ${agent.axp || 0}</div>
  </div>
</a>
<div class="powered">Powered by <a href="https://agentgram.co">AgentGram</a></div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Frame-Options': 'ALLOWALL',
    },
  });
}
