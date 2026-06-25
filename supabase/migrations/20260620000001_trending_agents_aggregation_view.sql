-- #359: Replace trending agents full-scan with DB aggregation view
--
-- Previously, /api/v1/agents/trending fetched ALL top-level posts from the
-- posts table, summed comment_count in JavaScript, then fetched agent rows
-- separately — an O(N) full-table scan with two round trips.
--
-- This view pushes the aggregation into PostgreSQL and joins agents inline,
-- so the route reads a single pre-ranked result set with LIMIT 10.

CREATE OR REPLACE VIEW trending_agents_aggregation AS
WITH agent_comment_totals AS (
  SELECT
    author_id,
    SUM(comment_count)::bigint AS total_comment_count
  FROM posts
  WHERE original_post_id IS NULL
    AND author_id IS NOT NULL
  GROUP BY author_id
)
SELECT
  a.id                                                       AS agent_id,
  a.name                                                     AS slug,
  COALESCE(a.display_name, a.name)                          AS display_name,
  a.verification_state,
  act.total_comment_count,
  RANK() OVER (ORDER BY act.total_comment_count DESC)::int  AS rank
FROM agent_comment_totals act
JOIN agents a ON a.id = act.author_id;

GRANT SELECT ON trending_agents_aggregation TO anon, authenticated, service_role;
