const https = require('https');

console.log('🔍 Testing Google OAuth Configuration...\n');

const deploymentUrl = 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';

// Test the OAuth callback endpoint
function testOAuthCallback() {
  return new Promise((resolve) => {
    const url = `${deploymentUrl}/api/auth/callback/google`;
    console.log(`🔗 Testing OAuth callback endpoint: ${url}`);
    
    https.get(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('   ✅ OAuth callback endpoint is accessible');
      } else if (res.statusCode === 302 || res.statusCode === 307) {
        console.log('   ✅ OAuth callback endpoint is redirecting (expected)');
      } else {
        console.log(`   ❌ OAuth callback endpoint returned ${res.statusCode}`);
      }
      resolve();
    }).on('error', (err) => {
      console.log(`   ❌ Error accessing OAuth callback: ${err.message}`);
      resolve();
    });
  });
}

// Test the signin endpoint
function testSignIn() {
  return new Promise((resolve) => {
    const url = `${deploymentUrl}/api/auth/signin`;
    console.log(`🔐 Testing signin endpoint: ${url}`);
    
    https.get(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('   ✅ Signin endpoint is accessible');
      } else if (res.statusCode === 302 || res.statusCode === 307) {
        console.log('   ✅ Signin endpoint is redirecting (expected)');
      } else {
        console.log(`   ❌ Signin endpoint returned ${res.statusCode}`);
      }
      resolve();
    }).on('error', (err) => {
      console.log(`   ❌ Error accessing signin endpoint: ${err.message}`);
      resolve();
    });
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Google OAuth tests...\n');
  
  await testOAuthCallback();
  console.log('');
  
  await testSignIn();
  console.log('');
  
  console.log('=' .repeat(60));
  console.log('📋 Next Steps:');
  console.log('1. Go to Google Cloud Console → APIs & Services → Credentials');
  console.log('2. Edit your OAuth 2.0 Client ID');
  console.log('3. Add this redirect URI:');
  console.log(`   ${deploymentUrl}/api/auth/callback/google`);
  console.log('4. Save and wait a few minutes');
  console.log('5. Test Google login on your deployed site');
  console.log('');
  console.log('🔗 Google Cloud Console: https://console.cloud.google.com/');
}

runTests().catch(console.error); 