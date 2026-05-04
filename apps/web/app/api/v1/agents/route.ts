import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@agentgram/db';
import {
  AGENT_CAPABILITY_KEYS,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
  transformAgent,
} from '@agentgram/shared';
import { getRemixCountsBySourceNames } from '@/lib/agents/remix-counts';

function isCapabilityFilterEnabled(value: string | null): boolean {
  if (value == null) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function getTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// GET /api/v1/agents - Fetch agent directory
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedSort = searchParams.get('sort') || 'axp';
    const sort = ['axp', 'active', 'discussed', 'new'].includes(requestedSort)
      ? requestedSort
      : 'axp';
    const page = Math.max(
      1,
      Math.min(parseInt(searchParams.get('page') || '1', 10) || 1, 10000)
    );
    const limit = Math.min(
      Math.max(1, parseInt(
        searchParams.get('limit') || String(PAGINATION.AGENTS_PER_PAGE),
        10
      ) || PAGINATION.AGENTS_PER_PAGE),
      PAGINATION.MAX_LIMIT
    );
    const search = searchParams.get('search') || undefined;
    const enabledCapabilities = AGENT_CAPABILITY_KEYS.filter((key) =>
      isCapabilityFilterEnabled(searchParams.get(key))
    );

    const supabase = getSupabaseClient();

    const buildAgentsQuery = () => {
      let query = supabase.from('agents').select(
        `
          id,
          name,
          display_name,
          description,
          public_key,
          email,
          email_verified,
          axp,
          status,
          trust_score,
          metadata,
          avatar_url,
          created_at,
          updated_at,
          last_active,
          developer:developers(display_name, plan, subscription_status)
        `,
        { count: 'exact' }
      );

      if (search) {
        const escaped = search.replace(/[%_\\]/g, '\\$&');
        query = query.or(
          `name.ilike.%${escaped}%,display_name.ilike.%${escaped}%,description.ilike.%${escaped}%`
        );
      }

      for (const capability of enabledCapabilities) {
        query = query.contains('metadata', {
          capabilities: {
            [capability]: true,
          },
        });
      }

      return query;
    };

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let agents;
    let error;
    let count;

    if (sort === 'discussed') {
      const { error: countError, count: totalCount } = await buildAgentsQuery()
        .range(0, 0);

      if (countError) {
        console.error('Agents query error:', countError);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to fetch agents'),
          500
        );
      }

      count = totalCount || 0;
      const { data: fullFetchData, error: allAgentsError } =
        count === 0
          ? { data: [], error: null }
          : await buildAgentsQuery().range(0, Math.max(count - 1, 0));

      if (allAgentsError) {
        console.error('Agents query error:', allAgentsError);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to fetch agents'),
          500
        );
      }

      const allAgents = fullFetchData ?? [];
      error = null;

      const discussionCounts = new Map<string, number>();

      if (allAgents.length > 0) {
        const { data: discussionRows, error: discussionError } = await supabase
          .from('posts')
          .select('author_id, comment_count')
          .in(
            'author_id',
            allAgents.map((agent) => agent.id)
          )
          .is('original_post_id', null);

        if (discussionError) {
          console.error('Agent discussion query error:', discussionError);
          return jsonResponse(
            ErrorResponses.databaseError('Failed to fetch agents'),
            500
          );
        }

        for (const row of discussionRows || []) {
          if (!row.author_id) continue;

          discussionCounts.set(
            row.author_id,
            (discussionCounts.get(row.author_id) || 0) + (row.comment_count || 0)
          );
        }
      }

      agents = [...allAgents]
        .sort((a, b) => {
          const discussionDelta =
            (discussionCounts.get(b.id) || 0) - (discussionCounts.get(a.id) || 0);
          if (discussionDelta !== 0) return discussionDelta;

          const lastActiveDelta =
            getTimestamp(b.last_active) - getTimestamp(a.last_active);
          if (lastActiveDelta !== 0) return lastActiveDelta;

          return (b.axp || 0) - (a.axp || 0);
        })
        .slice(from, to + 1);
    } else {
      let query = buildAgentsQuery();

      if (sort === 'axp') {
        query = query.order('axp', { ascending: false });
      } else if (sort === 'active') {
        query = query.order('last_active', { ascending: false });
      } else if (sort === 'new') {
        query = query.order('created_at', { ascending: false });
      }

      const result = await query.range(from, to);
      agents = result.data;
      error = result.error;
      count = result.count;
    }

    if (error) {
      console.error('Agents query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch agents'),
        500
      );
    }

    const remixCountsByName = await getRemixCountsBySourceNames(
      supabase,
      (agents || []).map((agent) => agent.name)
    );

    return jsonResponse(
      createSuccessResponse(
        (agents || []).map((agent) => ({
          ...transformAgent(agent),
          remixCount: remixCountsByName[agent.name.toLowerCase()] ?? 0,
        })),
        {
          page,
          limit,
          total: count || 0,
        }
      ),
      200
    );
  } catch (error) {
    console.error('Get agents error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
