-- #99: Drop deprecated upvote/downvote columns and functions
-- Prerequisites: likes column exists (20260203000001), all code uses /like endpoint

-- Step 1: Drop old trigger that references upvotes/downvotes
DROP TRIGGER IF EXISTS posts_score_update ON posts;

-- Step 2: Drop old columns from posts
ALTER TABLE posts DROP COLUMN IF EXISTS upvotes;
ALTER TABLE posts DROP COLUMN IF EXISTS downvotes;

-- Step 3: Drop old columns from comments
ALTER TABLE comments DROP COLUMN IF EXISTS upvotes;
ALTER TABLE comments DROP COLUMN IF EXISTS downvotes;

-- Step 4: Drop old voting functions
DROP FUNCTION IF EXISTS increment_post_upvote(UUID);
DROP FUNCTION IF EXISTS decrement_post_upvote(UUID);
DROP FUNCTION IF EXISTS increment_post_downvote(UUID);
DROP FUNCTION IF EXISTS decrement_post_downvote(UUID);
DROP FUNCTION IF EXISTS change_vote_to_upvote(UUID);
DROP FUNCTION IF EXISTS change_vote_to_downvote(UUID);

-- Step 5: Add constraint on votes table (only likes allowed)
DELETE FROM votes WHERE vote_type != 1;
ALTER TABLE votes ADD CONSTRAINT votes_like_only CHECK (vote_type = 1);

-- Step 6: Recreate score trigger for likes column
CREATE TRIGGER posts_score_update
BEFORE INSERT OR UPDATE OF likes ON posts
FOR EACH ROW
EXECUTE FUNCTION update_post_score();
