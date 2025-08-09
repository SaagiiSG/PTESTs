const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const algorithm = 'aes-256-cbc';
const EMBED_CODE_SECRET = process.env.EMBED_CODE_SECRET || 'bdc1855feb64c42cc4e5811b6004341f51f27885d1b411de9b0bd466ab2380d6';
const key = Buffer.from(EMBED_CODE_SECRET, 'hex');
const ivLength = 16;

function decrypt(encrypted) {
  try {
    if (!encrypted || !encrypted.includes(':')) {
      console.log('Invalid encrypted format or unencrypted content');
      return encrypted; // Return as-is if not encrypted
    }
    
    const [ivHex, encryptedText] = encrypted.split(':');
    
    // Validate IV and encrypted text
    if (!ivHex || !encryptedText) {
      console.log('Invalid encrypted format');
      return encrypted;
    }
    
    // Check if IV is valid hex
    if (!/^[0-9a-fA-F]+$/.test(ivHex) || ivHex.length !== 32) {
      console.log('Invalid IV format');
      return encrypted;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return encrypted; // Return original if decryption fails
  }
}

function encrypt(text) {
  try {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error.message);
    return text; // Return original if encryption fails
  }
}

async function fixEmbedCodeDecryption() {
  try {
    console.log('🔍 Fixing embed code decryption issues...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Define the Test schema
    const TestSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      embedCode: { type: String, required: true },
    }, { timestamps: true });

    const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    // Find all tests
    const tests = await Test.find().lean();
    console.log(`📋 Found ${tests.length} tests`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const test of tests) {
      console.log(`\n🔍 Processing test: ${test.title}`);
      console.log(`   ID: ${test._id}`);
      console.log(`   Embed code length: ${test.embedCode ? test.embedCode.length : 0}`);
      
      if (!test.embedCode) {
        console.log('   ⚠️  No embed code found, skipping...');
        continue;
      }
      
      try {
        // Try to decrypt the embed code
        const decrypted = decrypt(test.embedCode);
        
        if (decrypted === test.embedCode) {
          console.log('   ✅ Embed code is already decrypted or unencrypted');
        } else {
          console.log('   🔓 Successfully decrypted embed code');
          console.log('   📝 Original length:', test.embedCode.length);
          console.log('   📝 Decrypted length:', decrypted.length);
          
          // Re-encrypt with the current key
          const reEncrypted = encrypt(decrypted);
          console.log('   🔒 Re-encrypted with current key');
          
          // Update the test in the database
          await Test.findByIdAndUpdate(test._id, { embedCode: reEncrypted });
          console.log('   💾 Updated in database');
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error processing test ${test._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} tests`);
    console.log(`   ❌ Errors: ${errorCount} tests`);
    console.log(`   📊 Total: ${tests.length} tests`);
    
    if (fixedCount > 0) {
      console.log('\n✅ Successfully fixed embed code decryption issues!');
    } else {
      console.log('\nℹ️  No embed codes needed fixing.');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
fixEmbedCodeDecryption();
