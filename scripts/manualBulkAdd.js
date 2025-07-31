#!/usr/bin/env node

/**
 * Manual bulk addition method for Vercel IPs to MongoDB Atlas
 * This provides the simplest approach for adding IPs manually
 */

const fs = require('fs');

// Vercel IP ranges
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

function main() {
  console.log('🚀 Manual Bulk IP Addition for MongoDB Atlas\n');
  console.log('=' .repeat(60));
  
  console.log('\n📋 STEP-BY-STEP INSTRUCTIONS:\n');
  
  console.log('1️⃣  Go to MongoDB Atlas Dashboard:');
  console.log('   https://cloud.mongodb.com/');
  
  console.log('\n2️⃣  Select your cluster from the dashboard');
  
  console.log('\n3️⃣  In the left sidebar, click "Network Access"');
  
  console.log('\n4️⃣  Click "Add IP Address" button');
  
  console.log('\n5️⃣  Choose "Add IP Address" (NOT "Allow Access from Anywhere")');
  
  console.log('\n6️⃣  Copy and paste the IPs below one by one:\n');
  
  // Create a simple list for easy copying
  console.log('📋 COPY-PASTE LIST (one per line):\n');
  VERCEL_IP_RANGES.forEach((ip, index) => {
    console.log(ip);
  });
  
  console.log('\n💡 QUICK TIPS:\n');
  console.log('• Copy the entire list above');
  console.log('• Paste into a text editor to see all IPs clearly');
  console.log('• Copy one IP at a time and paste into MongoDB Atlas');
  console.log('• Use Ctrl+V (or Cmd+V on Mac) to paste quickly');
  console.log('• You can do this in about 5-10 minutes');
  
  console.log('\n🔄 ALTERNATIVE: QUICK DEVELOPMENT SETUP\n');
  console.log('If you want to test quickly, you can:');
  console.log('1. Click "Add IP Address"');
  console.log('2. Choose "Allow Access from Anywhere" (0.0.0.0/0)');
  console.log('3. This allows all IPs (less secure but easier)');
  
  console.log('\n📄 BROWSER AUTOMATION (Advanced)\n');
  console.log('If you want to automate this process:');
  console.log('1. Open browser developer tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Run the JavaScript code provided in the next section');
  
  // Create browser automation script
  createBrowserAutomationScript();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Manual method ready! Follow the steps above.');
}

function createBrowserAutomationScript() {
  const automationScript = `
// Browser Automation Script for MongoDB Atlas
// Run this in the browser console on the MongoDB Atlas Network Access page

const ips = [
  ${VERCEL_IP_RANGES.map(ip => `'${ip}'`).join(',\n  ')}
];

let currentIndex = 0;

function addNextIP() {
  if (currentIndex >= ips.length) {
    console.log('✅ All IPs added!');
    return;
  }
  
  const ip = ips[currentIndex];
  console.log(\`Adding IP \${currentIndex + 1}/\${ips.length}: \${ip}\`);
  
  // Find the IP input field
  const ipInput = document.querySelector('input[placeholder*="IP"], input[name*="ip"], input[type="text"]');
  if (ipInput) {
    ipInput.value = ip;
    ipInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Find and click the Add button
    const addButton = document.querySelector('button[type="submit"], button:contains("Add"), button:contains("Confirm")');
    if (addButton) {
      addButton.click();
      
      // Wait a bit and add the next IP
      setTimeout(() => {
        currentIndex++;
        addNextIP();
      }, 2000);
    }
  }
}

// Start the automation
addNextIP();
`;

  fs.writeFileSync('browser-automation.js', automationScript);
  console.log('\n📜 Browser automation script created: browser-automation.js');
  console.log('💡 Copy the contents of that file and paste in browser console');
}

main(); 