const mongoose = require('mongoose');
const crypto = require('crypto');

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const algorithm = 'aes-256-cbc';
const key = Buffer.from('bdc1855feb64c42cc4e5811b6004341f51f27885d1b411de9b0bd466ab2380d6', 'hex');
const ivLength = 16;

function decrypt(encrypted) {
  try {
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

async function checkEmbedCode() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the Test schema
    const TestSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: {
        mn: { type: String, required: true },
        en: { type: String, required: true },
      },
      embedCode: { type: String, required: true },
    }, { timestamps: true });

    const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

    // Find the test
    const test = await Test.findById('687a530f9442f243d42aa667').lean();
    
    if (test) {
      console.log('Test found:', {
        _id: test._id.toString(),
        title: test.title,
        embedCodeLength: test.embedCode ? test.embedCode.length : 0,
        embedCodePreview: test.embedCode ? test.embedCode.substring(0, 50) + '...' : 'null'
      });

      if (test.embedCode) {
        const decrypted = decrypt(test.embedCode);
        if (decrypted) {
          console.log('Decrypted embed code:', decrypted);
        } else {
          console.log('Failed to decrypt embed code');
        }
      }
    } else {
      console.log('Test not found');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmbedCode(); 