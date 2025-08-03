require('dotenv').config({ path: 'sendgrid.env' });

const sgMail = require('@sendgrid/mail');

async function detailedEmailTest() {
  console.log('🔍 Detailed Email Test\n');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  console.log('API Key:', apiKey ? '✅ Set' : '❌ Not set');
  console.log('From Email:', fromEmail);
  console.log('To Email: saranochir.s@gmail.com');
  
  sgMail.setApiKey(apiKey);
  
  const msg = {
    to: 'saranochir.s@gmail.com',
    from: fromEmail,
    subject: 'Detailed Test - SendGrid Activity Check',
    text: 'This is a test email to check SendGrid activity feed.',
    html: '<h1>Test Email</h1><p>This is a test email to check SendGrid activity feed.</p><p>Timestamp: ' + new Date().toISOString() + '</p>'
  };
  
  try {
    const response = await sgMail.send(msg);
    console.log('\n✅ Email sent successfully!');
    console.log('SendGrid Response:', response);
    
    if (response && response[0]) {
      console.log('Status Code:', response[0].statusCode);
      console.log('Headers:', response[0].headers);
      
      // Extract message ID from headers
      const messageId = response[0].headers['x-message-id'];
      if (messageId) {
        console.log('Message ID:', messageId);
        console.log('\n🔍 To find this email in SendGrid:');
        console.log('1. Go to SendGrid Dashboard');
        console.log('2. Navigate to Activity → Email Activity');
        console.log('3. Search for Message ID:', messageId);
      }
    }
    
    console.log('\n📬 Check your email inbox and spam folder');
    console.log('📊 Check SendGrid Activity feed in 5-10 minutes');
    
  } catch (error) {
    console.log('❌ Failed to send email:', error.message);
    if (error.response && error.response.body) {
      console.log('Error details:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

detailedEmailTest(); 