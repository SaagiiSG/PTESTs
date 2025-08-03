#!/usr/bin/env node

const https = require('https');

// Configuration
const BASE_URL = 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';
const TEST_EMAIL = 'test@example.com'; // Replace with a real test user email
const TEST_PASSWORD = 'testpassword'; // Replace with a real test user password

console.log('🔍 Debugging API Issues');
console.log('=' .repeat(50));

// Helper function to make HTTPS requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const requestOptions = {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname + new URL(url).search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Test 1: Check if the site is accessible
async function testSiteAccess() {
  console.log('\n1️⃣ Testing site access...');
  try {
    const response = await makeRequest('/');
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log('   ✅ Site is accessible');
    } else {
      console.log('   ❌ Site returned non-200 status');
    }
  } catch (error) {
    console.log(`   ❌ Error accessing site: ${error.message}`);
  }
}

// Test 2: Check authentication endpoint
async function testAuthEndpoint() {
  console.log('\n2️⃣ Testing authentication endpoint...');
  try {
    const response = await makeRequest('/api/auth/session');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    if (response.status === 200) {
      console.log('   ✅ Auth endpoint is working');
    } else {
      console.log('   ❌ Auth endpoint returned non-200 status');
    }
  } catch (error) {
    console.log(`   ❌ Error accessing auth endpoint: ${error.message}`);
  }
}

// Test 3: Check purchased courses API (without auth)
async function testPurchasedCoursesWithoutAuth() {
  console.log('\n3️⃣ Testing purchased courses API (without auth)...');
  try {
    const response = await makeRequest('/api/profile/purchased-courses');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    if (response.status === 401) {
      console.log('   ✅ API correctly requires authentication');
    } else if (response.status === 200) {
      console.log('   ⚠️ API returned data without auth (security issue)');
    } else {
      console.log('   ❌ Unexpected response');
    }
  } catch (error) {
    console.log(`   ❌ Error accessing purchased courses API: ${error.message}`);
  }
}

// Test 4: Check courses API (should be public)
async function testCoursesAPI() {
  console.log('\n4️⃣ Testing courses API (should be public)...');
  try {
    const response = await makeRequest('/api/courses');
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log(`   ✅ Courses API working, found ${response.data.length} courses`);
      if (response.data.length > 0) {
        console.log(`   Sample course: ${response.data[0].title}`);
      }
    } else {
      console.log('   ❌ Courses API returned non-200 status');
    }
  } catch (error) {
    console.log(`   ❌ Error accessing courses API: ${error.message}`);
  }
}

// Test 5: Check tests API (should be public)
async function testTestsAPI() {
  console.log('\n5️⃣ Testing tests API (should be public)...');
  try {
    const response = await makeRequest('/api/protected-tests');
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log(`   ✅ Tests API working, found ${response.data.length} tests`);
      if (response.data.length > 0) {
        console.log(`   Sample test: ${response.data[0].title}`);
      }
    } else {
      console.log('   ❌ Tests API returned non-200 status');
    }
  } catch (error) {
    console.log(`   ❌ Error accessing tests API: ${error.message}`);
  }
}

// Test 6: Check environment variables
async function testEnvironmentVariables() {
  console.log('\n6️⃣ Testing environment variables endpoint...');
  try {
    const response = await makeRequest('/api/debug-env');
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Environment variables endpoint working');
      console.log('   Environment check:', response.data);
    } else {
      console.log('   ❌ Environment variables endpoint returned non-200 status');
    }
  } catch (error) {
    console.log(`   ❌ Error accessing environment variables endpoint: ${error.message}`);
  }
}

// Test 7: Check MongoDB connection
async function testMongoDBConnection() {
  console.log('\n7️⃣ Testing MongoDB connection...');
  try {
    const response = await makeRequest('/api/test-connection');
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ MongoDB connection working');
    } else {
      console.log('   ❌ MongoDB connection failed');
    }
  } catch (error) {
    console.log(`   ❌ Error testing MongoDB connection: ${error.message}`);
  }
}

// Main test function
async function runAllTests() {
  console.log(`🚀 Starting API debugging for: ${BASE_URL}\n`);
  
  await testSiteAccess();
  await testAuthEndpoint();
  await testPurchasedCoursesWithoutAuth();
  await testCoursesAPI();
  await testTestsAPI();
  await testEnvironmentVariables();
  await testMongoDBConnection();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Summary:');
  console.log('1. Check if the site is accessible');
  console.log('2. Verify authentication is working');
  console.log('3. Ensure purchased courses API requires auth');
  console.log('4. Confirm public APIs (courses/tests) work');
  console.log('5. Verify environment variables are set');
  console.log('6. Check MongoDB connection');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. If authentication fails, check NEXTAUTH_SECRET and NEXTAUTH_URL');
  console.log('2. If MongoDB fails, check MONGODB_URI');
  console.log('3. If purchased courses are empty, check user data in database');
  console.log('4. Test with a real authenticated user session');
  
  console.log('\n✅ Debugging completed!');
}

// Run the tests
runAllTests().catch(console.error); 