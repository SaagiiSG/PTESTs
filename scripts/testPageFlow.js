const fetch = require('node-fetch');

async function testPageFlow() {
  const baseUrl = 'http://localhost:3000';
  const testId = '687a530f9442f243d42aa667';

  try {
    console.log('1. Testing /api/tests endpoint...');
    const testsResponse = await fetch(`${baseUrl}/api/tests`);
    const tests = await testsResponse.json();
    console.log('Tests found:', tests.length);
    
    if (tests.length > 0) {
      const test = tests.find(t => t._id === testId);
      if (test) {
        console.log('2. Found test:', {
          _id: test._id,
          title: test.title,
          description: test.description
        });

        console.log('3. Testing embed endpoint...');
        const embedResponse = await fetch(`${baseUrl}/api/protected-tests/${testId}/embed`);
        const embedData = await embedResponse.json();
        
        if (embedData.embedCode) {
          console.log('4. Embed code received successfully!');
          console.log('Embed code preview:', embedData.embedCode.substring(0, 100) + '...');
        } else {
          console.log('4. Error getting embed code:', embedData);
        }
      } else {
        console.log('2. Test not found with ID:', testId);
      }
    }

    console.log('5. Testing page endpoint...');
    const pageResponse = await fetch(`${baseUrl}/ptests/${testId}`);
    console.log('Page status:', pageResponse.status);
    console.log('Page response includes "Loading" text:', pageResponse.text().includes('Loading'));

  } catch (error) {
    console.error('Error in test flow:', error);
  }
}

testPageFlow(); 