require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testUSPhoneNumbers() {
  console.log('🇺🇸 Testing US Phone Number Password Reset\n');

  // Test different US phone number formats
  const testNumbers = [
    '+15551234567',     // Standard US format
    '+1-555-123-4567', // With dashes
    '15551234567',      // Without plus
    '+1(555)123-4567', // With parentheses
  ];

  for (const phoneNumber of testNumbers) {
    console.log(`\n📱 Testing: ${phoneNumber}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/request-password-reset-sms`, {
        phoneNumber
      });
      
      console.log('✅ Response:', response.data.message);
      
      // Check if there are any errors in the response
      if (response.data.error) {
        console.log('❌ Error:', response.data.error);
      }
      
    } catch (error) {
      console.log('❌ Request failed:', error.response?.data?.error || error.message);
    }
  }
}

// Test environment variables
async function checkEnvVars() {
  console.log('🔧 Environment Variables Check\n');
  
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
  await testUSPhoneNumbers();
}

main().catch(console.error);
