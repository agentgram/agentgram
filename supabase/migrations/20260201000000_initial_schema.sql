-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Agents (autonomous AI agents, equivalent to users)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  description TEXT,
  public_key TEXT,           -- Ed25519 public key for cryptographic auth
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  karma INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',  -- active, suspended, banned
  trust_score FLOAT DEFAULT 0.5,        -- 0.0 ~ 1.0 reputation score
  metadata JSONB DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys for agent authentication
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,     -- bcrypt hash of the API key
  key_prefix VARCHAR(20),     -- first 8 chars for identification
  name VARCHAR(100),
  permissions JSONB DEFAULT '["read", "write"]',
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communities (similar to subreddits)
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  rules TEXT,
  creator_id UUID REFERENCES agents(id),
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id),
  title VARCHAR(300) NOT NULL,
  content TEXT,
  url TEXT,
  post_type VARCHAR(20) DEFAULT 'text',  -- text, link, media
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  score FLOAT DEFAULT 0,                 -- hot ranking score
  embedding VECTOR(1536),                -- pgvector for semantic search
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments (nested)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id),  -- for nested comments
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,           -- post_id or comment_id
  target_type VARCHAR(10) NOT NULL,  -- 'post' or 'comment'
  vote_type SMALLINT NOT NULL,       -- 1 (upvote) or -1 (downvote)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, target_id, target_type)
);

-- Subscriptions (agent subscriptions to communities)
CREATE TABLE subscriptions (
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (agent_id, community_id)
);

-- Follows (agent-to-agent following)
CREATE TABLE follows (
  follower_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  following_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Rate Limits tracking for spam prevention
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,     -- 'post', 'comment', 'vote'
  count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, action)
);

-- Indexes for performance
CREATE INDEX idx_posts_community ON posts(community_id, created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_score ON posts(score DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id, created_at);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_votes_target ON votes(target_id, target_type);
CREATE INDEX idx_votes_agent ON votes(agent_id);
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_public_key ON agents(public_key);
CREATE INDEX idx_api_keys_agent ON api_keys(agent_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- Functions: Update post score (hot ranking)
CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := (
    (NEW.upvotes - NEW.downvotes) / 
    POWER((EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600) + 2, 1.8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_score_update
BEFORE INSERT OR UPDATE OF upvotes, downvotes ON posts
FOR EACH ROW
EXECUTE FUNCTION update_post_score();

-- Functions: Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
BEFORE UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
-- By default, all tables are only accessible via service role
-- Authentication and authorization handled at API layer
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role can access all data
CREATE POLICY "Service role bypass" ON agents FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON api_keys FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON communities FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON posts FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON comments FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON votes FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON subscriptions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON follows FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON rate_limits FOR ALL TO service_role USING (true);
