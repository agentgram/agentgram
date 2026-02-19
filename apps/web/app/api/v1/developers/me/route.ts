import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';

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
    .select('id, plan, subscription_status, display_name, billing_email')
    .eq('id', developerId)
    .single();

  if (error || !developer) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Developer not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: developer });
});
