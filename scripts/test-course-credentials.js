const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test course QPay credentials directly
async function testCourseCredentials() {
  try {
    console.log('🔍 Testing Course QPay Credentials...\n');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('QPAY_COURSE_CLIENT_ID:', process.env.QPAY_COURSE_CLIENT_ID || '❌ Not set');
    console.log('QPAY_COURSE_CLIENT_SECRET:', process.env.QPAY_COURSE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('QPAY_COURSE_BASE_URL:', process.env.QPAY_COURSE_BASE_URL || '❌ Not set');
    console.log('QPAY_COURSE_INVOICE_CODE:', process.env.QPAY_COURSE_INVOICE_CODE || '❌ Not set');
    
    if (!process.env.QPAY_COURSE_CLIENT_ID || !process.env.QPAY_COURSE_CLIENT_SECRET) {
      console.log('\n❌ Course QPay credentials not configured!');
      return;
    }
    
    // Test authentication directly
    console.log('\n🔍 Testing Course QPay Authentication...');
    
    const baseUrl = process.env.QPAY_COURSE_BASE_URL || 'https://merchant.qpay.mn/v2';
    const username = process.env.QPAY_COURSE_CLIENT_ID;
    const password = process.env.QPAY_COURSE_CLIENT_SECRET;
    
    // Clean up base URL if it contains /auth/token
    const cleanBaseUrl = baseUrl.includes('/auth/token') ? baseUrl.replace('/auth/token', '') : baseUrl;
    
    console.log('Using base URL:', cleanBaseUrl);
    console.log('Using username:', username);
    console.log('Using password:', password ? '***' : 'NOT_SET');
    
    // Create Basic Auth header
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    
    try {
      const response = await axios.post(`${cleanBaseUrl}/auth/token`, {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        }
      });
      
      console.log('✅ Course QPay authentication successful!');
      console.log('Response status:', response.status);
      console.log('Token type:', response.data.token_type);
      console.log('Expires in:', response.data.expires_in, 'seconds');
      
    } catch (error) {
      console.error('❌ Course QPay authentication failed!');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data);
      
      if (error.response?.data?.message) {
        console.error('Error message:', error.response.data.message);
      }
    }
    
    // Compare with regular QPay credentials
    console.log('\n🔍 Comparing with Regular QPay Credentials...');
    console.log('QPAY_CLIENT_ID:', process.env.QPAY_CLIENT_ID || '❌ Not set');
    console.log('QPAY_CLIENT_SECRET:', process.env.QPAY_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('QPAY_BASE_URL:', process.env.QPAY_BASE_URL || '❌ Not set');
    
    if (process.env.QPAY_CLIENT_ID && process.env.QPAY_CLIENT_SECRET) {
      const regularBaseUrl = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';
      const regularUsername = process.env.QPAY_CLIENT_ID;
      const regularPassword = process.env.QPAY_CLIENT_SECRET;
      
      const cleanRegularBaseUrl = regularBaseUrl.includes('/auth/token') ? regularBaseUrl.replace('/auth/token', '') : regularBaseUrl;
      const regularBasicAuth = Buffer.from(`${regularUsername}:${regularPassword}`).toString('base64');
      
      try {
        const regularResponse = await axios.post(`${cleanRegularBaseUrl}/auth/token`, {
          grant_type: 'client_credentials'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${regularBasicAuth}`
          }
        });
        
        console.log('✅ Regular QPay authentication successful!');
        console.log('Regular token type:', regularResponse.data.token_type);
        
      } catch (error) {
        console.error('❌ Regular QPay authentication failed!');
        console.error('Regular error:', error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCourseCredentials().catch(console.error); 