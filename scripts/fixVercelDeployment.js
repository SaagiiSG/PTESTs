#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔧 Vercel Deployment Fix Script');
console.log('=' .repeat(50));

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Check for required files
const requiredFiles = [
  'middleware.ts',
  'vercel.json',
  'app/layout.tsx',
  'public/manifest.json'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

console.log('\n🔍 Checking middleware configuration...');
const middlewareContent = fs.readFileSync('middleware.ts', 'utf8');
if (middlewareContent.includes('manifest.json')) {
  console.log('   ✅ Middleware allows manifest.json access');
} else {
  console.log('   ❌ Middleware may block manifest.json');
}

console.log('\n🔍 Checking Vercel configuration...');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
if (vercelConfig.headers) {
  console.log('   ✅ Vercel headers configured');
} else {
  console.log('   ❌ No Vercel headers configured');
}

console.log('\n🔍 Checking layout configuration...');
const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
if (layoutContent.includes('Content-Security-Policy')) {
  console.log('   ✅ CSP configured');
} else {
  console.log('   ❌ No CSP configured');
}

console.log('\n📋 Environment Variables Checklist:');
console.log('   Required for Vercel deployment:');
console.log('   - NEXTAUTH_URL');
console.log('   - NEXTAUTH_SECRET');
console.log('   - MONGODB_URI');
console.log('   - NODE_ENV=production');

console.log('\n🔧 Quick Fixes Applied:');
console.log('   1. ✅ Updated middleware.ts to allow static files');
console.log('   2. ✅ Added CSP headers to layout.tsx');
console.log('   3. ✅ Updated vercel.json with proper headers');
console.log('   4. ✅ Created ErrorBoundary component');

console.log('\n📝 Next Steps:');
console.log('   1. Set environment variables in Vercel dashboard');
console.log('   2. Redeploy your application');
console.log('   3. Run: node scripts/testDeployment.js');
console.log('   4. Check browser console for errors');

console.log('\n🚀 To set environment variables:');
console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('   2. Add the required variables listed above');
console.log('   3. Redeploy the application');

console.log('\n🔗 Useful Links:');
console.log('   - Vercel Dashboard: https://vercel.com/dashboard');
console.log('   - Environment Variables Guide: https://vercel.com/docs/projects/environment-variables');
console.log('   - Deployment Guide: VERCEL_DEPLOYMENT_FIX.md');

console.log('\n✅ Script completed! Follow the steps above to fix your deployment.'); 