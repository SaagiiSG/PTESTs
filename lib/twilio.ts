import twilio from 'twilio';

// Handle the case where environment variables are not available during build time
function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    // During build time, this is expected - return null
    // This will be replaced at runtime when the environment variables are available
    return null;
  }
  
  return twilio(accountSid, authToken);
}

const client = createTwilioClient();

export async function sendVerificationSMS(to: string, code: string) {
  if (!client) {
    throw new Error('Twilio client not available - environment variables not configured');
  }
  
  return client.messages.create({
    body: `Your verification code is: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}