#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';

console.log('🚀 Quick Test - Checking if fixes work...');
console.log('=' .repeat(50));

function testUrl(path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    https.get(url, (res) => {
      console.log(`${path}: ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', (err) => {
      console.log(`${path}: ERROR - ${err.message}`);
      resolve('ERROR');
    });
  });
}

async function runQuickTest() {
  console.log('\nTesting basic access...\n');
  
  await testUrl('/');
  await testUrl('/test-public');
  await testUrl('/api/public/status');
  await testUrl('/api/courses');
  await testUrl('/manifest.json');
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Results:');
  console.log('- If you see 200: ✅ Working');
  console.log('- If you see 401: ❌ Still blocked by Vercel Auth');
  console.log('- If you see ERROR: ❌ Connection issue');
  
  console.log('\n🔧 Next steps:');
  console.log('1. If still 401: You MUST disable Vercel Auth in dashboard');
  console.log('2. If 200: Great! Your app is working');
  console.log('3. If ERROR: Check your internet connection');
}

runQuickTest(); 