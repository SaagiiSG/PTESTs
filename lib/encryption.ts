import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

// Handle the case where EMBED_CODE_SECRET is not available during build time
function getEncryptionKey(): Buffer {
  const secret = process.env.EMBED_CODE_SECRET;
  if (!secret) {
    // During build time, this is expected - return a dummy key
    // This will be replaced at runtime when the environment variable is available
    return Buffer.alloc(32, 0); // 32 bytes of zeros as fallback
  }
  return Buffer.from(secret, 'hex'); // 32 bytes for AES-256
}

const key = getEncryptionKey();
const ivLength = 16;

export function encrypt(text: string): string {
  // Check if we have a valid encryption key
  if (!process.env.EMBED_CODE_SECRET) {
    throw new Error('EMBED_CODE_SECRET environment variable is not available');
  }
  
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encrypted: string | undefined | null): string {
  // Handle undefined/null values gracefully
  if (!encrypted) {
    throw new Error('Cannot decrypt undefined or null value');
  }
  
  // Check if we have a valid encryption key
  if (!process.env.EMBED_CODE_SECRET) {
    throw new Error('EMBED_CODE_SECRET environment variable is not available');
  }
  
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
} 