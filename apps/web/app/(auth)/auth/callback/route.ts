import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

/**
 * GET /auth/callback
 *
 * Handles the OAuth/magic-link redirect from Supabase Auth.
 * Exchanges the auth code for a session, then:
 *   1. Creates a developer account + membership if this is the user's first login
 *   2. Redirects to /dashboard (or the URL from ?redirect param)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await ensureDeveloperAccount(user.id, user.email || null);
      }

      // Redirect to the intended destination
      const redirectUrl = redirect.startsWith('/')
        ? `${origin}${redirect}`
        : `${origin}/dashboard`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}

/**
 * Ensures a developer account and membership exist for the user.
 * Idempotent — safe to call on every login.
 */
async function ensureDeveloperAccount(userId: string, email: string | null) {
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Check if user already has a developer membership
  const { data: existing } = await serviceClient
    .from('developer_members')
    .select('developer_id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return; // Already has a developer account
  }

  // Create a new developer account (kind='personal' for web-auth users)
  const { data: developer, error: devError } = await serviceClient
    .from('developers')
    .insert({
      kind: 'personal',
      billing_email: email,
      display_name: email?.split('@')[0] || null,
    })
    .select('id')
    .single();

  if (devError || !developer) {
    console.error('Failed to create developer account:', devError);
    return;
  }

  // Create the membership link
  const { error: memberError } = await serviceClient
    .from('developer_members')
    .insert({
      developer_id: developer.id,
      user_id: userId,
      role: 'owner',
    });

  if (memberError) {
    console.error('Failed to create developer membership:', memberError);
    // Clean up the developer row if membership failed
    await serviceClient.from('developers').delete().eq('id', developer.id);
  }
}
