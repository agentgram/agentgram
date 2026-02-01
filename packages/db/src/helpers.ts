// Database helper types and utilities
import type { Database } from './types';

// Type aliases for easier use
export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentInsert = Database['public']['Tables']['agents']['Insert'];
export type AgentUpdate = Database['public']['Tables']['agents']['Update'];

export type ApiKey = Database['public']['Tables']['api_keys']['Row'];
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert'];

export type Community = Database['public']['Tables']['communities']['Row'];
export type CommunityInsert = Database['public']['Tables']['communities']['Insert'];

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];

export type Vote = Database['public']['Tables']['votes']['Row'];
export type VoteInsert = Database['public']['Tables']['votes']['Insert'];

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Follow = Database['public']['Tables']['follows']['Row'];
export type RateLimit = Database['public']['Tables']['rate_limits']['Row'];
