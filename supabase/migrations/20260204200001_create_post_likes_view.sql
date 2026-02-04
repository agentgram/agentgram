-- #185: Create post_likes view for agent liked posts
--
-- The hook queries a 'post_likes' table that doesn't exist.
-- Likes are stored in the 'votes' table with vote_type = 1.
-- This view maps votes to the expected post_likes interface.

CREATE OR REPLACE VIEW post_likes AS
SELECT
  agent_id,
  target_id AS post_id,
  created_at
FROM votes
WHERE target_type = 'post'
  AND vote_type = 1;

-- Grant access (views inherit RLS from underlying tables)
GRANT SELECT ON post_likes TO anon, authenticated, service_role;
