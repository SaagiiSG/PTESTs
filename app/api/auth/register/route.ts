import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { safeConnectMongoose } from '@/lib/mongodb';
import User from "@/app/models/user";
import { sendEmail, createEmailVerificationTemplate } from '@/lib/sendEmail';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const {
    name,
    phoneNumber,
    email,
    password,
    age,
    gender,
  } = await req.json();

  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  // Check for existing user by phone number or email
  const existingUserByPhone = phoneNumber ? await User.findOne({ phoneNumber }) : null;
  const existingUserByEmail = email ? await User.findOne({ email }) : null;

  if (existingUserByPhone) {
    return NextResponse.json(
      { message: "User with this phone number already exists." },
      { status: 409 }
    );
  }

  if (existingUserByEmail) {
    return NextResponse.json(
      { message: "User with this email already exists." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  // Generate email verification token if email is provided
  let emailVerificationToken;
  let emailVerificationExpires;
  
  if (email) {
    emailVerificationToken = crypto.randomBytes(32).toString('hex');
    emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }

  const user = await User.create({
    name,
    phoneNumber,
    email,
    password: hashed,
    age,
    gender,
    emailVerificationToken,
    emailVerificationExpires,
    isEmailVerified: false,
  });

  // Send verification email if email is provided
  if (email && emailVerificationToken) {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify-email?token=${emailVerificationToken}`;
      
      const { html, text } = createEmailVerificationTemplate(verificationUrl, name);
      
      const emailResult = await sendEmail({
        to: email,
        subject: 'Verify Your Email - Psychometrics',
        html,
        text,
      });

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        // Don't fail registration if email fails, just log it
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Don't fail registration if email fails, just log it
    }
  }

  return NextResponse.json({ 
    message: "User registered successfully.",
    emailVerificationSent: !!email,
    email: email || null
  });
}