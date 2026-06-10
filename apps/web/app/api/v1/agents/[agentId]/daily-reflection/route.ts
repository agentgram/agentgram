import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import type { Json } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';

export interface DailyReflectionSettings {
  enabled: boolean;
}

function readDailyReflectionFromMetadata(metadata: unknown): DailyReflectionSettings {
  if (
    typeof metadata === 'object' &&
    metadata !== null &&
    !Array.isArray(metadata)
  ) {
    const raw = (metadata as Record<string, unknown>).dailyReflection;
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      return {
        enabled: (raw as Record<string, unknown>).enabled === true,
      };
    }
  }
  return { enabled: false };
}

function writeDailyReflectionToMetadata(
  metadata: unknown,
  settings: DailyReflectionSettings
): Record<string, unknown> {
  const base =
    typeof metadata === 'object' && metadata !== null && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {};
  return { ...base, dailyReflection: settings };
}

// GET /api/v1/agents/:agentId/daily-reflection
export const GET = withDeveloperAuth(async function GET(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> }
) {
  const developerId = req.headers.get('x-developer-id');
  if (!developerId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  const { agentId } = await (props as unknown as { params: Promise<{ agentId: string }> }).params;
  const supabase = getSupabaseServiceClient();

  const { data: agent, error } = await supabase
    .from('agents')
    .select('metadata')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: readDailyReflectionFromMetadata(agent.metadata),
  });
});

// PUT /api/v1/agents/:agentId/daily-reflection
export const PUT = withDeveloperAuth(async function PUT(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> }
) {
  const developerId = req.headers.get('x-developer-id');
  if (!developerId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  const { agentId } = await (props as unknown as { params: Promise<{ agentId: string }> }).params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body) ||
    typeof (body as Record<string, unknown>).enabled !== 'boolean'
  ) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INPUT', message: 'enabled (boolean) is required' } },
      { status: 400 }
    );
  }

  const settings: DailyReflectionSettings = {
    enabled: (body as Record<string, unknown>).enabled as boolean,
  };

  const supabase = getSupabaseServiceClient();

  const { data: agent, error: fetchError } = await supabase
    .from('agents')
    .select('metadata')
    .eq('id', agentId)
    .single();

  if (fetchError || !agent) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  const updatedMetadata = writeDailyReflectionToMetadata(
    agent.metadata,
    settings
  ) as Json;

  const { data: updatedAgent, error: updateError } = await supabase
    .from('agents')
    .update({ metadata: updatedMetadata })
    .eq('id', agentId)
    .select('metadata')
    .single();

  if (updateError || !updatedAgent) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save daily reflection settings' } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: readDailyReflectionFromMetadata(updatedAgent.metadata),
  });
});
