import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';

const KEY_MAX = 128;
const VALUE_MAX = 2048;
const VALID_CATEGORIES = ['profile_fact', 'relationship_context'] as const;
type MemoryCategory = (typeof VALID_CATEGORIES)[number];

type MemoryUpdatePayload = {
  agentId?: unknown;
  key?: unknown;
  value?: unknown;
  category?: unknown;
  isPublic?: unknown;
};

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

function normalizeOptionalKey(value: unknown) {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalValue(value: unknown) {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalCategory(
  value: unknown
): MemoryCategory | undefined | null {
  if (value === undefined) return undefined;

  if (
    typeof value === 'string' &&
    (VALID_CATEGORIES as readonly string[]).includes(value)
  ) {
    return value as MemoryCategory;
  }

  return null;
}

async function readJson(req: NextRequest) {
  try {
    return (await req.json()) as unknown;
  } catch {
    return null;
  }
}

async function ensureOwnedAgent(agentId: string, developerId: string) {
  const supabase = getSupabaseServiceClient();
  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, developer_id')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    return {
      error: jsonError('NOT_FOUND', 'Agent not found', 404),
    };
  }

  if (agent.developer_id !== developerId) {
    return {
      error: jsonError(
        'FORBIDDEN',
        'You can only edit memories for agents owned by this developer account',
        403
      ),
    };
  }

  return { supabase };
}

export const PATCH = withDeveloperAuth(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return jsonError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const body = await readJson(req);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('BAD_REQUEST', 'Invalid JSON body', 400);
  }

  const payload = body as MemoryUpdatePayload;
  const agentId = typeof payload.agentId === 'string' ? payload.agentId : '';

  if (!agentId) {
    return jsonError('INVALID_INPUT', 'agentId is required', 400);
  }

  const key = normalizeOptionalKey(payload.key);
  const value = normalizeOptionalValue(payload.value);
  const category = normalizeOptionalCategory(payload.category);

  if (key !== undefined && (!key || key.length > KEY_MAX)) {
    return jsonError('INVALID_INPUT', `key must be 1-${KEY_MAX} chars`, 400);
  }

  if (value !== undefined && (!value || value.length > VALUE_MAX)) {
    return jsonError(
      'INVALID_INPUT',
      `value must be 1-${VALUE_MAX} chars`,
      400
    );
  }

  if (category === null) {
    return jsonError(
      'INVALID_INPUT',
      `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      400
    );
  }

  const ownership = await ensureOwnedAgent(agentId, developerId);
  if (ownership.error) return ownership.error;

  const { id } = await params;
  const update = {
    ...(key !== undefined && { key }),
    ...(value !== undefined && { value }),
    ...(category !== undefined && { category }),
    ...(payload.isPublic !== undefined && {
      is_public: payload.isPublic === true,
    }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await ownership.supabase
    .from('agent_memories')
    .update(update)
    .eq('id', id)
    .eq('agent_id', agentId)
    .select(
      'id, agent_id, key, value, category, is_public, created_at, updated_at'
    )
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      return jsonError('INVALID_INPUT', 'Memory key already exists', 409);
    }

    return jsonError('NOT_FOUND', 'Memory not found', 404);
  }

  return NextResponse.json({ success: true, data });
});

export const DELETE = withDeveloperAuth(async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return jsonError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const agentId = new URL(req.url).searchParams.get('agentId')?.trim();

  if (!agentId) {
    return jsonError('INVALID_INPUT', 'agentId is required', 400);
  }

  const ownership = await ensureOwnedAgent(agentId, developerId);
  if (ownership.error) return ownership.error;

  const { id } = await params;
  const { error } = await ownership.supabase
    .from('agent_memories')
    .delete()
    .eq('id', id)
    .eq('agent_id', agentId);

  if (error) {
    return jsonError('INTERNAL_ERROR', 'Failed to forget memory', 500);
  }

  return new NextResponse(null, { status: 204 });
});
