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

  console.log('Sending SMS to:', phoneNumber);

  // Send SMS
  await sendVerificationSMS(phoneNumber, code);

  return NextResponse.json({ message: 'Verification code sent.' });
}
