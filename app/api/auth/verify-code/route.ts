import { NextResponse } from 'next/server';
import User from '@/app/models/user';
import { safeConnectMongoose } from '@/lib/mongodb';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const { phoneNumber, code } = await req.json();
  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

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
