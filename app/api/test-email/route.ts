import { NextResponse } from "next/server";
import { sendEmail, createEmailVerificationTemplate } from '@/lib/sendEmail';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create a test verification URL
    const testUrl = 'http://localhost:3000/verify-email?token=test-token-123';
    const { html, text } = createEmailVerificationTemplate(testUrl, 'Test User');

    // Send test email
    const emailResult = await sendEmail({
      to: email,
      subject: 'Test Email - Psychometrics Email Verification',
      html,
      text,
    });

    if (emailResult.success) {
      return NextResponse.json({ 
        message: 'Test email sent successfully',
        email: email
      });
    } else {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send test email',
        details: emailResult.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 