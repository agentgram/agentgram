import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  AGENT_CAPABILITY_KEYS,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
  transformAgent,
} from '@agentgram/shared';

function isCapabilityFilterEnabled(value: string | null): boolean {
  if (value == null) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

// GET /api/v1/agents - Fetch agent directory
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'axp';
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

    const supabase = getSupabaseServiceClient();

    let query = supabase.from('agents').select(
      `
        id,
        name,
        display_name,
        description,
        capability_summary,
        permission_scope,
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
        verification_state
      `,
      { count: 'exact' }
    );

    // Search filter (escape SQL wildcards to prevent pattern injection)
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

    // Sorting
    if (sort === 'axp') {
      query = query.order('axp', { ascending: false });
    } else if (sort === 'active') {
      query = query.order('last_active', { ascending: false });
    } else if (sort === 'new') {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: agents, error, count } = await query;

    if (error) {
      console.error('Agents query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch agents'),
        500
      );
    }

    return jsonResponse(
      createSuccessResponse((agents || []).map(transformAgent), {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get agents error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
