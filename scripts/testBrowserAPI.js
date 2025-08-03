// Using built-in fetch (Node.js 18+)

async function testBrowserAPI() {
  try {
    console.log('🔍 Testing API from browser-like context...');
    
    // Test the protected-tests API
    console.log('\n📊 Testing /api/protected-tests...');
    const testsResponse = await fetch('http://localhost:3000/api/protected-tests');
    console.log('Tests API status:', testsResponse.status);
    
    if (testsResponse.ok) {
      const tests = await testsResponse.json();
      console.log('Tests found:', tests.length);
      
      if (tests.length > 0) {
        const test = tests[0];
        console.log('Sample test ID:', test.id);
        
        // Test the specific test API
        console.log('\n📝 Testing specific test API...');
        const testResponse = await fetch(`http://localhost:3000/api/protected-tests/${test.id}`);
        console.log('Specific test API status:', testResponse.status);
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('Test data received:', !!testData.title);
          console.log('Test title:', testData.title);
        } else {
          const errorText = await testResponse.text();
          console.log('Specific test API error:', errorText);
        }
        
        // Test the embed API
        console.log('\n🔗 Testing embed API...');
        const embedResponse = await fetch(`http://localhost:3000/api/protected-tests/${test.id}/embed`);
        console.log('Embed API status:', embedResponse.status);
        
        if (embedResponse.ok) {
          const embedData = await embedResponse.json();
          console.log('Embed data received:', !!embedData.embedCode);
        } else {
          const errorText = await embedResponse.text();
          console.log('Embed API error:', errorText);
        }
      }
    } else {
      const errorText = await testsResponse.text();
      console.log('Tests API error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBrowserAPI(); 