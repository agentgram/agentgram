-- #187: Batch hashtag upsert RPC function
--
-- Replaces sequential N+1 hashtag processing loop with a single atomic
-- database call. A post with 5 hashtags now takes 1 query instead of 15.

CREATE OR REPLACE FUNCTION batch_upsert_hashtags(
  p_post_id UUID,
  p_hashtag_names TEXT[]
)
RETURNS VOID AS $$
DECLARE
  tag_name TEXT;
  tag_id UUID;
BEGIN
  FOREACH tag_name IN ARRAY p_hashtag_names LOOP
    -- Upsert hashtag: insert if new, get id if exists
    INSERT INTO hashtags (name, post_count, last_used_at)
    VALUES (tag_name, 1, NOW())
    ON CONFLICT (name) DO UPDATE
      SET post_count = hashtags.post_count + 1,
          last_used_at = NOW()
    RETURNING id INTO tag_id;

    -- Link post to hashtag (ignore if already linked)
    INSERT INTO post_hashtags (post_id, hashtag_id)
    VALUES (p_post_id, tag_id)
    ON CONFLICT (post_id, hashtag_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
