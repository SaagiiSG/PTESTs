const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function deleteAllTests() {
  try {
    console.log('🗑️  Deleting all existing tests...');
    
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
    
    // Count existing tests
    const testCount = await Test.countDocuments();
    console.log(`📋 Found ${testCount} existing tests`);
    
    if (testCount === 0) {
      console.log('ℹ️  No tests to delete');
      return;
    }
    
    // List all tests before deletion
    const tests = await Test.find().lean();
    console.log('\n📝 Tests to be deleted:');
    tests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.title} (ID: ${test._id})`);
    });
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete all tests!');
    console.log('   This action cannot be undone.');
    console.log('   Make sure you have backups if needed.');
    
    // For safety, we'll require manual confirmation
    console.log('\n🔒 To proceed with deletion, please:');
    console.log('   1. Review the tests listed above');
    console.log('   2. Ensure you have backups if needed');
    console.log('   3. Run this script again with --confirm flag');
    
    // Check if --confirm flag is provided
    const args = process.argv.slice(2);
    if (!args.includes('--confirm')) {
      console.log('\n❌ Deletion cancelled. Run with --confirm to proceed.');
      console.log('   Example: node scripts/deleteAllTests.js --confirm');
      return;
    }
    
    // Proceed with deletion
    console.log('\n🗑️  Proceeding with deletion...');
    const result = await Test.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} tests`);
    console.log('🎉 Database is now clean and ready for new tests!');
    
    // Verify deletion
    const remainingCount = await Test.countDocuments();
    console.log(`📊 Remaining tests: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('✅ All tests successfully deleted');
    } else {
      console.log('⚠️  Some tests may still exist');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
deleteAllTests();



