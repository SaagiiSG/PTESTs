const crypto = require('crypto');

// Use the correct key that we kept
const EMBED_CODE_SECRET = "bdc1855feb64c42cc4e5811b6004341f51f27885d1b411de9b0bd466ab2380d6";
const algorithm = 'aes-256-cbc';
const key = Buffer.from(EMBED_CODE_SECRET, 'hex');
const ivLength = 16;

function decrypt(encrypted) {
  try {
    if (!encrypted || !encrypted.includes(':')) {
      console.log('Invalid encrypted format');
      return null;
    }
    
    const [ivHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
}

// Test with a sample encrypted string (you can replace this with actual encrypted data)
console.log('Testing decryption with fixed key...');
console.log('Key being used:', EMBED_CODE_SECRET.substring(0, 16) + '...');

// Test the encryption/decryption cycle
const testText = "This is a test embed code";
console.log('Original text:', testText);

// Encrypt
const iv = crypto.randomBytes(ivLength);
const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(testText, 'utf8', 'hex');
encrypted += cipher.final('hex');
const encryptedString = iv.toString('hex') + ':' + encrypted;
console.log('Encrypted:', encryptedString.substring(0, 50) + '...');

// Decrypt
const decrypted = decrypt(encryptedString);
console.log('Decrypted:', decrypted);

if (decrypted === testText) {
  console.log('✅ Decryption test PASSED - the key is working correctly');
} else {
  console.log('❌ Decryption test FAILED');
} 