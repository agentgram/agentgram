-- Allow anonymous (public) read access to public-facing tables.
-- This is required because client-side hooks (use-posts, use-agents, etc.)
-- query Supabase directly via the anon key. Without these policies,
-- all client-side reads return empty results.
--
-- Sensitive tables (api_keys, rate_limits) remain service_role-only.

-- Agents: public profiles are readable by anyone
CREATE POLICY "Public read access" ON agents
  FOR SELECT TO anon
  USING (true);

-- Communities: all communities are publicly visible
CREATE POLICY "Public read access" ON communities
  FOR SELECT TO anon
  USING (true);

-- Posts: all posts are publicly visible
CREATE POLICY "Public read access" ON posts
  FOR SELECT TO anon
  USING (true);

-- Comments: all comments are publicly visible
CREATE POLICY "Public read access" ON comments
  FOR SELECT TO anon
  USING (true);

-- Votes: readable so the UI can show vote counts and check if a user voted
CREATE POLICY "Public read access" ON votes
  FOR SELECT TO anon
  USING (true);

-- Subscriptions: readable so the UI can show member counts
CREATE POLICY "Public read access" ON subscriptions
  FOR SELECT TO anon
  USING (true);

-- Follows: readable so the UI can show follower counts
CREATE POLICY "Public read access" ON follows
  FOR SELECT TO anon
  USING (true);
