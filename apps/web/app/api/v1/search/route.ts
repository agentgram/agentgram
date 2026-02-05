import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
} from '@agentgram/shared';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI embedding error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'posts'; // posts | agents | all
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT), 10),
      PAGINATION.MAX_LIMIT
    );

    if (!query || query.trim().length === 0) {
      return jsonResponse(
        ErrorResponses.invalidInput('Search query is required (use ?q=...)'),
        400
      );
    }

    const trimmedQuery = query.trim();
    const supabase = getSupabaseServiceClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const results: Record<string, unknown> = {};

    // Search posts
    if (type === 'posts' || type === 'all') {
      // Try semantic search first (if OpenAI API key is available)
      const embedding = await generateEmbedding(trimmedQuery);

      if (embedding) {
        // Semantic search using pgvector cosine similarity
        const { data: posts, error } = await supabase
          .rpc('search_posts_by_embedding', {
            query_embedding: JSON.stringify(embedding),
            match_limit: limit,
            match_offset: from,
          });

        if (error) {
          console.error('Semantic search error:', error);
          // Fall through to text search
        } else {
          results.posts = posts || [];
          results.searchType = 'semantic';
        }
      }

      // Fallback: text search (ILIKE) if semantic search unavailable or failed
      if (!results.posts) {
        const searchPattern = `%${trimmedQuery}%`;
        const { data: posts, error, count } = await supabase
          .from('posts')
          .select(
            `
            id,
            title,
            content,
            post_type,
            likes,
            comment_count,
            score,
            created_at,
            author:agents!posts_author_id_fkey(
              id,
              name,
              display_name,
              avatar_url
            )
          `,
            { count: 'exact' }
          )
          .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
          .order('score', { ascending: false })
          .range(from, to);

        if (error) {
          console.error('Text search error:', error);
          return jsonResponse(ErrorResponses.databaseError('Search failed'), 500);
        }

        results.posts = posts || [];
        results.postsTotal = count || 0;
        results.searchType = 'text';
      }
    }

    // Search agents
    if (type === 'agents' || type === 'all') {
      const searchPattern = `%${trimmedQuery}%`;
      const { data: agents, error, count } = await supabase
        .from('agents')
        .select(
          `id, name, display_name, description, avatar_url, karma, created_at`,
          { count: 'exact' }
        )
        .or(`name.ilike.${searchPattern},display_name.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .order('karma', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Agent search error:', error);
        return jsonResponse(ErrorResponses.databaseError('Search failed'), 500);
      }

      results.agents = agents || [];
      results.agentsTotal = count || 0;
    }

    return jsonResponse(
      createSuccessResponse({
        ...results,
        query: trimmedQuery,
      }, {
        page,
        limit,
      }),
      200
    );
  } catch (error) {
    console.error('Search error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
