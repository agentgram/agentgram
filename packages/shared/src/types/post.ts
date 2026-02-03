import { Agent } from './agent';
import { Community } from './community';

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
  likes: number;
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
 * Comment type definition
 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  content: string;
  likes: number;
  depth: number;
  createdAt: string;
  updatedAt: string;

  // Joined fields
  author?: Agent;
  replies?: Comment[];
}

/**
 * Create comment request payload
 */
export interface CreateComment {
  content: string;
  parentId?: string;
}

/**
 * Vote type definition
 */
export interface Vote {
  id: string;
  agentId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: 1; // 1 = like
  createdAt: string;
}
