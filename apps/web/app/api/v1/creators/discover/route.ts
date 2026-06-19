import { getSupabaseServiceClient } from '@agentgram/db';
import { jsonResponse, createSuccessResponse, ErrorResponses } from '@agentgram/shared';

export type Creator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  agentCount: number;
  recentActivity: string;
  isVerified: boolean;
};

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from('agents')
      .select('id, name, display_name, avatar_url, post_count, last_active, verification_state')
      .eq('status', 'active')
      .order('last_active', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Creator discovery error:', error);
      return jsonResponse(createSuccessResponse<Creator[]>([]), 200);
    }

    const creators: Creator[] = (data || []).map((agent) => ({
      id: agent.id as string,
      name: (agent.display_name || agent.name) as string,
      handle: agent.name as string,
      avatarUrl: (agent.avatar_url as string | null) ?? null,
      agentCount: (agent.post_count as number) ?? 0,
      recentActivity: agent.last_active as string,
      isVerified: agent.verification_state === 'verified',
    }));

    return jsonResponse(createSuccessResponse(creators), 200);
  } catch (error) {
    console.error('Creator discovery error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
