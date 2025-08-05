#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 Checking NextAuth Authentication Setup...\n');

const requiredVars = {
  'AUTH_SECRET': process.env.AUTH_SECRET,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'MONGODB_URI': process.env.MONGODB_URI,
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
};

let hasErrors = false;
let missingVars = [];

console.log('📋 Environment Variables Status:');
console.log('================================');

Object.entries(requiredVars).forEach(([key, value]) => {
  const status = value ? '✅ Set' : '❌ Missing';
  const displayValue = value ? (key.includes('SECRET') ? '***hidden***' : value) : 'Not set';
  
  console.log(`${key}: ${status}`);
  if (value) {
    console.log(`  Value: ${displayValue}`);
  }
  
  if (!value) {
    hasErrors = true;
    missingVars.push(key);
  }
  console.log('');
});

// Check if we have at least one secret
const hasSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!hasSecret) {
  console.log('❌ CRITICAL ERROR: No authentication secret found!');
  console.log('   You must set either AUTH_SECRET or NEXTAUTH_SECRET');
  hasErrors = true;
}

if (!process.env.NEXTAUTH_URL) {
  console.log('❌ CRITICAL ERROR: NEXTAUTH_URL is missing!');
  console.log('   This is required for NextAuth to work properly');
  hasErrors = true;
}

console.log('🔧 Recommendations:');
console.log('==================');

if (hasErrors) {
  console.log('❌ Issues found that need to be fixed:');
  
  if (!hasSecret) {
    console.log('   1. Add to your .env file:');
    console.log('      NEXTAUTH_SECRET=your-secret-key-here');
    console.log('      (Generate a random 32-character string)');
  }
  
  if (!process.env.NEXTAUTH_URL) {
    console.log('   2. Add to your .env file:');
    console.log('      NEXTAUTH_URL=http://localhost:3000');
    console.log('      (Use your production URL in production)');
  }
  
  missingVars.forEach(varName => {
    if (varName !== 'AUTH_SECRET' && varName !== 'NEXTAUTH_SECRET' && varName !== 'NEXTAUTH_URL') {
      console.log(`   3. Consider adding ${varName} if needed for your setup`);
    }
  });
  
  console.log('\n💡 After fixing these issues:');
  console.log('   1. Restart your development server');
  console.log('   2. Test authentication at /test-auth');
  console.log('   3. Try enrolling in a free test/course');
  
} else {
  console.log('✅ All required environment variables are set!');
  console.log('   Your authentication should work properly.');
  console.log('\n🧪 To test:');
  console.log('   1. Start your development server');
  console.log('   2. Visit /test-auth to verify authentication');
  console.log('   3. Try enrolling in a free test/course');
}

console.log('\n📚 For more information, see FREE_ENROLLMENT_FIX.md'); 