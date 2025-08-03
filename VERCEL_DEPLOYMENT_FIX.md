# Vercel Deployment Fix Guide

## Problem
Your Vercel deployment is returning 401 (Unauthorized) errors for all routes, including static files like `manifest.json` and `favicon.ico`.

## Root Cause
The 401 errors are likely caused by:
1. Missing environment variables in Vercel
2. Authentication middleware being too restrictive
3. Vercel authentication settings blocking access

## Solution Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel dashboard → Project Settings → Environment Variables and add these:

#### Required Variables:
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_random_secret_key_32_chars
MONGODB_URI=your_mongodb_connection_string
```

#### Optional Variables (if using these features):
```
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_from_email@domain.com

# QPay
QPAY_USERNAME=your_qpay_username
QPAY_PASSWORD=your_qpay_password
QPAY_INVOICE_CODE=your_invoice_code
QPAY_ENDPOINT=https://merchant.qpay.mn/v2

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 2. Generate Required Secrets

#### NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### ENCRYPTION_KEY:
```bash
openssl rand -hex 16
```

### 3. Check Vercel Authentication Settings

1. Go to your Vercel dashboard
2. Navigate to Project Settings → Authentication
3. If "Vercel Authentication" is enabled, either:
   - Disable it, OR
   - Configure it properly with your domain

### 4. Redeploy After Changes

After setting environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on your latest deployment
3. Or push a new commit to trigger automatic deployment

### 5. Test the Fix

Run the test script:
```bash
node scripts/testDeployment.js https://your-domain.vercel.app
```

## Expected Results

After fixing:
- ✅ `manifest.json` should return 200
- ✅ `favicon.ico` should return 200  
- ✅ Main page should return 200
- ✅ API routes should return 200 or 401 (if authentication required)

## Troubleshooting

### If still getting 401 errors:

1. **Check Vercel Function Logs**:
   - Go to Vercel dashboard → Functions
   - Check for any middleware errors

2. **Verify Environment Variables**:
   - Ensure all variables are set correctly
   - Check for typos in variable names

3. **Test Locally**:
   ```bash
   npm run build
   npm start
   ```

4. **Check MongoDB Connection**:
   - Ensure MongoDB URI is correct
   - Check if MongoDB allows connections from Vercel IPs

### If external scripts are still blocked:

The Content Security Policy in `app/layout.tsx` should handle this, but you can temporarily disable it for testing:

```tsx
// Comment out this line temporarily:
// <meta httpEquiv="Content-Security-Policy" content="..." />
```

## Next Steps

1. Set the environment variables in Vercel
2. Redeploy the application
3. Test using the provided script
4. Check browser console for any remaining errors
5. Test authentication flow
6. Verify embedded content loads properly

## Support

If issues persist:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test with a minimal deployment first
4. Contact Vercel support if needed 