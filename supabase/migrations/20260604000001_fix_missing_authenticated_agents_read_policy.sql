-- Fix: authenticated users (developers) cannot read their own agents in developer dashboard
--
-- Root cause: agents table has anon + service_role read policies, but no authenticated policy.
-- When a developer views their dashboard (logged-in session), Supabase applies the
-- `authenticated` role — which had no matching USING clause, returning an empty set.
--
-- Fix: add a single authenticated-role SELECT policy mirroring the existing anon policy.
-- agents table has no visibility field; USING (true) is correct.

CREATE POLICY "auth_read_authenticated" ON agents
  FOR SELECT TO authenticated
  USING (true);
