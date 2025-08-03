# How to Get Real QPay Credentials

## 🚨 Current Problem
Your current QPay credentials are placeholders:
- `QPAY_CLIENT_ID`: "PSYCHOMETRICS" (this might be real, need to confirm)
- `QPAY_CLIENT_SECRET`: "SET" (this is NOT real - it's a placeholder)
- `QPAY_BASE_URL`: Incorrect URL

## 🔧 Steps to Get Real QPay Credentials

### Step 1: Contact QPay Mongolia
**Call or email QPay Mongolia:**
- **Phone:** +976 7000 1111
- **Email:** info@qpay.mn
- **Website:** https://qpay.mn

### Step 2: Request Merchant Account
Tell them you need:
1. **Merchant Account** for your business
2. **API Access** for online payments
3. **API Credentials** (Client ID and Client Secret)

### Step 3: What You'll Get
QPay will provide you with:
- **Real Client ID** (like `qpay_merchant_123456` or similar)
- **Real Client Secret** (a long string like `sk_live_abc123def456...`)
- **Merchant Code** (like `JAVZAN_B` - you already have this)
- **API Documentation**

### Step 4: Update Vercel Environment Variables
Once you get the real credentials, update in Vercel:

```
QPAY_CLIENT_ID=your_real_client_id_from_qpay
QPAY_CLIENT_SECRET=your_real_client_secret_from_qpay
QPAY_BASE_URL=https://merchant.qpay.mn/v2
```

## 🎯 What to Ask QPay Support

**Say this to QPay:**
> "Hi, I need to set up QPay payments for my online course platform. I need:
> 1. A merchant account for online payments
> 2. API credentials (Client ID and Client Secret) 
> 3. Documentation for integrating QPay API
> 
> My business is: [Your Business Name]
> Website: https://setgelsudlal-git-main-saagiisgs-projects.vercel.app
> 
> Can you help me set this up?"

## ⚠️ Important Notes
- **"SET" is NOT a real secret** - it's just a placeholder
- **You need real credentials** from QPay to process payments
- **Test with small amounts** first once you get real credentials
- **Keep credentials secure** - never share them publicly

## 🔍 How to Verify Real Credentials
Once you get real credentials:
1. **Test the environment:** `/api/test-env`
2. **Look for real values** (not "SET" or "PSYCHOMETRICS")
3. **Test QPay authentication:** `/api/test-qpay`
4. **Try a small payment** (like 100₮) to test

## 📞 Alternative Contact Methods
- **QPay Facebook:** https://facebook.com/qpaymn
- **QPay Instagram:** @qpaymn
- **Visit QPay office** in Ulaanbaatar

**The system is ready for real QPay - you just need the real credentials from QPay Mongolia!** 🚀 