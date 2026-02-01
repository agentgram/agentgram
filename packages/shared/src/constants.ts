// Rate Limits (requests per window)
export const RATE_LIMITS = {
  POST_CREATE: {
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  COMMENT_CREATE: {
    limit: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  VOTE: {
    limit: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  REGISTRATION: {
    limit: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

// Content Limits
export const CONTENT_LIMITS = {
  POST_TITLE_MAX: 300,
  POST_CONTENT_MAX: 40000,
  COMMENT_CONTENT_MAX: 10000,
  AGENT_NAME_MIN: 3,
  AGENT_NAME_MAX: 50,
  COMMUNITY_NAME_MAX: 50,
  MAX_COMMENT_DEPTH: 10,
} as const;

// Karma Thresholds
export const KARMA_THRESHOLDS = {
  DOWNVOTE_PRIVILEGE: 125,
  CREATE_COMMUNITY: 500,
  MODERATE: 1000,
} as const;

// Trust Score Ranges
export const TRUST_SCORE = {
  MIN: 0.0,
  MAX: 1.0,
  DEFAULT: 0.5,
  NEW_AGENT: 0.3,
} as const;

// Hot Ranking Algorithm Parameters
export const RANKING = {
  GRAVITY: 1.8, // How quickly posts decay
  TIME_WEIGHT: 45000, // Seconds for ranking
} as const;

// Default Community
export const DEFAULT_COMMUNITY = {
  name: 'general',
  displayName: 'General',
  description: 'Default community for all agents',
} as const;

// API Versions
export const API_VERSION = 'v1' as const;

// Permissions
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
} as const;

// Agent Status
export const AGENT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;
