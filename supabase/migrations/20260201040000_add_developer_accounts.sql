-- ============================================================
-- Migration: Add Developer Accounts
-- 
-- Introduces a "developers" table as the billing/account 
-- boundary. Agents now belong to a developer account.
-- Stripe billing columns move from agents to developers.
-- ============================================================

-- Developer accounts (billing boundary)
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 'anonymous' = auto-created from agent-only signup
  -- 'personal'  = human-owned account (Supabase Auth)
  -- 'team'      = multi-human account (future)
  kind VARCHAR(20) NOT NULL DEFAULT 'anonymous'
    CHECK (kind IN ('anonymous', 'personal', 'team')),

  display_name VARCHAR(100),
  billing_email VARCHAR(255),

  -- Billing state (moved from agents)
  plan VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),

  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status VARCHAR(30) NOT NULL DEFAULT 'none',
  current_period_end TIMESTAMPTZ,
  last_payment_at TIMESTAMPTZ,

  metadata JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'deleted')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maps Supabase Auth users to developer accounts
CREATE TABLE developer_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,  -- Supabase auth.users.id
  role VARCHAR(20) NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner', 'admin', 'member')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (developer_id, user_id)
);

-- Enforce one owner per developer account
CREATE UNIQUE INDEX developer_members_one_owner_per_dev
  ON developer_members (developer_id)
  WHERE role = 'owner';

-- Claim tokens: allow logged-in developers to claim existing agents
CREATE TABLE agent_claim_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  token_prefix VARCHAR(20),
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ,
  redeemed_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Modify agents table
-- ============================================================

-- Add developer_id FK (nullable first for migration, then we'll make it NOT NULL)
ALTER TABLE agents ADD COLUMN developer_id UUID REFERENCES developers(id) ON DELETE RESTRICT;

-- Remove Stripe/billing columns from agents (now on developers)
ALTER TABLE agents
  DROP COLUMN IF EXISTS plan,
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS current_period_end,
  DROP COLUMN IF EXISTS last_payment_at;

-- Drop the old Stripe indexes on agents (created in migration 010000)
DROP INDEX IF EXISTS idx_agents_stripe_customer_id;
DROP INDEX IF EXISTS idx_agents_plan;

-- Drop the old Stripe RLS policy on agents
DROP POLICY IF EXISTS "agents_read_own_stripe" ON agents;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_developers_stripe_customer_id ON developers(stripe_customer_id);
CREATE INDEX idx_developers_plan ON developers(plan);
CREATE INDEX idx_developers_status ON developers(status);

CREATE INDEX idx_developer_members_user_id ON developer_members(user_id);
CREATE INDEX idx_developer_members_developer_id ON developer_members(developer_id);

CREATE INDEX idx_agents_developer_id ON agents(developer_id);

CREATE INDEX idx_agent_claim_tokens_agent_id ON agent_claim_tokens(agent_id);
CREATE INDEX idx_agent_claim_tokens_expires ON agent_claim_tokens(expires_at);

-- ============================================================
-- Triggers
-- ============================================================

CREATE TRIGGER developers_updated_at
  BEFORE UPDATE ON developers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_claim_tokens ENABLE ROW LEVEL SECURITY;

-- Service role bypass
CREATE POLICY "Service role bypass" ON developers FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON developer_members FOR ALL TO service_role USING (true);
CREATE POLICY "Service role bypass" ON agent_claim_tokens FOR ALL TO service_role USING (true);

-- Anon can read developer display info (public profiles)
CREATE POLICY "anon_read_developers" ON developers
  FOR SELECT TO anon
  USING (status = 'active');

-- Authenticated users can read their own developer account
CREATE POLICY "auth_read_own_developer" ON developers
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT developer_id FROM developer_members WHERE user_id = auth.uid())
  );

-- Authenticated users can update their own developer account
CREATE POLICY "auth_update_own_developer" ON developers
  FOR UPDATE TO authenticated
  USING (
    id IN (SELECT developer_id FROM developer_members WHERE user_id = auth.uid())
  );

-- Authenticated users can read their own memberships
CREATE POLICY "auth_read_own_memberships" ON developer_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE developers IS 'Billing/account boundary. Owns agents. Stripe state lives here.';
COMMENT ON TABLE developer_members IS 'Maps Supabase Auth users to developer accounts. Enables team accounts.';
COMMENT ON TABLE agent_claim_tokens IS 'One-time tokens for claiming anonymous agents into a developer account.';
COMMENT ON COLUMN developers.kind IS 'anonymous = API-only signup, personal = human login, team = multi-human';
COMMENT ON COLUMN developers.plan IS 'free | starter | pro | enterprise';
COMMENT ON COLUMN developers.subscription_status IS 'none | active | past_due | canceled | paused';
COMMENT ON COLUMN agents.developer_id IS 'FK to developers. Every agent belongs to exactly one developer account.';
