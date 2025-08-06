const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function debugEmbedCode() {
  try {
    console.log('🔍 Debugging embed code...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Define the Test schema
    const TestSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      embedCode: { type: String, required: true },
    }, { timestamps: true });

    const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    // Find the specific test
    const test = await Test.findById('6891950cca9cd6b4d6d7c8b7').lean();
    
    if (test) {
      console.log('\n📋 Test Details:');
      console.log('ID:', test._id.toString());
      console.log('Title:', test.title);
      console.log('Embed Code Length:', test.embedCode ? test.embedCode.length : 0);
      
      console.log('\n🔍 Embed Code Analysis:');
      console.log('Raw embed code (first 200 chars):', test.embedCode ? test.embedCode.substring(0, 200) + '...' : 'null');
      
      if (test.embedCode) {
        // Check if it's a URL
        if (test.embedCode.startsWith('http')) {
          console.log('✅ Type: URL/Link');
          console.log('⚠️  This needs to be converted to iframe');
        } else if (test.embedCode.includes('<iframe')) {
          console.log('✅ Type: iframe HTML');
          console.log('✅ Should render correctly');
        } else if (test.embedCode.includes('<a')) {
          console.log('❌ Type: Anchor tag');
          console.log('⚠️  This needs to be converted to iframe');
        } else {
          console.log('❓ Type: Unknown format');
          console.log('Content preview:', test.embedCode.substring(0, 100));
        }
      }
    } else {
      console.log('❌ Test not found');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugEmbedCode(); 