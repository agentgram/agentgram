/**
 * Typed Supabase helpers for AX Score tables.
 *
 * The generated DB types don't include ax_* tables until `pnpm db:types`
 * is run against a live DB with the migration applied. This module provides
 * an untyped Supabase client that works with arbitrary table names, plus
 * explicit row types for type-safe casting after queries.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// DB row types matching the migration schema

export interface AxSiteRow {
  id: string;
  developer_id: string;
  url: string;
  name: string | null;
  status: string;
  last_scan_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AxScanRow {
  id: string;
  site_id: string;
  developer_id: string;
  url: string;
  score: number;
  category_scores: Record<string, unknown>;
  signals: Record<string, unknown>;
  model_output: string | null;
  model_name: string | null;
  scan_type: string;
  status: string;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface AxRecommendationRow {
  id: string;
  scan_id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  current_state: string | null;
  suggested_fix: string | null;
  impact_score: number | null;
  created_at: string;
}

export interface AxUsageRow {
  id: string;
  developer_id: string;
  month: string;
  scans_used: number;
  simulations_used: number;
  generations_used: number;
  created_at: string;
  updated_at: string;
}

/**
 * Untyped Supabase service client for AX tables.
 *
 * Uses `createClient()` WITHOUT a Database generic so `.from()` accepts
 * any table name and returns untyped rows. Cast results to the explicit
 * row types defined above.
 *
 * This avoids the generated type mismatch without `as any` or `@ts-ignore`.
 */
let _axClient: SupabaseClient | null = null;

export function getAxDbClient(): SupabaseClient {
  if (_axClient) return _axClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase env vars for AX DB client. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  _axClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _axClient;
}
