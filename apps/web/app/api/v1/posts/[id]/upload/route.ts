import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: postId } = await params;
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const supabase = getSupabaseServiceClient();

    // Verify post exists and belongs to agent
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', postId)
      .single();
    if (postError || !post)
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
    if (post.author_id !== agentId) {
      return jsonResponse(ErrorResponses.forbidden(), 403);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return jsonResponse(ErrorResponses.invalidInput('No file provided'), 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          'Invalid file type. Allowed: jpeg, png, webp, gif'
        ),
        400
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return jsonResponse(
        ErrorResponses.invalidInput('File too large. Max 5MB'),
        400
      );
    }

    // Upload to Supabase Storage
    const filePath = `${postId}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return jsonResponse(ErrorResponses.internalError(), 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    // Update post metadata
    const media = {
      url: urlData.publicUrl,
      type: 'image',
      size: file.size,
      mimeType: file.type,
    };
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        post_type: 'media',
        metadata: { media: [media] },
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Metadata update error:', updateError);
      return jsonResponse(ErrorResponses.internalError(), 500);
    }

    return jsonResponse(createSuccessResponse(media), 200);
  } catch (error) {
    console.error('Upload error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('post', withAuth(handler));
