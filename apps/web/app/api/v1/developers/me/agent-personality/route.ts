import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import type { Json } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  readPersonalityFromMetadata,
  writePersonalityToMetadata,
  VOICE_STYLES,
  type VoiceStyle,
} from '@/lib/personality-traits';

type AgentPersonalityBody = {
  agentId?: unknown;
  traits?: {
    warmth?: unknown;
    humor?: unknown;
    formality?: unknown;
    creativity?: unknown;
  };
  voiceStyle?: unknown;
};

export const GET = withDeveloperAuth(async function GET(req: NextRequest) {
  const developerId = req.headers.get('x-developer-id');
  if (!developerId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'agentId is required' } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();
  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, metadata')
    .eq('id', agentId)
    .eq('developer_id', developerId)
    .single();

  if (error || !agent) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: readPersonalityFromMetadata(agent.metadata),
  });
});

export const PUT = withDeveloperAuth(async function PUT(req: NextRequest) {
  const developerId = req.headers.get('x-developer-id');
  if (!developerId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  let body: AgentPersonalityBody;
  try {
    body = (await req.json()) as AgentPersonalityBody;
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const agentId = typeof body.agentId === 'string' ? body.agentId : null;
  if (!agentId) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'agentId is required' } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();
  const { data: agent, error: fetchError } = await supabase
    .from('agents')
    .select('id, metadata')
    .eq('id', agentId)
    .eq('developer_id', developerId)
    .single();

  if (fetchError || !agent) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  if (body.voiceStyle !== undefined && !(VOICE_STYLES as readonly string[]).includes(body.voiceStyle as string)) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: `voiceStyle must be one of: ${VOICE_STYLES.join(', ')}` } },
      { status: 400 }
    );
  }

  const traits = typeof body.traits === 'object' && body.traits !== null ? body.traits : {};
  const updatedMetadata = writePersonalityToMetadata(agent.metadata, {
    traits: {
      warmth: typeof traits.warmth === 'number' ? traits.warmth : undefined,
      humor: typeof traits.humor === 'number' ? traits.humor : undefined,
      formality: typeof traits.formality === 'number' ? traits.formality : undefined,
      creativity: typeof traits.creativity === 'number' ? traits.creativity : undefined,
    },
    voiceStyle: typeof body.voiceStyle === 'string' ? (body.voiceStyle as VoiceStyle) : undefined,
  }) as Json;

  const { data: updatedAgent, error: updateError } = await supabase
    .from('agents')
    .update({ metadata: updatedMetadata })
    .eq('id', agentId)
    .select('metadata')
    .single();

  if (updateError || !updatedAgent) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save personality settings' } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: readPersonalityFromMetadata(updatedAgent.metadata),
  });
});
