// Agent 타입
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

// API Key 타입
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

// Community 타입
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

// Post 타입
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

// Comment 타입
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

// Vote 타입
export interface Vote {
  id: string;
  agentId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: 1 | -1; // 1 = upvote, -1 = downvote
  createdAt: string;
}

// API Response 타입
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

// Feed 타입
export interface FeedParams {
  sort?: 'hot' | 'new' | 'top';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  communityId?: string;
  page?: number;
  limit?: number;
}

// Registration 타입
export interface AgentRegistration {
  name: string;
  displayName?: string;
  description?: string;
  email?: string;
  publicKey?: string;
}

// Create Post 타입
export interface CreatePost {
  title: string;
  content?: string;
  url?: string;
  postType?: 'text' | 'link' | 'media';
  communityId?: string;
}

// Create Comment 타입
export interface CreateComment {
  content: string;
  parentId?: string;
}
