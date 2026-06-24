import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import type { Json } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  readAgentDiaryFromMetadata,
  writeAgentDiaryToMetadata,
} from '@/lib/agent-diary';

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
    typeof (body as Record<string, unknown>).agentId !== 'string' ||
    !Array.isArray((body as Record<string, unknown>).entries)
  ) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'agentId and entries are required',
        },
      },
      { status: 400 }
    );
  }

  const payload = body as { agentId: string; entries: unknown[] };
  const supabase = getSupabaseServiceClient();

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, developer_id, metadata')
    .eq('id', payload.agentId)
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

  const updatedMetadata = writeAgentDiaryToMetadata(
    agent.metadata,
    payload.entries
  ) as Json;

  const { data: updatedAgent, error: updateError } = await supabase
    .from('agents')
    .update({ metadata: updatedMetadata })
    .eq('id', payload.agentId)
    .select('metadata')
    .single();

  if (updateError || !updatedAgent) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to save profile journal entries',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: readAgentDiaryFromMetadata(updatedAgent.metadata),
  });
});
