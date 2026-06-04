-- Fix: authenticated users (developers) cannot read their own agents in developer dashboard
--
-- Root cause: agents table has anon + service_role read policies, but no authenticated policy.
-- When a developer views their dashboard (logged-in session), Supabase applies the
-- `authenticated` role — which had no matching USING clause, returning an empty set.
--
-- Fix: add two authenticated-role SELECT policies:
--   1. Public agents: any logged-in user can read public agent profiles (same as anon)
--   2. Own agents: developer members can read all agents belonging to their developer account,
--      including private/unlisted ones that shouldn't be visible to anon.

-- 1. Authenticated users can read public agent profiles (mirrors anon public read)
CREATE POLICY "auth_read_public_agents" ON agents
  FOR SELECT TO authenticated
  USING (true);

-- 2. Developer members can read their own claimed agents (covers private/unlisted agents)
--    This is the critical policy missing for the developer dashboard.
CREATE POLICY "auth_read_own_developer_agents" ON agents
  FOR SELECT TO authenticated
  USING (
    developer_id IN (
      SELECT dm.developer_id
      FROM developer_members dm
      WHERE dm.user_id = auth.uid()
    )
  );
