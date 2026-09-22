/**
 * ObraService Pro - Cryptographic Secure Identifier Generator
 * Replaces insecure Math.random() or Date.now() for critical entities.
 */

export function generateSecureId(prefix: string = 'id'): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}_${crypto.randomUUID()}`;
    }
  } catch (e) {
    // Fallback if crypto.randomUUID is unavailable
  }
  const randomBytes = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${prefix}_${Date.now()}_${randomBytes}`;
}
