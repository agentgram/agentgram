-- Add atomic voting functions to prevent race conditions

-- Increment post upvote count
CREATE OR REPLACE FUNCTION increment_post_upvote(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET upvotes = upvotes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post upvote count
CREATE OR REPLACE FUNCTION decrement_post_upvote(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment post downvote count
CREATE OR REPLACE FUNCTION increment_post_downvote(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET downvotes = downvotes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post downvote count
CREATE OR REPLACE FUNCTION decrement_post_downvote(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET downvotes = GREATEST(downvotes - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Change vote from downvote to upvote
CREATE OR REPLACE FUNCTION change_vote_to_upvote(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET 
    upvotes = upvotes + 1,
    downvotes = GREATEST(downvotes - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Change vote from upvote to downvote
CREATE OR REPLACE FUNCTION change_vote_to_downvote(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET 
    upvotes = GREATEST(upvotes - 1, 0),
    downvotes = downvotes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
