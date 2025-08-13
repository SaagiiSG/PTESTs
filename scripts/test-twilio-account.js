require('dotenv').config({ path: '.env.local' });
const twilio = require('twilio');

async function testTwilioAccount() {
  console.log('🔍 Testing Twilio Account Status\n');

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    console.log('❌ Missing environment variables');
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    
    // Test 1: Get account information
    console.log('1. Checking account information...');
    const account = await client.api.accounts(accountSid).fetch();
    console.log('✅ Account Status:', account.status);
    console.log('✅ Account Type:', account.type);
    console.log('✅ Date Created:', account.dateCreated);
    
    // Test 2: Check phone number
    console.log('\n2. Checking phone number...');
    const numbers = await client.incomingPhoneNumbers.list({ phoneNumber });
    if (numbers.length > 0) {
      const number = numbers[0];
      console.log('✅ Phone Number Status:', number.status);
      console.log('✅ Phone Number Type:', number.capabilities);
    } else {
      console.log('❌ Phone number not found in account');
    }
    
    // Test 3: Check account balance/credits
    console.log('\n3. Checking account balance...');
    try {
      const balance = await client.api.accounts(accountSid).balance.fetch();
      console.log('✅ Account Balance:', balance.balance, balance.currency);
    } catch (error) {
      console.log('⚠️  Could not fetch balance (might be trial account)');
    }
    
    // Test 4: Test SMS sending to a test number
    console.log('\n4. Testing SMS sending...');
    try {
      const message = await client.messages.create({
        body: 'Test message from your application',
        from: phoneNumber,
        to: '+15551234567' // Test number
      });
      console.log('✅ Test SMS sent successfully:', message.sid);
    } catch (error) {
      console.log('❌ Test SMS failed:', error.message);
      console.log('   Error Code:', error.code);
      if (error.code === 21211) {
        console.log('   💡 This is expected for unverified numbers in trial accounts');
      }
    }

  } catch (error) {
    console.error('❌ Twilio account test failed:', error.message);
  }
}

testTwilioAccount().catch(console.error);
