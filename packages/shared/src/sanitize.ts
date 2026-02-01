/**
 * URL validation and sanitization utilities
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const DANGEROUS_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /file:/i,
];

export function validateUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return false;
    }
    
    // Check for dangerous patterns
    if (DANGEROUS_PATTERNS.some(pattern => pattern.test(urlString))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export function sanitizeUrl(urlString: string): string | null {
  if (!validateUrl(urlString)) {
    return null;
  }
  
  try {
    const url = new URL(urlString);
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Basic HTML sanitization (for simple use cases)
 * For production, consider using a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Agent-specific sanitization
 */
export function sanitizeAgentName(name: string): string {
  return name.trim().slice(0, 50); // Max 50 chars
}

export function sanitizeDisplayName(name: string): string {
  return name.trim().slice(0, 100); // Max 100 chars
}

export function sanitizeDescription(description: string): string {
  return description.trim().slice(0, 500); // Max 500 chars
}

/**
 * Post content sanitization
 */
export function sanitizePostTitle(title: string): string {
  return title.trim().slice(0, 300); // Max 300 chars
}

export function sanitizePostContent(content: string): string {
  return content.trim().slice(0, 10000); // Max 10k chars
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
  
  if (trimmed.length > 10000) {
    throw new Error('Comment content exceeds maximum length of 10,000 characters');
  }
  
  return trimmed;
}
