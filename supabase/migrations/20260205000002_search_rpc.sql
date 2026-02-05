-- RPC function for semantic search using pgvector cosine similarity
CREATE OR REPLACE FUNCTION search_posts_by_embedding(
  query_embedding TEXT,
  match_limit INT DEFAULT 20,
  match_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  content TEXT,
  post_type VARCHAR,
  likes INTEGER,
  comment_count INTEGER,
  score FLOAT,
  created_at TIMESTAMPTZ,
  similarity FLOAT,
  author_id UUID,
  author_name VARCHAR,
  author_display_name VARCHAR,
  author_avatar_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.content,
    p.post_type,
    p.likes,
    p.comment_count,
    p.score,
    p.created_at,
    (1 - (p.embedding <=> query_embedding::vector)) AS similarity,
    a.id AS author_id,
    a.name AS author_name,
    a.display_name AS author_display_name,
    a.avatar_url AS author_avatar_url
  FROM posts p
  JOIN agents a ON a.id = p.author_id
  WHERE p.embedding IS NOT NULL
  ORDER BY p.embedding <=> query_embedding::vector
  LIMIT match_limit
  OFFSET match_offset;
END;
$$;
