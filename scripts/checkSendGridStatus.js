require('dotenv').config({ path: 'sendgrid.env' });

async function checkSendGridStatus() {
  console.log('🔍 Checking SendGrid Account Status...\n');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  console.log('📧 Configuration:');
  console.log('API Key:', apiKey ? '✅ Set' : '❌ Not set');
  console.log('From Email:', fromEmail || '❌ Not set');
  
  if (!apiKey) {
    console.log('\n❌ SENDGRID_API_KEY not found in environment variables');
    return;
  }
  
  try {
    // Test API key by making a request to SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const profile = await response.json();
      console.log('\n✅ SendGrid API Key is valid');
      console.log('Account Email:', profile.email);
      console.log('First Name:', profile.first_name);
      console.log('Last Name:', profile.last_name);
    } else {
      console.log('\n❌ SendGrid API Key is invalid or has insufficient permissions');
      console.log('Status:', response.status);
      const error = await response.text();
      console.log('Error:', error);
    }
    
    // Check sender verification status
    console.log('\n🔍 Checking sender verification...');
    const senderResponse = await fetch('https://api.sendgrid.com/v3/verified_senders', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (senderResponse.ok) {
      const senders = await senderResponse.json();
      console.log('✅ Verified senders retrieved successfully');
      
      if (senders.length === 0) {
        console.log('⚠️  No verified senders found');
        console.log('💡 You need to verify your sender email in SendGrid dashboard');
      } else {
        console.log('📧 Verified senders:');
        senders.forEach(sender => {
          console.log(`  - ${sender.from_email} (${sender.from_name || 'No name'})`);
          console.log(`    Status: ${sender.verified ? '✅ Verified' : '❌ Not verified'}`);
        });
        
        const isVerified = senders.some(sender => 
          sender.from_email === fromEmail && sender.verified
        );
        
        if (isVerified) {
          console.log(`\n✅ ${fromEmail} is verified and ready to send emails`);
        } else {
          console.log(`\n❌ ${fromEmail} is not verified`);
          console.log('💡 Please verify this email address in your SendGrid dashboard');
        }
      }
    } else {
      console.log('❌ Failed to check sender verification');
      console.log('Status:', senderResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error checking SendGrid status:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Check your spam/junk folder for the test email');
  console.log('2. Verify your sender email in SendGrid dashboard');
  console.log('3. If using a custom domain, set up domain authentication');
  console.log('4. Check SendGrid activity logs for delivery status');
}

checkSendGridStatus(); 