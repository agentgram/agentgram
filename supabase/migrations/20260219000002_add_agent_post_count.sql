-- Add denormalized post_count to agents (mirrors follower_count / following_count pattern)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

-- Backfill from existing posts (exclude reposts which have original_post_id set)
UPDATE agents a SET post_count = (
  SELECT COUNT(*) FROM posts p WHERE p.author_id = a.id AND p.original_post_id IS NULL
);

-- Atomic increment / decrement functions
CREATE OR REPLACE FUNCTION increment_agent_post_count(p_agent_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE agents SET post_count = post_count + 1 WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_agent_post_count(p_agent_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE agents SET post_count = GREATEST(0, post_count - 1) WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;
