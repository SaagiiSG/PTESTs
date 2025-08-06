const axios = require('axios');

async function testPurchaseVerification() {
  try {
    console.log('Testing purchase verification API...');
    
    // Test the verify-purchase endpoint
    const response = await axios.post('http://localhost:3000/api/verify-purchase', {
      testId: '6891950cca9cd6b4d6d7c8b7' // Use the test ID from the error logs
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Purchase verification API response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testPurchaseVerification(); 