require('dotenv').config({ path: 'sendgrid.env' });

const sgMail = require('@sendgrid/mail');

async function quickEmailTest() {
  console.log('📧 Quick Email Test\n');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  console.log('From:', fromEmail);
  console.log('To: saranochir.s@gmail.com');
  
  sgMail.setApiKey(apiKey);
  
  const msg = {
    to: 'saranochirsereglen@gmail.com',
    from: fromEmail,
    subject: 'Quick Test - Email Verification Working!',
    text: 'If you receive this email, your SendGrid setup is working correctly!',
    html: '<h1>Success!</h1><p>Your SendGrid email setup is working correctly!</p>'
  };
  
  try {
    await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('📬 Check your inbox (and spam folder)');
  } catch (error) {
    console.log('❌ Failed to send email:', error.message);
    if (error.response && error.response.body) {
      console.log('Error details:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

quickEmailTest(); 