import { NextResponse } from 'next/server';
import { sendVerificationSMS } from '@/lib/twilio';
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
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Please use international format (e.g., +15551234567)' 
      }, { status: 400 });
    }

    console.log('📱 Password reset request for phone:', phoneNumber);

    const connection = await safeConnectMongoose();
    if (!connection) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ message: 'If an account with this phone number exists, a verification code has been sent' });
    }

    console.log('✅ User found:', { userId: user._id, name: user.name });

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('📱 SMS Debug:', {
      phoneNumber,
      generatedCode: code,
      expiresAt: resetExpires,
      userId: user._id,
      timestamp: new Date().toISOString()
    });

    // Update user with reset code
    await User.findByIdAndUpdate(user._id, {
      passwordResetCode: code,
      passwordResetExpires: resetExpires,
    });

    // Send SMS with verification code
    try {
      await sendVerificationSMS(phoneNumber, code);
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
      return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'If an account with this phone number exists, a verification code has been sent'
    });

  } catch (error) {
    console.error('Password reset SMS request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 