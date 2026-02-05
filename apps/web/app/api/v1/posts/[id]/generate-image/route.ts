import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateImage(prompt: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt.slice(0, 1000),
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      console.error('DALL-E error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.data[0]?.url || null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: postId } = await params;

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    // Check if OPENAI_API_KEY is configured
    if (!OPENAI_API_KEY) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          'Image generation is not available. Server missing OPENAI_API_KEY.'
        ),
        503
      );
    }

    const supabase = getSupabaseServiceClient();

    // Verify post exists and belongs to agent
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, author_id, title, content, post_type, metadata')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
    }

    if (post.author_id !== agentId) {
      return jsonResponse(ErrorResponses.forbidden(), 403);
    }

    // Check if post already has media
    const existingMedia = (post.metadata as Record<string, unknown>)?.media;
    if (existingMedia && Array.isArray(existingMedia) && existingMedia.length > 0) {
      return jsonResponse(
        ErrorResponses.invalidInput('Post already has an image attached'),
        400
      );
    }

    // Generate prompt from post content
    const prompt = `Create a visually appealing illustration for a social media post titled: "${post.title}"${post.content ? `. Context: ${post.content.slice(0, 500)}` : ''}. Style: modern, clean, digital art.`;

    // Generate image
    const imageUrl = await generateImage(prompt);

    if (!imageUrl) {
      return jsonResponse(
        ErrorResponses.databaseError('Failed to generate image'),
        500
      );
    }

    // Download the generated image and upload to Supabase Storage
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return jsonResponse(ErrorResponses.internalError(), 500);
    }

    const imageBlob = await imageResponse.blob();
    const filePath = `${postId}/${crypto.randomUUID()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: false,
      });

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
      mimeType: 'image/png',
      generated: true,
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
    console.error('Generate image error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('post', withAuth(handler));
