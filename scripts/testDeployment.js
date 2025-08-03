const https = require('https');
const http = require('http');

// Get the deployment URL from command line argument or use a default
const deploymentUrl = process.argv[2] || 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';

console.log(`🔍 Testing deployment at: ${deploymentUrl}`);
console.log('=' .repeat(60));

// Test manifest.json
function testManifest() {
  return new Promise((resolve) => {
    const url = `${deploymentUrl}/manifest.json`;
    console.log(`📋 Testing manifest.json...`);
    
    https.get(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      if (res.statusCode === 200) {
        console.log('   ✅ manifest.json is accessible');
      } else {
        console.log(`   ❌ manifest.json returned ${res.statusCode}`);
      }
      resolve();
    }).on('error', (err) => {
      console.log(`   ❌ Error accessing manifest.json: ${err.message}`);
      resolve();
    });
  });
}

// Test favicon
function testFavicon() {
  return new Promise((resolve) => {
    const url = `${deploymentUrl}/favicon.ico`;
    console.log(`🎨 Testing favicon.ico...`);
    
    https.get(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('   ✅ favicon.ico is accessible');
      } else {
        console.log(`   ❌ favicon.ico returned ${res.statusCode}`);
      }
      resolve();
    }).on('error', (err) => {
      console.log(`   ❌ Error accessing favicon.ico: ${err.message}`);
      resolve();
    });
  });
}

// Test main page
function testMainPage() {
  return new Promise((resolve) => {
    const url = deploymentUrl;
    console.log(`🏠 Testing main page...`);
    
    https.get(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('   ✅ Main page is accessible');
      } else {
        console.log(`   ❌ Main page returned ${res.statusCode}`);
      }
      resolve();
    }).on('error', (err) => {
      console.log(`   ❌ Error accessing main page: ${err.message}`);
      resolve();
    });
  });
}

// Test API routes
function testApiRoutes() {
  return new Promise((resolve) => {
    const url = `${deploymentUrl}/api/debug-env`;
    console.log(`🔧 Testing API routes...`);
    
    https.get(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log('   ✅ API routes are responding');
      } else {
        console.log(`   ❌ API routes returned ${res.statusCode}`);
      }
      resolve();
    }).on('error', (err) => {
      console.log(`   ❌ Error accessing API routes: ${err.message}`);
      resolve();
    });
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting deployment tests...\n');
  
  await testManifest();
  console.log('');
  
  await testFavicon();
  console.log('');
  
  await testMainPage();
  console.log('');
  
  await testApiRoutes();
  console.log('');
  
  console.log('=' .repeat(60));
  console.log('✅ Deployment testing completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Check the browser console for any remaining errors');
  console.log('2. Test the authentication flow');
  console.log('3. Verify that embedded content loads properly');
  console.log('4. Check that the PWA manifest is working');
}

runTests().catch(console.error); 