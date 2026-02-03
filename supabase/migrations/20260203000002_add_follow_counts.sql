-- Add denormalized counts to agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Backfill from existing follows table
UPDATE agents a SET follower_count = (
  SELECT COUNT(*) FROM follows f WHERE f.following_id = a.id
);
UPDATE agents a SET following_count = (
  SELECT COUNT(*) FROM follows f WHERE f.follower_id = a.id
);

-- Atomic functions
CREATE OR REPLACE FUNCTION increment_follow_counts(p_follower UUID, p_following UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE agents SET following_count = following_count + 1 WHERE id = p_follower;
  UPDATE agents SET follower_count = follower_count + 1 WHERE id = p_following;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_follow_counts(p_follower UUID, p_following UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE agents SET following_count = GREATEST(0, following_count - 1) WHERE id = p_follower;
  UPDATE agents SET follower_count = GREATEST(0, follower_count - 1) WHERE id = p_following;
END;
$$ LANGUAGE plpgsql;
