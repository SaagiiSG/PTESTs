# QPay Real Credentials Setup Guide

## 🚨 Current Issue
Your QPay credentials are currently set to placeholder values:
- `QPAY_CLIENT_ID`: "PSYCHOMETRICS" (placeholder)
- `QPAY_CLIENT_SECRET`: "SET" (placeholder)
- `QPAY_BASE_URL`: Incorrect URL

## 🔧 How to Fix

### Step 1: Get Real QPay Credentials
1. **Contact QPay Support** or your QPay merchant account manager
2. **Request API credentials** for your merchant account
3. **You need:**
   - Real Client ID (usually a long string like `qpay_merchant_123456`)
   - Real Client Secret (usually a very long string like `sk_live_abc123def456...`)
   - Correct Base URL (should be `https://merchant.qpay.mn/v2`)

### Step 2: Update Vercel Environment Variables
1. **Go to your Vercel dashboard**
2. **Navigate to your project settings**
3. **Go to Environment Variables section**
4. **Update these variables:**

```
QPAY_CLIENT_ID=your_real_client_id_here
QPAY_CLIENT_SECRET=your_real_client_secret_here
QPAY_BASE_URL=https://merchant.qpay.mn/v2
```

### Step 3: Verify the Setup
After updating, the system will:
- ✅ Use real QPay invoices instead of test invoices
- ✅ Use actual course prices (10,000₮ for 10,000₮ courses)
- ✅ Generate real QR codes for payments
- ✅ Process real payments through QPay

## 🎯 Expected Results
- **Real invoice IDs** like `INV_123456789` instead of `TEST_INV_...`
- **Actual course prices** instead of fallback 1000₮
- **Real QR codes** that work with QPay app
- **Real payment processing**

## 🔍 How to Check if It's Working
1. **Test the environment:** Visit `/api/test-env`
2. **Look for real credentials** (not "PSYCHOMETRICS" or "SET")
3. **Try purchasing a course** - should show real invoice ID
4. **QR code should be real** QPay QR code

## 📞 Need Help?
If you don't have QPay credentials yet:
1. **Contact QPay Mongolia** for merchant account setup
2. **Request API access** for your business
3. **Get proper credentials** from their support team

## ⚠️ Important Notes
- **Never share your real credentials** publicly
- **Keep credentials secure** in Vercel environment variables
- **Test with small amounts** first
- **Monitor payment logs** for any issues 