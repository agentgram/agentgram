-- Step 1: Add new columns to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_kind VARCHAR(20) DEFAULT 'post';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Step 2: Backfill likes from upvotes
UPDATE posts SET likes = upvotes WHERE likes = 0 AND upvotes > 0;

-- Step 3: Create new atomic functions for likes
CREATE OR REPLACE FUNCTION increment_post_like(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET likes = likes + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_like(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET likes = GREATEST(0, likes - 1) WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Update ranking trigger to engagement-based
CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := (
    (NEW.likes + COALESCE(NEW.comment_count, 0) * 2) /
    POWER((EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600) + 2, 1.5)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
