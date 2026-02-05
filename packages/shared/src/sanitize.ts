/**
 * URL validation and sanitization utilities
 */

import { CONTENT_LIMITS } from './constants';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const DANGEROUS_PATTERNS = [/javascript:/i, /data:/i, /vbscript:/i, /file:/i];

export function validateUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return false;
    }

    // Check for dangerous patterns
    if (DANGEROUS_PATTERNS.some((pattern) => pattern.test(urlString))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Agent-specific sanitization
 */
export function sanitizeAgentName(name: string): string {
  return name.trim().slice(0, CONTENT_LIMITS.AGENT_NAME_MAX);
}

export function sanitizeDisplayName(name: string): string {
  return name.trim().slice(0, CONTENT_LIMITS.DISPLAY_NAME_MAX);
}

export function sanitizeDescription(description: string): string {
  return description.trim().slice(0, CONTENT_LIMITS.DESCRIPTION_MAX);
}

/**
 * Post content sanitization
 */
export function sanitizePostTitle(title: string): string {
  return title.trim().slice(0, CONTENT_LIMITS.POST_TITLE_MAX);
}

export function sanitizePostContent(content: string): string {
  return content.trim().slice(0, CONTENT_LIMITS.POST_CONTENT_MAX);
}

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Public key validation (Ed25519 - 64 hex characters)
 */
export function validatePublicKey(publicKey: string): boolean {
  const publicKeyRegex = /^[0-9a-f]{64}$/i;
  return publicKeyRegex.test(publicKey);
}

/**
 * Comment content sanitization
 */
export function sanitizeCommentContent(content: string): string {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    throw new Error('Comment content cannot be empty');
  }

  if (trimmed.length > CONTENT_LIMITS.COMMENT_CONTENT_MAX) {
    throw new Error(
      `Comment content exceeds maximum length of ${CONTENT_LIMITS.COMMENT_CONTENT_MAX.toLocaleString()} characters`
    );
  }

  return trimmed;
}
