# QPay Credentials Fix Guide

## 🚨 **Critical Issue Found**

Your QPay integration is failing because:

1. **QPAY_CLIENT_SECRET is set to "SET"** (placeholder value)
2. **Code export issue** (fixed in latest commit)

## 🔍 **Current Status**

From the debug output:
```
QPAY_CLIENT_ID: SYCHOMETRICS
QPAY_CLIENT_SECRET: SET  ← This is the problem!
QPAY_BASE_URL: https://merchant.qpay.mn/v2
QPAY_INVOICE_CODE: SYCHOMETRICS_INVOICE
```

## 🔧 **How to Fix**

### **Step 1: Update QPay Credentials in Vercel**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `setgelsudlal-git-main-saagiisgs-projects`
3. **Go to Settings → Environment Variables**
4. **Find QPAY_CLIENT_SECRET**
5. **Change the value from "SET" to your actual QPay client secret**

### **Step 2: Verify All QPay Environment Variables**

Make sure these are set correctly in Vercel:

```
QPAY_CLIENT_ID=SYCHOMETRICS
QPAY_CLIENT_SECRET=your_actual_secret_here  ← NOT "SET"
QPAY_BASE_URL=https://merchant.qpay.mn/v2
QPAY_INVOICE_CODE=SYCHOMETRICS_INVOICE
QPAY_CALLBACK_URL=https://setgelsudlal-git-main-saagiisgs-projects.vercel.app/api/qpay-callback
```

### **Step 3: Redeploy After Changes**

After updating the environment variables:
1. **Go to Deployments tab**
2. **Click "Redeploy"** on your latest deployment
3. **Or push a new commit** to trigger automatic deployment

## 🧪 **Test the Fix**

After updating credentials and redeploying, run:

```bash
node scripts/testQPayCredentials.js
```

You should see:
- ✅ QPAY_CLIENT_SECRET: *** (not "SET")
- ✅ QPay authentication successful
- ✅ Invoice creation successful

## 🆘 **If You Don't Have Real QPay Credentials**

### **Option 1: Use Sandbox (Recommended for Testing)**

1. **Get sandbox credentials** from QPay
2. **Update environment variables**:
   ```
   QPAY_BASE_URL=https://merchant-sandbox.qpay.mn/v2
   QPAY_CLIENT_ID=your_sandbox_client_id
   QPAY_CLIENT_SECRET=your_sandbox_client_secret
   ```

### **Option 2: Create a Test Mode**

I can help you create a test mode that bypasses QPay for development.

### **Option 3: Contact QPay Support**

If you need real QPay credentials, contact QPay merchant support.

## 🔍 **What's Fixed in the Code**

1. ✅ **Fixed QPay service export** - No more "getAccessToken is not a function"
2. ✅ **Added authentication test endpoint** - `/api/test-qpay`
3. ✅ **Improved error handling** - Better error messages
4. ✅ **Updated imports** - Using correct service methods

## 📋 **Next Steps**

1. **Update QPAY_CLIENT_SECRET in Vercel** (most important)
2. **Redeploy your application**
3. **Test QPay authentication**
4. **Try purchasing a course**

## 🎯 **Expected Results After Fix**

- ✅ QPay authentication works
- ✅ Invoice creation successful
- ✅ QR codes generate properly
- ✅ Payment flow works end-to-end

---

**The main issue is that your QPAY_CLIENT_SECRET is set to "SET" instead of a real secret. Once you fix this in Vercel, everything will work!** 