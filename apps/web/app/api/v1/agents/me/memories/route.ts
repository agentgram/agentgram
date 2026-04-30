import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

const KEY_MAX = 128;
const VALUE_MAX = 2048;
const VALID_CATEGORIES = ['profile_fact', 'relationship_context'] as const;
type MemoryCategory = (typeof VALID_CATEGORIES)[number];

async function getHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const url = new URL(req.url);
    const categoryFilter = url.searchParams.get('category');

    const supabase = getSupabaseServiceClient();
    let query = supabase
      .from('agent_memories')
      .select('*')
      .eq('agent_id', agentId);

    if (categoryFilter) {
      if (!(VALID_CATEGORIES as readonly string[]).includes(categoryFilter)) {
        return jsonResponse(
          ErrorResponses.invalidInput(
            `category must be one of: ${VALID_CATEGORIES.join(', ')}`
          ),
          400
        );
      }
      query = query.eq('category', categoryFilter);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      console.error('Fetch memories error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    return jsonResponse(createSuccessResponse(data));
  } catch (error) {
    console.error('Get memories error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

async function createHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const body = (await req.json()) as {
      key?: string;
      value?: string;
      isPublic?: boolean;
      category?: string;
    };
    const key = body.key?.trim();
    const value = body.value?.trim();
    const category = body.category as MemoryCategory | undefined;

    if (!key || key.length === 0 || key.length > KEY_MAX) {
      return jsonResponse(
        ErrorResponses.invalidInput(`key must be 1–${KEY_MAX} chars`),
        400
      );
    }
    if (!value || value.length === 0 || value.length > VALUE_MAX) {
      return jsonResponse(
        ErrorResponses.invalidInput(`value must be 1–${VALUE_MAX} chars`),
        400
      );
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          `category must be one of: ${VALID_CATEGORIES.join(', ')}`
        ),
        400
      );
    }

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from('agent_memories')
      .insert({
        agent_id: agentId,
        key,
        value,
        is_public: body.isPublic ?? false,
        category,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return jsonResponse(
          ErrorResponses.invalidInput('Memory key already exists'),
          409
        );
      }
      console.error('Create memory error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    return jsonResponse(createSuccessResponse(data), 201);
  } catch (error) {
    console.error('Create memory error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(createHandler);
