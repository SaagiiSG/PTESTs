#!/usr/bin/env node

const dns = require('dns').promises;
const https = require('https');
const http = require('http');

const domain = process.argv[2];

if (!domain) {
  console.log('Usage: node verify-domain-setup.js <yourdomain.com>');
  console.log('Example: node verify-domain-setup.js example.com');
  process.exit(1);
}

async function checkDNS(domainName) {
  console.log(`\n🔍 Checking DNS configuration for ${domainName}...\n`);
  
  try {
    // Check A record
    const aRecords = await dns.resolve4(domainName);
    console.log(`✅ A Records: ${aRecords.join(', ')}`);
    
    // Check if it points to Vercel
    const isVercel = aRecords.some(ip => ip === '76.76.19.36');
    if (isVercel) {
      console.log('✅ Domain points to Vercel IP');
    } else {
      console.log('⚠️  Domain does not point to Vercel IP (76.76.19.36)');
    }
    
    // Check CNAME for www subdomain
    try {
      const cnameRecords = await dns.resolveCname(`www.${domainName}`);
      console.log(`✅ WWW CNAME: ${cnameRecords.join(', ')}`);
      
      const isVercelCNAME = cnameRecords.some(cname => cname.includes('vercel-dns.com'));
      if (isVercelCNAME) {
        console.log('✅ WWW subdomain points to Vercel');
      } else {
        console.log('⚠️  WWW subdomain does not point to Vercel');
      }
    } catch (error) {
      console.log('❌ WWW CNAME not found or not configured');
    }
    
  } catch (error) {
    console.log(`❌ DNS resolution failed: ${error.message}`);
  }
}

function checkSSL(domainName) {
  return new Promise((resolve) => {
    const options = {
      hostname: domainName,
      port: 443,
      method: 'GET',
      path: '/',
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      console.log(`✅ HTTPS Status: ${res.statusCode}`);
      console.log(`✅ SSL Certificate: Valid`);
      
      // Check for security headers
      const hsts = res.headers['strict-transport-security'];
      if (hsts) {
        console.log('✅ HSTS Header: Present');
      } else {
        console.log('⚠️  HSTS Header: Not found');
      }
      
      resolve();
    });

    req.on('error', (error) => {
      console.log(`❌ HTTPS Error: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log('❌ HTTPS Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

function checkHTTPRedirect(domainName) {
  return new Promise((resolve) => {
    const options = {
      hostname: domainName,
      port: 80,
      method: 'GET',
      path: '/',
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      console.log(`✅ HTTP Status: ${res.statusCode}`);
      
      if (res.statusCode === 301 || res.statusCode === 302) {
        const location = res.headers.location;
        console.log(`✅ HTTP Redirect: ${location}`);
        
        if (location && location.startsWith('https://')) {
          console.log('✅ HTTP to HTTPS redirect: Working');
        } else {
          console.log('⚠️  HTTP redirect not to HTTPS');
        }
      } else {
        console.log('⚠️  No HTTP redirect detected');
      }
      
      resolve();
    });

    req.on('error', (error) => {
      console.log(`❌ HTTP Error: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log('❌ HTTP Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function checkTTL(domainName) {
  console.log('\n⏱️  Checking TTL settings...\n');
  
  try {
    // This is a simplified TTL check
    // In production, you might want to use a more sophisticated DNS library
    console.log('ℹ️  TTL verification requires manual checking with:');
    console.log(`   dig ${domainName}`);
    console.log(`   nslookup ${domainName}`);
    console.log('\n📋 Recommended TTL values:');
    console.log('   - Initial setup: 300 seconds (5 minutes)');
    console.log('   - Production: 3600 seconds (1 hour)');
    console.log('   - High traffic: 86400 seconds (24 hours)');
  } catch (error) {
    console.log(`❌ TTL check failed: ${error.message}`);
  }
}

async function main() {
  console.log(`🚀 Domain Verification Tool for ${domain}`);
  console.log('=' .repeat(50));
  
  await checkDNS(domain);
  await checkSSL(domain);
  await checkHTTPRedirect(domain);
  await checkTTL(domain);
  
  console.log('\n📋 Next Steps:');
  console.log('1. Verify domain is added in Vercel dashboard');
  console.log('2. Check DNS propagation with: https://whatsmydns.net');
  console.log('3. Test website functionality');
  console.log('4. Monitor for SSL certificate issuance (24-48 hours)');
  console.log('5. Set up monitoring and analytics');
  
  console.log('\n📚 For more information, see: docs/VERCEL_DOMAIN_SETUP.md');
}

main().catch(console.error); 