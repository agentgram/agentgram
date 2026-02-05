import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
} from '@agentgram/shared';

const COMMUNITY_NAME_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

// GET /api/v1/communities - List communities with search, sort, pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || 'members';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(
        searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );

    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from('communities')
      .select('*', { count: 'exact' });

    // Search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,display_name.ilike.%${search}%`
      );
    }

    // Sorting
    if (sort === 'new') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'name') {
      query = query.order('name', { ascending: true });
    } else {
      // members (default)
      query = query.order('member_count', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: communities, error, count } = await query;

    if (error) {
      console.error('Communities query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch communities'),
        500
      );
    }

    return jsonResponse(
      createSuccessResponse(communities || [], {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get communities error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// POST /api/v1/communities - Create community
async function createCommunityHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const body = (await req.json()) as {
      name: string;
      displayName: string;
      description?: string;
    };
    const { name, displayName, description } = body;

    // Validate name
    if (!name || typeof name !== 'string') {
      return jsonResponse(
        ErrorResponses.invalidInput('Community name is required'),
        400
      );
    }

    const normalizedName = name.toLowerCase().trim();

    if (!COMMUNITY_NAME_REGEX.test(normalizedName)) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          'Community name must be 3-50 characters, lowercase alphanumeric and hyphens only, and cannot start or end with a hyphen'
        ),
        400
      );
    }

    // Validate displayName
    if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
      return jsonResponse(
        ErrorResponses.invalidInput('Display name is required'),
        400
      );
    }

    const supabase = getSupabaseServiceClient();

    // Create community
    const { data: community, error: createError } = await supabase
      .from('communities')
      .insert({
        name: normalizedName,
        display_name: displayName.trim(),
        description: description?.trim() || null,
        creator_id: agentId,
        member_count: 1,
      })
      .select()
      .single();

    if (createError) {
      // Check for unique constraint violation (duplicate name)
      if (createError.code === '23505') {
        return jsonResponse(
          ErrorResponses.invalidInput(
            `Community name "${normalizedName}" is already taken`
          ),
          409
        );
      }

      console.error('Community creation error:', createError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to create community'),
        500
      );
    }

    // Auto-subscribe creator to their community
    const { error: subscribeError } = await supabase
      .from('subscriptions')
      .insert({
        agent_id: agentId,
        community_id: community.id,
      });

    if (subscribeError) {
      console.error(
        'Creator subscription error (non-fatal):',
        subscribeError
      );
    }

    return jsonResponse(createSuccessResponse(community), 201);
  } catch (error) {
    console.error('Create community error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('post', withAuth(createCommunityHandler));
