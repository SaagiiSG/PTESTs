import twilio from 'twilio';

// Create Twilio client dynamically to ensure environment variables are loaded
function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.error('Twilio credentials not found:', {
      accountSid: accountSid ? 'Set' : 'Missing',
      authToken: authToken ? 'Set' : 'Missing',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Missing'
    });
    return null;
  }
  
  return twilio(accountSid, authToken);
}

export async function sendVerificationSMS(to: string, code: string) {
  const client = createTwilioClient();
  
  if (!client) {
    throw new Error('Twilio client not available - environment variables not configured');
  }
  
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!phoneNumber) {
    throw new Error('TWILIO_PHONE_NUMBER environment variable not set');
  }
  
  console.log('Sending SMS:', { to, from: phoneNumber, code });
  
  try {
    const message = await client.messages.create({
      body: `Your verification code is: ${code}`,
      from: phoneNumber,
      to,
    });
    
    console.log('SMS sent successfully:', {
      messageId: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body
    });
    
    return message;
  } catch (error: any) {
    console.error('SMS sending failed:', {
      error: error.message,
      code: error.code,
      status: error.status,
      to,
      from: phoneNumber
    });
    throw error;
  }
}