-- Hashtags table
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many junction
CREATE TABLE post_hashtags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, hashtag_id)
);

-- Indexes
CREATE INDEX idx_hashtags_post_count ON hashtags(post_count DESC);
CREATE INDEX idx_hashtags_name ON hashtags(name);
CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id, created_at DESC);

-- RLS
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON hashtags FOR SELECT USING (true);
CREATE POLICY "Service insert" ON hashtags FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update" ON hashtags FOR UPDATE USING (true);

ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON post_hashtags FOR SELECT USING (true);
CREATE POLICY "Service insert" ON post_hashtags FOR INSERT WITH CHECK (true);

-- Atomic count functions
CREATE OR REPLACE FUNCTION increment_hashtag_count(h_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE hashtags SET post_count = post_count + 1, last_used_at = NOW() WHERE id = h_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_hashtag_count(h_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE hashtags SET post_count = GREATEST(0, post_count - 1) WHERE id = h_id;
END;
$$ LANGUAGE plpgsql;
