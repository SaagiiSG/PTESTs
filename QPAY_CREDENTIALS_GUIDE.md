# 🔧 QPay Credentials Fix Guide

## 🚨 **Current Issue:**
Your QPay authentication is failing because the credentials are incorrect.

## 🔍 **Current Credentials (WRONG):**
- `QPAY_CLIENT_ID`: "SYCHOMETRICS" 
- `QPAY_CLIENT_SECRET`: (incorrect value)

## ✅ **How to Fix:**

### **Step 1: Get Correct QPay Credentials**

1. **Log into QPay Merchant Portal:**
   - Go to: https://merchant.qpay.mn
   - Login with your merchant account

2. **Navigate to API Settings:**
   - Look for "API Settings" or "Developer Settings"
   - Or "Integration" or "API Credentials"

3. **Get Your Credentials:**
   - **Client ID** (usually a string like "MERCHANT_12345")
   - **Client Secret** (a long secret key)
   - **Merchant Code** (like "JAVZAN_B")

### **Step 2: Update Vercel Environment Variables**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `ptest`

2. **Go to Settings → Environment Variables**

3. **Update these variables:**
   ```
   QPAY_CLIENT_ID = [your actual QPay client ID]
   QPAY_CLIENT_SECRET = [your actual QPay client secret]
   QPAY_BASE_URL = https://merchant.qpay.mn/v2
   ```

4. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

### **Step 3: Test the Fix**

1. **Test Authentication:**
   ```bash
   curl https://your-domain.vercel.app/api/debug-qpay
   ```

2. **Test Payment Flow:**
   - Go to your website
   - Try to purchase a course
   - Should create real QPay invoices

## 🔧 **Alternative: Use Test Mode**

If you don't have QPay credentials yet, the system will automatically use test mode:

- ✅ Payment flow will work
- ✅ QR codes will be generated (test ones)
- ✅ You can test the entire purchase process
- ❌ No real payments will be processed

## 🆘 **Need Help?**

If you can't find your QPay credentials:

1. **Contact QPay Support:**
   - Email: support@qpay.mn
   - Phone: Check their website

2. **Check QPay Documentation:**
   - Look for "API Integration Guide"
   - Or "Merchant Setup Guide"

## 🎯 **Expected Result:**

After fixing credentials, you should see:
```json
{
  "success": true,
  "message": "QPay authentication successful",
  "accessToken": "***",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

Instead of:
```json
{
  "error": "NO_CREDENTIALS",
  "message": "NO_CREDENTIALS"
}
``` 