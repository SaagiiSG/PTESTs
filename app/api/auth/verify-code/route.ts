import { NextResponse } from 'next/server';
import User from '@/app/models/user';
import { connectMongoose } from '@/lib/mongodb';

export async function POST(req: Request) {
  const { phoneNumber, code } = await req.json();
  await connectMongoose();

  const user = await User.findOne({ phoneNumber });

  if (
    user &&
    user.verificationCode === code &&
    user.verificationCodeExpires > new Date()
  ) {
    user.isPhoneVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    return NextResponse.json({ message: 'Phone verified.' });
  }

  return NextResponse.json({ message: 'Invalid or expired code.' }, { status: 400 });
}
