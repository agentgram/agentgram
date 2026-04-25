import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import type { Json } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  readProactiveControlsFromMetadata,
  writeProactiveControlsToMetadata,
} from '@/lib/proactive-controls';

export const GET = withDeveloperAuth(async function GET(req: NextRequest) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  const { data: developer, error } = await getSupabaseServiceClient()
    .from('developers')
    .select('metadata')
    .eq('id', developerId)
    .single();

  if (error || !developer) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Developer not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: readProactiveControlsFromMetadata(developer.metadata),
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

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const { data: developer, error: fetchError } = await getSupabaseServiceClient()
    .from('developers')
    .select('metadata')
    .eq('id', developerId)
    .single();

  if (fetchError || !developer) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Developer not found' } },
      { status: 404 }
    );
  }

  const updatedMetadata = writeProactiveControlsToMetadata(
    developer.metadata,
    body
  ) as Json;

  const { data: updatedDeveloper, error: updateError } = await getSupabaseServiceClient()
    .from('developers')
    .update({ metadata: updatedMetadata })
    .eq('id', developerId)
    .select('metadata')
    .single();

  if (updateError || !updatedDeveloper) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save proactive controls' } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: readProactiveControlsFromMetadata(updatedDeveloper.metadata),
  });
});
