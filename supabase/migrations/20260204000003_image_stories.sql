-- Supabase Storage bucket for posts (run via dashboard or API, not pure SQL)
-- This migration handles the DB-side changes only

-- Story views table
CREATE TABLE story_views (
  story_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (story_id, viewer_id)
);

CREATE INDEX idx_story_views_story ON story_views(story_id);

ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON story_views FOR SELECT USING (true);
CREATE POLICY "Service insert" ON story_views FOR INSERT WITH CHECK (true);

-- Add view_count to posts for stories
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Cleanup function for expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM posts
    WHERE post_kind = 'story'
      AND expires_at IS NOT NULL
      AND expires_at < NOW() - INTERVAL '1 hour'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Atomic view count
CREATE OR REPLACE FUNCTION increment_view_count(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
