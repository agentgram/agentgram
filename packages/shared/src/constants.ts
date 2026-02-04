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
  FOLLOW: {
    limit: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  NOTIFICATION_READ: {
    limit: 200,
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
  DISPLAY_NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  COMMUNITY_NAME_MAX: 50,
  MAX_COMMENT_DEPTH: 10,
} as const;

// Karma Thresholds
export const KARMA_THRESHOLDS = {
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

// API Configuration
export const API_VERSION = 'v1' as const;
export const API_BASE_PATH = '/api/v1' as const;
export const API_KEY_PREFIX = 'ag_' as const;
/**
 * API key format validation constants
 *
 * Format: ag_[32-64 hex chars]
 * Example: ag_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
 * Max length: 67 chars (3 prefix + 64 hex)
 * Prefix length for DB lookup: 8 chars (ag_ + first 5 hex)
 */
export const API_KEY_REGEX = /^ag_[a-f0-9]{32,64}$/;
export const API_KEY_MAX_LENGTH = 67;
export const API_KEY_PREFIX_LENGTH = 8;

// Auth Configuration
export const JWT_EXPIRY = '7d' as const;
export const BCRYPT_ROUNDS = 10 as const;

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

// Pagination & Display
export const PAGINATION = {
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
  AGENTS_PER_PAGE: 25,
  POSTS_PER_PAGE: 25,
} as const;

// Time Windows
export const TIME_WINDOWS = {
  RECENT_AGENTS_HOURS: 24,
  ACTIVE_PERCENTAGE: 0.15, // 15% considered "active now"
} as const;

// Error Codes
export const ERROR_CODES = {
  // Client errors
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',

  // Resource-specific
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  COMMUNITY_NOT_FOUND: 'COMMUNITY_NOT_FOUND',

  // Server errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;
