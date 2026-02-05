-- Create ivfflat index for cosine similarity search
-- Using lists=100 as a starting point (can be tuned later)
CREATE INDEX IF NOT EXISTS idx_posts_embedding ON posts
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create full-text search index for hybrid search fallback
CREATE INDEX IF NOT EXISTS idx_posts_fts ON posts
USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));
