import { NextResponse } from 'next/server';
import { sendVerificationSMS } from '@/lib/twilio';
import User from '@/app/models/user';
import { connectMongoose } from '@/lib/mongodb';

export async function POST(req) {
  console.log("Request-verification route hit");
  const { phoneNumber } = await req.json();
  await connectMongoose();

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save code and expiry to user
  await User.findOneAndUpdate(
    { phoneNumber },
    {
      verificationCode: code,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
    }
  );

  console.log('Preparing to send SMS to:', phoneNumber);

  // Try to send SMS, but don't block dev/testing if Twilio isn't configured
  try {
    await sendVerificationSMS(phoneNumber, code);
    return NextResponse.json({ message: 'Verification code sent.' });
  } catch (error) {
    console.error('Failed to send SMS, returning dev fallback:', error?.message || error);
    // In development or when Twilio is not configured, return the code so testing can proceed
    return NextResponse.json({ 
      message: 'Verification code generated (SMS not sent). Use this code for testing.',
      devCode: code,
      debug: {
        twilioAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        twilioPhone: !!process.env.TWILIO_PHONE_NUMBER,
      }
    });
  }
}
