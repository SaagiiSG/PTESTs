require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testTwilioSMS() {
  console.log('🧪 Testing Twilio SMS Directly\n');

  try {
    // Test 1: Direct Twilio SMS test
    console.log('1. Testing direct Twilio SMS...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/request-password-reset-sms`, {
      phoneNumber: '+97699999999'
    });
    
    console.log('✅ API Response:', response.data);

    // Test 2: Check server logs for Twilio errors
    console.log('\n2. Checking for Twilio errors in response...');
    
    if (response.data.error) {
      console.log('❌ Error in response:', response.data.error);
    } else {
      console.log('✅ No errors in response');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      console.error('Error details:', error.response.data.error);
    }
  }
}

// Test environment variables
async function checkEnvVars() {
  console.log('🔧 Checking Environment Variables\n');
  
  const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
  
  required.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('TOKEN') ? '***' + value.slice(-4) : value}`);
    } else {
      console.log(`❌ ${varName}: Missing`);
    }
  });
}

async function main() {
  await checkEnvVars();
  console.log('\n' + '='.repeat(50) + '\n');
  await testTwilioSMS();
}

main().catch(console.error); 