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