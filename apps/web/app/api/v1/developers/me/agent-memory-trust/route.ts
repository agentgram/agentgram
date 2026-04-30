import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  CONTENT_LIMITS,
  sanitizeDescription,
  sanitizeDisplayName,
  sanitizePersonaText,
} from '@agentgram/shared';
import { withDeveloperAuth } from '@/lib/auth/developer';

type EditableSnapshot = {
  displayName: string;
  description: string;
  backstory: string;
};

const DIGEST_FIELD_META = {
  displayName: {
    label: 'Display name',
    trustNote: 'Other developers and tools will see a new identity label first.',
  },
  description: {
    label: 'Profile summary',
    trustNote:
      'The public summary that frames this agent for readers has changed.',
  },
  backstory: {
    label: 'Active backstory',
    trustNote:
      'Future conversations can anchor on a different private pinned backstory.',
  },
} as const;

function normalizeSnapshot(snapshot: EditableSnapshot): EditableSnapshot {
  return {
    displayName: snapshot.displayName.trim(),
    description: snapshot.description.trim(),
    backstory: snapshot.backstory.trim(),
  };
}

function buildDigest(previous: EditableSnapshot, next: EditableSnapshot) {
  const changedFields = (
    Object.keys(DIGEST_FIELD_META) as Array<keyof EditableSnapshot>
  )
    .filter((key) => previous[key] !== next[key])
    .map((key) => {
      const previousValue = previous[key];
      const nextValue = next[key];

      let changeType: 'added' | 'updated' | 'cleared' = 'updated';
      if (!previousValue && nextValue) {
        changeType = 'added';
      } else if (previousValue && !nextValue) {
        changeType = 'cleared';
      }

      return {
        key,
        label: DIGEST_FIELD_META[key].label,
        trustNote: DIGEST_FIELD_META[key].trustNote,
        changeType,
        previousValue,
        nextValue,
      };
    });

  const summary =
    changedFields.length === 0
      ? 'No trust-facing memory fields changed.'
      : `${changedFields.length} trust-facing memory field${
          changedFields.length === 1 ? '' : 's'
        } changed. Review before continuing.`;

  return {
    changedFields,
    summary,
    recordedAt: new Date().toISOString(),
  };
}

export const PUT = withDeveloperAuth(async function PUT(req: NextRequest) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' },
      },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    typeof (body as Record<string, unknown>).agentId !== 'string'
  ) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'agentId is required' },
      },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;
  const agentId = payload.agentId as string;

  const supabase = getSupabaseServiceClient();

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, developer_id, display_name, description')
    .eq('id', agentId)
    .single();

  if (agentError || !agent) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agent not found' },
      },
      { status: 404 }
    );
  }

  if (agent.developer_id !== developerId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only edit agents owned by this developer account',
        },
      },
      { status: 403 }
    );
  }

  const { data: activePersona } = await supabase
    .from('agent_personas')
    .select('id, backstory')
    .eq('agent_id', agentId)
    .eq('is_active', true)
    .single();

  const previous = normalizeSnapshot({
    displayName: agent.display_name ?? '',
    description: agent.description ?? '',
    backstory: activePersona?.backstory ?? '',
  });

  const next = normalizeSnapshot({
    displayName: sanitizeDisplayName(
      typeof payload.displayName === 'string' ? payload.displayName : ''
    ),
    description: sanitizeDescription(
      typeof payload.description === 'string' ? payload.description : ''
    ),
    backstory: sanitizePersonaText(
      typeof payload.backstory === 'string' ? payload.backstory : '',
      CONTENT_LIMITS.PERSONA_BACKSTORY_MAX
    ),
  });

  const { error: updateAgentError } = await supabase
    .from('agents')
    .update({
      display_name: next.displayName || null,
      description: next.description || null,
    })
    .eq('id', agentId);

  if (updateAgentError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to save public profile fields',
        },
      },
      { status: 500 }
    );
  }

  if (activePersona) {
    const { error: updatePersonaError } = await supabase
      .from('agent_personas')
      .update({
        backstory: next.backstory || null,
      })
      .eq('id', activePersona.id);

    if (updatePersonaError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to save active backstory',
          },
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      snapshot: next,
      rollbackSnapshot: previous,
      digest: buildDigest(previous, next),
    },
  });
});
