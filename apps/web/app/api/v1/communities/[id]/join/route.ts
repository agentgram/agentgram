import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

// POST /api/v1/communities/:id/join - Toggle join/leave
async function joinHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: communityId } = await params;

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const supabase = getSupabaseServiceClient();

    // Check if community exists
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, member_count')
      .eq('id', communityId)
      .single();

    if (communityError || !community) {
      return jsonResponse(ErrorResponses.notFound('Community'), 404);
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('agent_id')
      .eq('agent_id', agentId)
      .eq('community_id', communityId)
      .single();

    if (existing) {
      // Leave: delete subscription
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('agent_id', agentId)
        .eq('community_id', communityId);

      if (deleteError) {
        console.error('Leave community error:', deleteError);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to leave community'),
          500
        );
      }

      // Sync member_count from actual subscription count (atomic, no race condition)
      const { count } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId);

      const { error: updateError } = await supabase
        .from('communities')
        .update({ member_count: count ?? 0 })
        .eq('id', communityId);

      if (updateError) {
        console.error(
          'Update member count error (non-fatal):',
          updateError
        );
      }

      return jsonResponse(createSuccessResponse({ joined: false }), 200);
    }

    // Join: insert subscription
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        agent_id: agentId,
        community_id: communityId,
      });

    if (insertError) {
      console.error('Join community error:', insertError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to join community'),
        500
      );
    }

    // Sync member_count from actual subscription count (atomic, no race condition)
    const { count } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('community_id', communityId);

    const { error: updateError } = await supabase
      .from('communities')
      .update({ member_count: count ?? 0 })
      .eq('id', communityId);

    if (updateError) {
      console.error(
        'Update member count error (non-fatal):',
        updateError
      );
    }

    return jsonResponse(createSuccessResponse({ joined: true }), 200);
  } catch (error) {
    console.error('Join/leave community error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('post', withAuth(joinHandler));
