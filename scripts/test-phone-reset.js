const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testPhoneResetFlow() {
  console.log('🧪 Testing Phone Number Password Reset Flow\n');

  try {
    // Test 1: Request password reset via SMS
    console.log('1. Requesting password reset via SMS...');
    const requestResponse = await axios.post(`${BASE_URL}/api/auth/request-password-reset-sms`, {
      phoneNumber: '+97699999999' // Test phone number
    });
    
    if (requestResponse.status === 200) {
      console.log('✅ SMS request successful:', requestResponse.data.message);
    } else {
      console.log('❌ SMS request failed:', requestResponse.data);
    }

    // Test 2: Verify reset code (this would normally be done by user entering the code)
    console.log('\n2. Testing code verification...');
    const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-reset-code`, {
      phoneNumber: '+97699999999',
      code: '123456' // This would be the actual code sent via SMS
    });
    
    if (verifyResponse.status === 200) {
      console.log('✅ Code verification successful:', verifyResponse.data.message);
      console.log('🔑 Reset token generated:', verifyResponse.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Code verification failed:', verifyResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test Twilio configuration
async function testTwilioConfig() {
  console.log('\n🔧 Testing Twilio Configuration\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/debug-env`);
    const env = response.data;
    
    console.log('Twilio Account SID:', env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
    console.log('Twilio Auth Token:', env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('Twilio Phone Number:', env.TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing');
    
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
      console.log('\n⚠️  Please set up Twilio environment variables:');
      console.log('   - TWILIO_ACCOUNT_SID');
      console.log('   - TWILIO_AUTH_TOKEN');
      console.log('   - TWILIO_PHONE_NUMBER');
    }
  } catch (error) {
    console.error('❌ Could not check environment variables:', error.message);
  }
}

async function main() {
  await testTwilioConfig();
  await testPhoneResetFlow();
}

main().catch(console.error); 