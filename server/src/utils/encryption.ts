import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY =
  process.env.ENCRYPTION_SECRET ||
  process.env.JWT_SECRET ||
  'fallback-secret-key-min-32-chars-long!!';

// Derive 32-byte key from secret
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(cipherText: string): string {
  if (!cipherText) return '';
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    // If not encrypted format, return as is (fallback)
    return cipherText;
  }
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function verifyGithubSignature(secret: string, payload: string, signature: string): boolean {
  if (!signature || !signature.startsWith('sha256=')) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
