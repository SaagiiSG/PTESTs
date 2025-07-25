const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from('bdc1855feb64c42cc4e5811b6004341f51f27885d1b411de9b0bd466ab2380d6', 'hex'); // 32 bytes for AES-256
const ivLength = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encrypted) {
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Test encryption/decryption
const testText = '<iframe src="https://example.com/test" width="100%" height="600"></iframe>';
console.log('Original text:', testText);

const encrypted = encrypt(testText);
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', testText === decrypted); 