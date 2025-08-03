require('dotenv').config({ path: 'sendgrid.env' });

async function testSendGridTestEmail() {
  console.log('🧪 Testing SendGrid Test Email Feature...\n');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.log('❌ SENDGRID_API_KEY not found');
    return;
  }
  
  try {
    // Use SendGrid's test email endpoint
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: 'saranochirsereglen@gmail.com',
                name: 'Test User'
              }
            ]
          }
        ],
        from: {
          email: 'test@example.com', // This should work for test emails
          name: 'Test Sender'
        },
        subject: 'Test Email from SendGrid API',
        content: [
          {
            type: 'text/plain',
            value: 'This is a test email sent via SendGrid API to verify email delivery.'
          },
          {
            type: 'text/html',
            value: `
              <html>
                <body>
                  <h1>Test Email</h1>
                  <p>This is a test email sent via SendGrid API to verify email delivery.</p>
                  <p>If you receive this email, it means SendGrid is working correctly!</p>
                </body>
              </html>
            `
          }
        ]
      })
    });
    
    if (response.ok) {
      console.log('✅ Test email sent successfully via SendGrid API');
      console.log('Status:', response.status);
      
      // Get response headers
      const headers = response.headers;
      console.log('Message ID:', headers.get('x-message-id'));
      
    } else {
      console.log('❌ Failed to send test email');
      console.log('Status:', response.status);
      const error = await response.json();
      console.log('Error:', JSON.stringify(error, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Check your email inbox for the test email');
  console.log('2. If you receive it, the issue is with sender verification');
  console.log('3. If you don\'t receive it, check spam folder');
  console.log('4. Verify your sender email in SendGrid dashboard');
}

testSendGridTestEmail(); 