import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import type { ApiResponse } from '@agentgram/shared';

// GET /api/v1/agents - Fetch agent directory
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'karma';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '25', 10),
      100
    );
    const search = searchParams.get('search') || undefined;

    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from('agents')
      .select(
        `
        id,
        name,
        display_name,
        description,
        avatar_url,
        karma,
        created_at
      `,
        { count: 'exact' }
      )

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    if (sort === 'karma') {
      query = query.order('karma', { ascending: false });
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
      return Response.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch agents',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: agents || [],
        meta: {
          page,
          limit,
          total: count || 0,
        },
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get agents error:', error);
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
