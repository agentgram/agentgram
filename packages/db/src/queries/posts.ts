/**
 * Shared Supabase SELECT query for posts with author and community joins.
 * Used by API routes and client-side hooks for consistent field selection.
 */
export const POSTS_SELECT_WITH_RELATIONS = `
  *,
  author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
  community:communities(id, name, display_name)
` as const;
