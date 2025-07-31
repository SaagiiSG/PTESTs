#!/usr/bin/env node

/**
 * Script to bulk add Vercel IP addresses to MongoDB Atlas using the API
 * This is the most efficient way to add all IPs at once
 */

const https = require('https');

// Vercel IP ranges (same as before)
const VERCEL_IP_RANGES = [
  '76.76.19.34/32', '76.76.19.35/32', '76.76.19.36/32', '76.76.19.37/32', '76.76.19.38/32',
  '76.76.19.39/32', '76.76.19.40/32', '76.76.19.41/32', '76.76.19.42/32', '76.76.19.43/32',
  '76.76.19.44/32', '76.76.19.45/32', '76.76.19.46/32', '76.76.19.47/32', '76.76.19.48/32',
  '76.76.19.49/32', '76.76.19.50/32', '76.76.19.51/32', '76.76.19.52/32', '76.76.19.53/32',
  '76.76.19.54/32', '76.76.19.55/32', '76.76.19.56/32', '76.76.19.57/32', '76.76.19.58/32',
  '76.76.19.59/32', '76.76.19.60/32', '76.76.19.61/32', '76.76.19.62/32', '76.76.19.63/32',
  '76.76.19.64/32', '76.76.19.65/32', '76.76.19.66/32', '76.76.19.67/32', '76.76.19.68/32',
  '76.76.19.69/32', '76.76.19.70/32', '76.76.19.71/32', '76.76.19.72/32', '76.76.19.73/32',
  '76.76.19.74/32', '76.76.19.75/32', '76.76.19.76/32', '76.76.19.77/32', '76.76.19.78/32',
  '76.76.19.79/32', '76.76.19.80/32', '76.76.19.81/32', '76.76.19.82/32', '76.76.19.83/32',
  '76.76.19.84/32', '76.76.19.85/32', '76.76.19.86/32', '76.76.19.87/32', '76.76.19.88/32',
  '76.76.19.89/32', '76.76.19.90/32', '76.76.19.91/32', '76.76.19.92/32', '76.76.19.93/32',
  '76.76.19.94/32', '76.76.19.95/32', '76.76.19.96/32', '76.76.19.97/32', '76.76.19.98/32',
  '76.76.19.99/32', '76.76.19.100/32', '76.76.19.101/32', '76.76.19.102/32', '76.76.19.103/32',
  '76.76.19.104/32', '76.76.19.105/32', '76.76.19.106/32', '76.76.19.107/32', '76.76.19.108/32',
  '76.76.19.109/32', '76.76.19.110/32', '76.76.19.111/32', '76.76.19.112/32', '76.76.19.113/32',
  '76.76.19.114/32', '76.76.19.115/32', '76.76.19.116/32', '76.76.19.117/32', '76.76.19.118/32',
  '76.76.19.119/32', '76.76.19.120/32', '76.76.19.121/32', '76.76.19.122/32', '76.76.19.123/32',
  '76.76.19.124/32', '76.76.19.125/32', '76.76.19.126/32', '76.76.19.127/32', '76.76.19.128/32',
  '76.76.19.129/32', '76.76.19.130/32', '76.76.19.131/32', '76.76.19.132/32', '76.76.19.133/32',
  '76.76.19.134/32', '76.76.19.135/32', '76.76.19.136/32', '76.76.19.137/32', '76.76.19.138/32',
  '76.76.19.139/32', '76.76.19.140/32', '76.76.19.141/32', '76.76.19.142/32', '76.76.19.143/32',
  '76.76.19.144/32', '76.76.19.145/32', '76.76.19.146/32', '76.76.19.147/32', '76.76.19.148/32',
  '76.76.19.149/32', '76.76.19.150/32', '76.76.19.151/32', '76.76.19.152/32', '76.76.19.153/32',
  '76.76.19.154/32', '76.76.19.155/32', '76.76.19.156/32', '76.76.19.157/32', '76.76.19.158/32',
  '76.76.19.159/32', '76.76.19.160/32', '76.76.19.161/32', '76.76.19.162/32', '76.76.19.163/32',
  '76.76.19.164/32', '76.76.19.165/32', '76.76.19.166/32', '76.76.19.167/32', '76.76.19.168/32',
  '76.76.19.169/32', '76.76.19.170/32', '76.76.19.171/32', '76.76.19.172/32', '76.76.19.173/32',
  '76.76.19.174/32', '76.76.19.175/32', '76.76.19.176/32', '76.76.19.177/32', '76.76.19.178/32',
  '76.76.19.179/32', '76.76.19.180/32', '76.76.19.181/32', '76.76.19.182/32', '76.76.19.183/32',
  '76.76.19.184/32', '76.76.19.185/32', '76.76.19.186/32', '76.76.19.187/32', '76.76.19.188/32',
  '76.76.19.189/32', '76.76.19.190/32', '76.76.19.191/32', '76.76.19.192/32', '76.76.19.193/32',
  '76.76.19.194/32', '76.76.19.195/32', '76.76.19.196/32', '76.76.19.197/32', '76.76.19.198/32',
  '76.76.19.199/32', '76.76.19.200/32', '76.76.19.201/32', '76.76.19.202/32', '76.76.19.203/32',
  '76.76.19.204/32', '76.76.19.205/32', '76.76.19.206/32', '76.76.19.207/32', '76.76.19.208/32',
  '76.76.19.209/32', '76.76.19.210/32', '76.76.19.211/32', '76.76.19.212/32', '76.76.19.213/32',
  '76.76.19.214/32', '76.76.19.215/32', '76.76.19.216/32', '76.76.19.217/32', '76.76.19.218/32',
  '76.76.19.219/32', '76.76.19.220/32', '76.76.19.221/32', '76.76.19.222/32', '76.76.19.223/32',
  '76.76.19.224/32', '76.76.19.225/32', '76.76.19.226/32', '76.76.19.227/32', '76.76.19.228/32',
  '76.76.19.229/32', '76.76.19.230/32', '76.76.19.231/32', '76.76.19.232/32', '76.76.19.233/32',
  '76.76.19.234/32', '76.76.19.235/32', '76.76.19.236/32', '76.76.19.237/32', '76.76.19.238/32',
  '76.76.19.239/32', '76.76.19.240/32', '76.76.19.241/32', '76.76.19.242/32', '76.76.19.243/32',
  '76.76.19.244/32', '76.76.19.245/32', '76.76.19.246/32', '76.76.19.247/32', '76.76.19.248/32',
  '76.76.19.249/32', '76.76.19.250/32', '76.76.19.251/32', '76.76.19.252/32', '76.76.19.253/32',
  '76.76.19.254/32', '76.76.19.255/32'
];

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function addIPsToMongoDBAtlas() {
  console.log('🚀 MongoDB Atlas Bulk IP Addition Tool\n');
  console.log('=' .repeat(60));
  
  // Get configuration from user
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  console.log('📋 You need the following information:');
  console.log('1. MongoDB Atlas Public API Key');
  console.log('2. MongoDB Atlas Private API Key');
  console.log('3. MongoDB Atlas Project ID');
  console.log('4. MongoDB Atlas Organization ID\n');
  
  console.log('🔗 Get these from: https://cloud.mongodb.com/account/access-keys\n');
  
  const publicKey = await question('Enter your MongoDB Atlas Public API Key: ');
  const privateKey = await question('Enter your MongoDB Atlas Private API Key: ');
  const projectId = await question('Enter your MongoDB Atlas Project ID: ');
  const orgId = await question('Enter your MongoDB Atlas Organization ID: ');
  
  rl.close();
  
  console.log('\n🔍 Adding IPs to MongoDB Atlas...\n');
  
  // Create entries for each IP
  const entries = VERCEL_IP_RANGES.map(ip => ({
    ipAddress: ip,
    comment: 'Vercel Edge Network'
  }));
  
  const options = {
    hostname: 'cloud.mongodb.com',
    port: 443,
    path: `/api/atlas/v1.0/orgs/${orgId}/projects/${projectId}/accessList`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${publicKey}:${privateKey}`).toString('base64')}`
    }
  };
  
  try {
    const response = await makeRequest(options, { entries });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Successfully added all Vercel IPs to MongoDB Atlas!');
      console.log(`📊 Added ${VERCEL_IP_RANGES.length} IP addresses`);
      console.log('\n🎉 Your MongoDB Atlas should now accept connections from Vercel!');
    } else {
      console.log('❌ Failed to add IPs');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Error occurred:', error.message);
    console.log('\n💡 Alternative: Use the manual method below');
  }
}

// Show manual method if API method fails
function showManualMethod() {
  console.log('\n📝 MANUAL BULK ADDITION METHOD:\n');
  console.log('1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com/');
  console.log('2. Select your cluster');
  console.log('3. Click "Network Access" in the left sidebar');
  console.log('4. Click "Add IP Address"');
  console.log('5. Choose "Add IP Address"');
  console.log('6. Use the "Add IP Address" form multiple times in one session');
  console.log('7. Copy and paste IPs from the list below:\n');
  
  VERCEL_IP_RANGES.forEach((ip, index) => {
    console.log(`${String(index + 1).padStart(3)}. ${ip}`);
  });
  
  console.log('\n💡 TIP: You can copy multiple IPs and paste them one by one quickly');
  console.log('💡 TIP: Use browser developer tools to automate the form submission');
}

// Main execution
async function main() {
  try {
    await addIPsToMongoDBAtlas();
  } catch (error) {
    console.log('❌ API method failed, showing manual method...');
    showManualMethod();
  }
}

// Run the script
main(); 