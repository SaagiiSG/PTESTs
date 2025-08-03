const { Types } = require('mongoose');

async function debugTestSlug() {
  try {
    console.log('🔍 Debugging test slug issue...');
    
    // Test ObjectId validation
    console.log('\n📋 Testing ObjectId validation:');
    console.log('Valid ObjectId format:', Types.ObjectId.isValid('507f1f77bcf86cd799439011'));
    console.log('Invalid format:', Types.ObjectId.isValid('invalid-id'));
    
    // Fetch tests from API
    console.log('\n📊 Fetching tests from API...');
    const response = await fetch('http://localhost:3000/api/protected-tests');
    const tests = await response.json();
    
    console.log(`Found ${tests.length} tests`);
    
    if (tests.length > 0) {
      const test = tests[0];
      console.log('\n📝 Sample test data:');
      console.log('ID:', test.id);
      console.log('Title:', test.title);
      console.log('Is valid ObjectId:', Types.ObjectId.isValid(test.id));
      
      // Test the embed endpoint
      console.log('\n🔗 Testing embed endpoint...');
      const embedResponse = await fetch(`http://localhost:3000/api/protected-tests/${test.id}/embed`);
      console.log('Embed endpoint status:', embedResponse.status);
      
      if (embedResponse.ok) {
        const embedData = await embedResponse.json();
        console.log('Embed data received:', !!embedData.embedCode);
      } else {
        const errorText = await embedResponse.text();
        console.log('Embed endpoint error:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTestSlug(); 