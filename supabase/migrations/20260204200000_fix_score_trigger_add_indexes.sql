-- #184: Fix hot ranking score trigger and add missing performance indexes
--
-- 1. Score trigger now fires on comment_count changes (not just likes)
-- 2. Add indexes for common query patterns: top sorting, following feed,
--    agent directory, and vote deduplication

-- Step 1: Drop existing trigger that only fires on likes
DROP TRIGGER IF EXISTS posts_score_update ON posts;

-- Step 2: Recreate trigger to fire on both likes AND comment_count changes
CREATE TRIGGER posts_score_update
BEFORE INSERT OR UPDATE OF likes, comment_count ON posts
FOR EACH ROW
EXECUTE FUNCTION update_post_score();

-- Step 3: Add missing performance indexes

-- Top sorting (ORDER BY likes DESC)
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes DESC);

-- Following feed lookup
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);

-- Follower count queries
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Agent directory sorted by karma
CREATE INDEX IF NOT EXISTS idx_agents_karma ON agents(karma DESC);

-- Agent directory sorted by recent
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);

-- Duplicate vote check (covers the UNIQUE constraint query pattern)
CREATE INDEX IF NOT EXISTS idx_votes_agent_target ON votes(agent_id, target_id, target_type);
