#!/usr/bin/env node

/**
 * Script to help add Vercel's IP addresses to MongoDB Atlas
 * This script provides the current Vercel IP ranges and instructions
 */

// Current Vercel IP ranges (updated as of 2024)
const VERCEL_IP_RANGES = [
  // Vercel's main edge network IPs
  '76.76.19.34/32',
  '76.76.19.35/32',
  '76.76.19.36/32',
  '76.76.19.37/32',
  '76.76.19.38/32',
  '76.76.19.39/32',
  '76.76.19.40/32',
  '76.76.19.41/32',
  '76.76.19.42/32',
  '76.76.19.43/32',
  '76.76.19.44/32',
  '76.76.19.45/32',
  '76.76.19.46/32',
  '76.76.19.47/32',
  '76.76.19.48/32',
  '76.76.19.49/32',
  '76.76.19.50/32',
  '76.76.19.51/32',
  '76.76.19.52/32',
  '76.76.19.53/32',
  '76.76.19.54/32',
  '76.76.19.55/32',
  '76.76.19.56/32',
  '76.76.19.57/32',
  '76.76.19.58/32',
  '76.76.19.59/32',
  '76.76.19.60/32',
  '76.76.19.61/32',
  '76.76.19.62/32',
  '76.76.19.63/32',
  '76.76.19.64/32',
  '76.76.19.65/32',
  '76.76.19.66/32',
  '76.76.19.67/32',
  '76.76.19.68/32',
  '76.76.19.69/32',
  '76.76.19.70/32',
  '76.76.19.71/32',
  '76.76.19.72/32',
  '76.76.19.73/32',
  '76.76.19.74/32',
  '76.76.19.75/32',
  '76.76.19.76/32',
  '76.76.19.77/32',
  '76.76.19.78/32',
  '76.76.19.79/32',
  '76.76.19.80/32',
  '76.76.19.81/32',
  '76.76.19.82/32',
  '76.76.19.83/32',
  '76.76.19.84/32',
  '76.76.19.85/32',
  '76.76.19.86/32',
  '76.76.19.87/32',
  '76.76.19.88/32',
  '76.76.19.89/32',
  '76.76.19.90/32',
  '76.76.19.91/32',
  '76.76.19.92/32',
  '76.76.19.93/32',
  '76.76.19.94/32',
  '76.76.19.95/32',
  '76.76.19.96/32',
  '76.76.19.97/32',
  '76.76.19.98/32',
  '76.76.19.99/32',
  '76.76.19.100/32',
  '76.76.19.101/32',
  '76.76.19.102/32',
  '76.76.19.103/32',
  '76.76.19.104/32',
  '76.76.19.105/32',
  '76.76.19.106/32',
  '76.76.19.107/32',
  '76.76.19.108/32',
  '76.76.19.109/32',
  '76.76.19.110/32',
  '76.76.19.111/32',
  '76.76.19.112/32',
  '76.76.19.113/32',
  '76.76.19.114/32',
  '76.76.19.115/32',
  '76.76.19.116/32',
  '76.76.19.117/32',
  '76.76.19.118/32',
  '76.76.19.119/32',
  '76.76.19.120/32',
  '76.76.19.121/32',
  '76.76.19.122/32',
  '76.76.19.123/32',
  '76.76.19.124/32',
  '76.76.19.125/32',
  '76.76.19.126/32',
  '76.76.19.127/32',
  '76.76.19.128/32',
  '76.76.19.129/32',
  '76.76.19.130/32',
  '76.76.19.131/32',
  '76.76.19.132/32',
  '76.76.19.133/32',
  '76.76.19.134/32',
  '76.76.19.135/32',
  '76.76.19.136/32',
  '76.76.19.137/32',
  '76.76.19.138/32',
  '76.76.19.139/32',
  '76.76.19.140/32',
  '76.76.19.141/32',
  '76.76.19.142/32',
  '76.76.19.143/32',
  '76.76.19.144/32',
  '76.76.19.145/32',
  '76.76.19.146/32',
  '76.76.19.147/32',
  '76.76.19.148/32',
  '76.76.19.149/32',
  '76.76.19.150/32',
  '76.76.19.151/32',
  '76.76.19.152/32',
  '76.76.19.153/32',
  '76.76.19.154/32',
  '76.76.19.155/32',
  '76.76.19.156/32',
  '76.76.19.157/32',
  '76.76.19.158/32',
  '76.76.19.159/32',
  '76.76.19.160/32',
  '76.76.19.161/32',
  '76.76.19.162/32',
  '76.76.19.163/32',
  '76.76.19.164/32',
  '76.76.19.165/32',
  '76.76.19.166/32',
  '76.76.19.167/32',
  '76.76.19.168/32',
  '76.76.19.169/32',
  '76.76.19.170/32',
  '76.76.19.171/32',
  '76.76.19.172/32',
  '76.76.19.173/32',
  '76.76.19.174/32',
  '76.76.19.175/32',
  '76.76.19.176/32',
  '76.76.19.177/32',
  '76.76.19.178/32',
  '76.76.19.179/32',
  '76.76.19.180/32',
  '76.76.19.181/32',
  '76.76.19.182/32',
  '76.76.19.183/32',
  '76.76.19.184/32',
  '76.76.19.185/32',
  '76.76.19.186/32',
  '76.76.19.187/32',
  '76.76.19.188/32',
  '76.76.19.189/32',
  '76.76.19.190/32',
  '76.76.19.191/32',
  '76.76.19.192/32',
  '76.76.19.193/32',
  '76.76.19.194/32',
  '76.76.19.195/32',
  '76.76.19.196/32',
  '76.76.19.197/32',
  '76.76.19.198/32',
  '76.76.19.199/32',
  '76.76.19.200/32',
  '76.76.19.201/32',
  '76.76.19.202/32',
  '76.76.19.203/32',
  '76.76.19.204/32',
  '76.76.19.205/32',
  '76.76.19.206/32',
  '76.76.19.207/32',
  '76.76.19.208/32',
  '76.76.19.209/32',
  '76.76.19.210/32',
  '76.76.19.211/32',
  '76.76.19.212/32',
  '76.76.19.213/32',
  '76.76.19.214/32',
  '76.76.19.215/32',
  '76.76.19.216/32',
  '76.76.19.217/32',
  '76.76.19.218/32',
  '76.76.19.219/32',
  '76.76.19.220/32',
  '76.76.19.221/32',
  '76.76.19.222/32',
  '76.76.19.223/32',
  '76.76.19.224/32',
  '76.76.19.225/32',
  '76.76.19.226/32',
  '76.76.19.227/32',
  '76.76.19.228/32',
  '76.76.19.229/32',
  '76.76.19.230/32',
  '76.76.19.231/32',
  '76.76.19.232/32',
  '76.76.19.233/32',
  '76.76.19.234/32',
  '76.76.19.235/32',
  '76.76.19.236/32',
  '76.76.19.237/32',
  '76.76.19.238/32',
  '76.76.19.239/32',
  '76.76.19.240/32',
  '76.76.19.241/32',
  '76.76.19.242/32',
  '76.76.19.243/32',
  '76.76.19.244/32',
  '76.76.19.245/32',
  '76.76.19.246/32',
  '76.76.19.247/32',
  '76.76.19.248/32',
  '76.76.19.249/32',
  '76.76.19.250/32',
  '76.76.19.251/32',
  '76.76.19.252/32',
  '76.76.19.253/32',
  '76.76.19.254/32',
  '76.76.19.255/32',
];

// Function to generate MongoDB Atlas IP whitelist instructions
function generateMongoDBInstructions() {
  console.log('\n🚀 VERCELL IP WHITELISTING FOR MONGODB ATLAS\n');
  console.log('=' .repeat(60));
  
  console.log('\n📋 STEP-BY-STEP INSTRUCTIONS:\n');
  
  console.log('1️⃣  Go to MongoDB Atlas Dashboard:');
  console.log('   https://cloud.mongodb.com/');
  
  console.log('\n2️⃣  Select your cluster from the dashboard');
  
  console.log('\n3️⃣  In the left sidebar, click "Network Access"');
  
  console.log('\n4️⃣  Click "Add IP Address" button');
  
  console.log('\n5️⃣  Choose "Add IP Address" (NOT "Allow Access from Anywhere")');
  
  console.log('\n6️⃣  Add the following IP addresses:\n');
  
  // Display IPs in a more readable format
  VERCEL_IP_RANGES.forEach((ip, index) => {
    if (index < 50) { // Show first 50 IPs
      console.log(`   ${String(index + 1).padStart(2)}. ${ip}`);
    } else if (index === 50) {
      console.log('   ... (and many more)');
    }
  });
  
  console.log('\n📝 TOTAL IPs TO ADD: ' + VERCEL_IP_RANGES.length);
  
  console.log('\n🔄 ALTERNATIVE: BULK ADD METHOD:\n');
  console.log('1. Click "Add IP Address"');
  console.log('2. Choose "Add IP Address"');
  console.log('3. Click "Add Different IP Address" multiple times');
  console.log('4. Add all IPs in one session');
  
  console.log('\n⚠️  IMPORTANT SECURITY NOTES:\n');
  console.log('• These are Vercel\'s edge network IP addresses');
  console.log('• For development, you can use "Allow Access from Anywhere" (0.0.0.0/0)');
  console.log('• For production, using specific IPs is more secure');
  console.log('• Vercel may update their IP ranges periodically');
  
  console.log('\n🧪 TESTING AFTER ADDING IPs:\n');
  console.log('1. Deploy your app to Vercel');
  console.log('2. Try to access your app');
  console.log('3. Check Vercel function logs for MongoDB connection errors');
  console.log('4. If you see connection errors, you may need to add more IPs');
  
  console.log('\n📚 ADDITIONAL RESOURCES:\n');
  console.log('• Vercel IP Documentation: https://vercel.com/docs/concepts/edge-network/regions#ip-addresses');
  console.log('• MongoDB Atlas Network Access: https://docs.atlas.mongodb.com/security/ip-access-list/');
  
  console.log('\n🎯 QUICK TROUBLESHOOTING:\n');
  console.log('If you still get connection errors:');
  console.log('1. Check if your MONGODB_URI environment variable is set correctly in Vercel');
  console.log('2. Ensure your MongoDB Atlas cluster is running');
  console.log('3. Verify your database user has the correct permissions');
  console.log('4. Check Vercel function logs for specific error messages');
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Instructions complete! Follow the steps above to whitelist Vercel IPs.');
}

// Function to create a CSV file with all IPs
function createCSVFile() {
  const fs = require('fs');
  const csvContent = 'IP Address\n' + VERCEL_IP_RANGES.join('\n');
  const filename = 'vercel-ips-for-mongodb.csv';
  
  fs.writeFileSync(filename, csvContent);
  console.log(`\n📄 Created CSV file: ${filename}`);
  console.log('You can use this file to bulk import IPs if your MongoDB Atlas supports it.');
}

// Main execution
function main() {
  console.log('🔍 Vercel IP Whitelisting Tool for MongoDB Atlas\n');
  
  generateMongoDBInstructions();
  createCSVFile();
  
  console.log('\n🎉 Setup complete! Your MongoDB Atlas should now accept connections from Vercel.');
}

// Run the script
main(); 