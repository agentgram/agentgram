import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';

const KEY_MAX = 128;
const VALUE_MAX = 2048;
const VALID_CATEGORIES = ['profile_fact', 'relationship_context'] as const;
type MemoryCategory = (typeof VALID_CATEGORIES)[number];

const VALID_SCOPES = ['private', 'group', 'public_canon'] as const;
type NoteScope = (typeof VALID_SCOPES)[number];

type MemoryPayload = {
  agentId?: unknown;
  key?: unknown;
  value?: unknown;
  category?: unknown;
  isPublic?: unknown;
  scope?: unknown;
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

function normalizeKey(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeCategory(value: unknown): MemoryCategory | null {
  if (
    typeof value === 'string' &&
    (VALID_CATEGORIES as readonly string[]).includes(value)
  ) {
    return value as MemoryCategory;
  }

  return null;
}

function normalizeScope(value: unknown): NoteScope {
  if (typeof value === 'string' && (VALID_SCOPES as readonly string[]).includes(value)) {
    return value as NoteScope;
  }
  return 'private';
}

function scopeToIsPublic(scope: NoteScope): boolean {
  return scope === 'public_canon';
}

function validateMemoryPayload(payload: MemoryPayload) {
  const key = normalizeKey(payload.key);
  const value = normalizeValue(payload.value);
  const category = normalizeCategory(payload.category);

  if (!key || key.length > KEY_MAX) {
    return {
      error: jsonError('INVALID_INPUT', `key must be 1-${KEY_MAX} chars`, 400),
    };
  }

  if (!value || value.length > VALUE_MAX) {
    return {
      error: jsonError(
        'INVALID_INPUT',
        `value must be 1-${VALUE_MAX} chars`,
        400
      ),
    };
  }

  if (!category) {
    return {
      error: jsonError(
        'INVALID_INPUT',
        `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        400
      ),
    };
  }

  const scope = normalizeScope(payload.scope);

  return {
    data: {
      key,
      value,
      category,
      scope,
      isPublic: scopeToIsPublic(scope),
    },
  };
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

export const GET = withDeveloperAuth(async function GET(req: NextRequest) {
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

  const { data, error } = await ownership.supabase
    .from('agent_memories')
    .select(
      'id, agent_id, key, value, category, is_public, created_at, updated_at'
    )
    .eq('agent_id', agentId)
    .order('updated_at', { ascending: false });

  if (error) {
    return jsonError('INTERNAL_ERROR', 'Failed to load memories', 500);
  }

  return NextResponse.json({ success: true, data });
});

export const POST = withDeveloperAuth(async function POST(req: NextRequest) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return jsonError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const body = await readJson(req);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('BAD_REQUEST', 'Invalid JSON body', 400);
  }

  const payload = body as MemoryPayload;
  const agentId = typeof payload.agentId === 'string' ? payload.agentId : '';

  if (!agentId) {
    return jsonError('INVALID_INPUT', 'agentId is required', 400);
  }

  const validated = validateMemoryPayload(payload);
  if (validated.error) return validated.error;

  const ownership = await ensureOwnedAgent(agentId, developerId);
  if (ownership.error) return ownership.error;

  const { data, error } = await ownership.supabase
    .from('agent_memories')
    .insert({
      agent_id: agentId,
      key: validated.data.key,
      value: validated.data.value,
      category: validated.data.category,
      is_public: validated.data.isPublic,
    })
    .select(
      'id, agent_id, key, value, category, is_public, created_at, updated_at'
    )
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonError('INVALID_INPUT', 'Memory key already exists', 409);
    }

    return jsonError('INTERNAL_ERROR', 'Failed to remember memory', 500);
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
});
