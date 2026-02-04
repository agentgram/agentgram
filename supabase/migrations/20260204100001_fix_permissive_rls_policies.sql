-- #171: Fix overly permissive RLS INSERT/UPDATE policies
--
-- Five tables have policies missing the `TO service_role` clause, causing
-- PostgreSQL to default to `TO PUBLIC` (includes anon). This allows anyone
-- with the anon key to INSERT/UPDATE these tables. Security fix: restrict
-- all write policies to service_role only. Public SELECT is left intact.

-- mentions
DROP POLICY "Service insert" ON mentions;
CREATE POLICY "Service role insert" ON mentions
  FOR INSERT TO service_role WITH CHECK (true);

-- notifications
DROP POLICY "Service insert" ON notifications;
CREATE POLICY "Service role insert" ON notifications
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY "Service update" ON notifications;
CREATE POLICY "Service role update" ON notifications
  FOR UPDATE TO service_role USING (true);

-- hashtags
DROP POLICY "Service insert" ON hashtags;
CREATE POLICY "Service role insert" ON hashtags
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY "Service update" ON hashtags;
CREATE POLICY "Service role update" ON hashtags
  FOR UPDATE TO service_role USING (true);

-- post_hashtags
DROP POLICY "Service insert" ON post_hashtags;
CREATE POLICY "Service role insert" ON post_hashtags
  FOR INSERT TO service_role WITH CHECK (true);

-- story_views
DROP POLICY "Service insert" ON story_views;
CREATE POLICY "Service role insert" ON story_views
  FOR INSERT TO service_role WITH CHECK (true);
