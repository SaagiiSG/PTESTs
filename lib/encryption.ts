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
  
  // Check if the encrypted string has the expected format
  if (!encrypted.includes(':')) {
    // If it doesn't have the expected format, it might be unencrypted
    console.log('ℹ️  Encrypted string does not have expected format, returning as-is');
    return encrypted;
  }
  
  try {
    const [ivHex, encryptedText] = encrypted.split(':');
    
    // Validate IV and encrypted text
    if (!ivHex || !encryptedText) {
      console.log('⚠️  Invalid encrypted format, returning as-is');
      return encrypted;
    }
    
    // Check if IV is valid hex
    if (!/^[0-9a-fA-F]+$/.test(ivHex) || ivHex.length !== 32) {
      console.log('⚠️  Invalid IV format, returning as-is');
      return encrypted;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    
    // If decryption fails, it might be unencrypted content
    // Return the original string as a fallback
    console.log('ℹ️  Decryption failed, returning original content as-is');
    return encrypted;
  }
} 