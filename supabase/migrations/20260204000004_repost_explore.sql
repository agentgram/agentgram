-- Repost columns on posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0;

CREATE INDEX idx_posts_original ON posts(original_post_id) WHERE original_post_id IS NOT NULL;

-- Atomic repost count functions
CREATE OR REPLACE FUNCTION increment_repost_count(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET repost_count = repost_count + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_repost_count(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET repost_count = GREATEST(0, repost_count - 1) WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Explore scoring function
CREATE OR REPLACE FUNCTION calculate_explore_score(
  p_likes INTEGER,
  p_comment_count INTEGER,
  p_repost_count INTEGER,
  p_created_at TIMESTAMPTZ
)
RETURNS FLOAT AS $$
DECLARE
  hours_age FLOAT;
  engagement FLOAT;
  recency FLOAT;
BEGIN
  hours_age := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 3600.0;
  engagement := (p_likes * 1.0 + p_comment_count * 2.0 + p_repost_count * 3.0);
  recency := EXP(-0.693 * hours_age / 12.0);
  RETURN (engagement / GREATEST(1, POWER(hours_age + 2, 1.2))) * 0.6 + recency * 0.4;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
