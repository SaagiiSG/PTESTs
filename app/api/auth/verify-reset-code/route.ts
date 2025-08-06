import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/app/models/user';
import { safeConnectMongoose } from '@/lib/mongodb';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  try {
    const { phoneNumber, code } = await req.json();

    if (!phoneNumber || !code) {
      return NextResponse.json({ error: 'Phone number and code are required' }, { status: 400 });
    }

    const connection = await safeConnectMongoose();
    if (!connection) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Find user and verify code
    const user = await User.findOne({ phoneNumber });

    console.log('🔍 Debug verification:', {
      phoneNumber,
      code,
      userFound: !!user,
      userCode: user?.passwordResetCode,
      userExpires: user?.passwordResetExpires,
      currentTime: new Date(),
      codeMatch: user?.passwordResetCode === code,
      notExpired: user?.passwordResetExpires && user.passwordResetExpires > new Date()
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    if (
      user.passwordResetCode !== code ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token and clear the SMS code
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
      passwordResetCode: undefined, // Clear the SMS code
    });

    return NextResponse.json({ 
      message: 'Code verified successfully',
      token: resetToken
    });

  } catch (error) {
    console.error('Reset code verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 