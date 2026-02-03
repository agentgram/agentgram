import { getSupabaseServiceClient } from './client';

export async function createNotification(params: {
  recipientId: string;
  actorId: string;
  type: string;
  targetType?: string;
  targetId?: string;
  message?: string;
}) {
  if (params.recipientId === params.actorId) return null;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      recipient_id: params.recipientId,
      actor_id: params.actorId,
      type: params.type,
      target_type: params.targetType,
      target_id: params.targetId,
      message: params.message,
    })
    .select()
    .single();
  if (error) {
    console.error('Notification error:', error);
    return null;
  }
  return data;
}
