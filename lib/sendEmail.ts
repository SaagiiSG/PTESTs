import sgMail from '@sendgrid/mail';

// Handle the case where environment variables are not available during build time
function initializeSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (apiKey) {
    sgMail.setApiKey(apiKey);
  }
}

// Initialize SendGrid if API key is available
initializeSendGrid();

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  // Check if SendGrid is properly configured
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    throw new Error('SendGrid not configured - environment variables not available');
  }
  
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL, // Must be a verified sender in SendGrid
    subject,
    text,
    html,
  };
  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error };
  }
}

// Email verification template
export function createEmailVerificationTemplate(verificationUrl: string, userName: string) {
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

// Password reset template
export function createPasswordResetTemplate(resetUrl: string, userName: string) {
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

// Course completion template
export function createCourseCompletionTemplate(courseTitle: string, userName: string, completedAt: Date, achievements: string[]) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatAchievements = (achievements: string[]) => {
    return achievements.map(achievement => 
      achievement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Completed - Congratulations!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .achievement { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 15px; border-radius: 10px; margin: 15px 0; text-align: center; }
        .stats { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .trophy { font-size: 48px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="trophy">🏆</div>
          <h1>Congratulations!</h1>
          <p>You've successfully completed "${courseTitle}"</p>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>🎉 <strong>Amazing work!</strong> You've just completed "${courseTitle}" and added another achievement to your learning journey.</p>
          
          <div class="achievement">
            <h3>🎯 Course Completed Successfully!</h3>
            <p>Completed on ${formatDate(completedAt)}</p>
          </div>
          
          <div class="stats">
            <h3>📊 Your Achievements</h3>
            <p><strong>${achievements.length}</strong> achievement${achievements.length !== 1 ? 's' : ''} unlocked:</p>
            <p style="color: #059669; font-weight: bold;">${formatAchievements(achievements)}</p>
          </div>
          
          <p>Keep up the great work! Your dedication to learning is inspiring. Here are some suggestions for your next steps:</p>
          
          <ul style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <li>🎓 Explore more courses in related topics</li>
            <li>📚 Review your completed lessons to reinforce learning</li>
            <li>🌟 Share your achievement with friends and colleagues</li>
            <li>🚀 Set new learning goals and continue growing</li>
          </ul>
          
          <p>Ready for your next challenge? Visit our platform to discover more courses that match your interests!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Psychometrics. All rights reserved.</p>
          <p>Keep learning, keep growing! 🌱</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Course Completed - Congratulations!
    
    Hi ${userName},
    
    🎉 Amazing work! You've just completed "${courseTitle}" and added another achievement to your learning journey.
    
    🏆 Course Completed Successfully!
    Completed on ${formatDate(completedAt)}
    
    📊 Your Achievements
    ${achievements.length} achievement${achievements.length !== 1 ? 's' : ''} unlocked: ${formatAchievements(achievements)}
    
    Keep up the great work! Your dedication to learning is inspiring. Here are some suggestions for your next steps:
    
    🎓 Explore more courses in related topics
    📚 Review your completed lessons to reinforce learning
    🌟 Share your achievement with friends and colleagues
    🚀 Set new learning goals and continue growing
    
    Ready for your next challenge? Visit our platform to discover more courses that match your interests!
    
    Best regards,
    The Psychometrics Team
    
    Keep learning, keep growing! 🌱
  `;

  return { html, text };
} 