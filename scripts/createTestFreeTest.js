const mongoose = require('mongoose');
require('dotenv').config();

async function createFreeTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const TestSchema = new mongoose.Schema({
      title: String,
      description: mongoose.Schema.Types.Mixed,
      price: Number,
      testType: String,
      takenCount: Number,
      thumbnailUrl: String,
      uniqueCodes: [mongoose.Schema.Types.Mixed]
    }, { timestamps: true });

    const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    // Create a new free test
    const newTest = new Test({
      title: 'Free Enrollment Test - Demo',
      description: {
        mn: 'Энэ бол үнэгүй бүртгэлийн тест юм. Энэ тестийг ашиглан үнэгүй бүртгэлийн системийг туршиж үзээрэй.',
        en: 'This is a free enrollment test. Use this test to verify the free enrollment system is working correctly.'
      },
      price: 0,
      testType: 'Demo',
      takenCount: 0,
      thumbnailUrl: '',
      uniqueCodes: Array.from({ length: 100 }, (_, i) => ({
        code: `DEMO-${String(i + 1).padStart(3, '0')}`,
        used: false,
        assignedTo: null,
        assignedAt: null
      }))
    });
    
    const savedTest = await newTest.save();
    
    console.log('\n=== New Free Test Created ===');
    console.log(`Test ID: ${savedTest._id}`);
    console.log(`Title: ${savedTest.title}`);
    console.log(`Price: ${savedTest.price} MNT`);
    console.log(`Type: ${savedTest.testType}`);
    console.log(`Unique Codes: ${savedTest.uniqueCodes.length}`);
    
    console.log('\n✅ New free test created successfully!');
    console.log('You can now use this test ID for free enrollment testing.');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

createFreeTest(); 