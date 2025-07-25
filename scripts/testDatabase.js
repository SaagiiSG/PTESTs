const mongoose = require('mongoose');

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function testDatabase() {
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

    // Find all tests
    const tests = await Test.find().lean();
    console.log('Tests found:', tests.length);
    
    if (tests.length > 0) {
      console.log('First test:', {
        _id: tests[0]._id.toString(),
        title: tests[0].title,
        description: tests[0].description,
        hasEmbedCode: !!tests[0].embedCode
      });
    } else {
      console.log('No tests found in database');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

testDatabase(); 