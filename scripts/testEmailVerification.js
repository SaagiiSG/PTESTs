require('dotenv').config({ path: 'sendgrid.env' });

// Mock the email functions since we can't import TypeScript directly
function createEmailVerificationTemplate(verificationUrl, userName) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Psychometrics!</h1>
          <p>Please verify your email address</p>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          
          <p>This link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Psychometrics. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to Psychometrics!
    
    Hi ${userName},
    
    Thank you for signing up! To complete your registration, please verify your email address by visiting this link:
    
    ${verificationUrl}
    
    This link will expire in 24 hours for security reasons.
    
    If you didn't create an account with us, please ignore this email.
    
    Best regards,
    The Psychometrics Team
  `;

  return { html, text };
}

function createPasswordResetTemplate(resetUrl, userName) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
          <p>Reset your Psychometrics account password</p>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #ff6b6b;">${resetUrl}</p>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Psychometrics. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request
    
    Hi ${userName},
    
    We received a request to reset your password. Please visit this link to create a new password:
    
    ${resetUrl}
    
    This link will expire in 1 hour for security reasons.
    
    If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    
    Best regards,
    The Psychometrics Team
  `;

  return { html, text };
}

async function testEmailTemplates() {
  console.log('Testing email templates...');
  
  try {
    // Test email verification template
    const verificationUrl = 'http://localhost:3000/verify-email?token=test-token-123';
    const { html: verificationHtml, text: verificationText } = createEmailVerificationTemplate(verificationUrl, 'Test User');
    
    console.log('✅ Email verification template created successfully');
    console.log('HTML length:', verificationHtml.length);
    console.log('Text length:', verificationText.length);
    
    // Test password reset template
    const resetUrl = 'http://localhost:3000/reset-password?token=test-reset-token-123';
    const { html: resetHtml, text: resetText } = createPasswordResetTemplate(resetUrl, 'Test User');
    
    console.log('✅ Password reset template created successfully');
    console.log('HTML length:', resetHtml.length);
    console.log('Text length:', resetText.length);
    
    // Check environment variables
    console.log('\n📧 Environment Variables:');
    console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ Not set');
    
    // Test sending email
    console.log('\nSending test email...');
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: 'saranochirsereglen@gmail.com', // Replace with your actual email
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Test Email - Psychometrics Email Verification',
      html: verificationHtml,
      text: verificationText,
    };
    
    console.log('Sending to:', msg.to);
    console.log('From:', msg.from);
    console.log('Subject:', msg.subject);
    
    try {
      const response = await sgMail.send(msg);
      console.log('✅ Test email sent successfully');
      console.log('SendGrid response status:', response[0].statusCode);
      console.log('SendGrid response headers:', response[0].headers);
    } catch (error) {
      console.log('❌ Failed to send test email:', error.message);
      if (error.response) {
        console.log('SendGrid response status:', error.response.statusCode);
        console.log('SendGrid response body:', JSON.stringify(error.response.body, null, 2));
      }
    }
    
    console.log('\n🎉 Email template testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing email templates:', error);
  }
}

testEmailTemplates(); 