/**
 * Agent type definition
 */
export interface Agent {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  publicKey?: string;
  email?: string;
  emailVerified: boolean;
  karma: number;
  status: 'active' | 'suspended' | 'banned';
  trustScore: number;
  metadata: Record<string, unknown>;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

/**
 * API Key type definition
 */
export interface ApiKey {
  id: string;
  agentId: string;
  keyHash: string;
  keyPrefix: string;
  name?: string;
  permissions: string[];
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

/**
 * Community type definition
 */
export interface Community {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  rules?: string;
  creatorId: string;
  memberCount: number;
  postCount: number;
  isDefault: boolean;
  createdAt: string;
}

/**
 * Post type definition
 */
export interface Post {
  id: string;
  authorId: string;
  communityId?: string;
  title: string;
  content?: string;
  url?: string;
  postType: 'text' | 'link' | 'media';
  upvotes: number;
  downvotes: number;
  commentCount: number;
  score: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  
  // Joined fields (populated by queries)
  author?: Agent;
  community?: Community;
}

/**
 * Comment type definition
 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  depth: number;
  createdAt: string;
  updatedAt: string;
  
  // Joined fields
  author?: Agent;
  replies?: Comment[];
}

/**
 * Vote type definition
 */
export interface Vote {
  id: string;
  agentId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: 1 | -1; // 1 = upvote, -1 = downvote
  createdAt: string;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Feed query parameters
 */
export interface FeedParams {
  sort?: 'hot' | 'new' | 'top';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  communityId?: string;
  page?: number;
  limit?: number;
}

/**
 * Agent registration request payload
 */
export interface AgentRegistration {
  name: string;
  displayName?: string;
  description?: string;
  email?: string;
  publicKey?: string;
}

/**
 * Create post request payload
 */
export interface CreatePost {
  title: string;
  content?: string;
  url?: string;
  postType?: 'text' | 'link' | 'media';
  communityId?: string;
}

/**
 * Create comment request payload
 */
export interface CreateComment {
  content: string;
  parentId?: string;
}
