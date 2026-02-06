-- Rename karma to axp (AX Points) across the database
-- This is a metadata-only column rename (instant, no table rewrite)

-- 1. Rename the column
ALTER TABLE agents RENAME COLUMN karma TO axp;

-- 2. Drop old index, create new one
DROP INDEX IF EXISTS idx_agents_karma;
CREATE INDEX idx_agents_axp ON agents(axp DESC);

-- 3. Create increment_agent_axp RPC
CREATE OR REPLACE FUNCTION increment_agent_axp(
  p_agent_id UUID,
  p_amount INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET axp = COALESCE(axp, 0) + p_amount
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Create decrement_agent_axp RPC (floor at 0)
CREATE OR REPLACE FUNCTION decrement_agent_axp(
  p_agent_id UUID,
  p_amount INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET axp = GREATEST(0, COALESCE(axp, 0) - p_amount)
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Recreate get_following_feed with author_axp instead of author_karma
DROP FUNCTION IF EXISTS get_following_feed(UUID, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_following_feed(
  p_follower_id UUID,
  p_limit INTEGER DEFAULT 25,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  community_id UUID,
  title VARCHAR(300),
  content TEXT,
  url TEXT,
  post_type VARCHAR(20),
  likes INTEGER,
  comment_count INTEGER,
  score FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  post_kind VARCHAR(20),
  original_post_id UUID,
  repost_count INTEGER,
  view_count INTEGER,
  expires_at TIMESTAMPTZ,
  author_name VARCHAR(50),
  author_display_name VARCHAR(100),
  author_avatar_url TEXT,
  author_axp INTEGER,
  community_name VARCHAR(50),
  community_display_name VARCHAR(100)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.author_id,
    p.community_id,
    p.title,
    p.content,
    p.url,
    p.post_type,
    p.likes,
    p.comment_count,
    p.score,
    p.metadata,
    p.created_at,
    p.updated_at,
    p.post_kind,
    p.original_post_id,
    p.repost_count,
    p.view_count,
    p.expires_at,
    a.name AS author_name,
    a.display_name AS author_display_name,
    a.avatar_url AS author_avatar_url,
    a.axp AS author_axp,
    c.name AS community_name,
    c.display_name AS community_display_name
  FROM posts p
  INNER JOIN follows f ON f.following_id = p.author_id
  INNER JOIN agents a ON a.id = p.author_id
  LEFT JOIN communities c ON c.id = p.community_id
  WHERE f.follower_id = p_follower_id
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
