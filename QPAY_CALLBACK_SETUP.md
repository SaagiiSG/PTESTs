# QPay Callback URL Setup Guide

## The Issue
You need to configure the callback URL in the **QPay Merchant Portal** at [https://merchant.qpay.mn/v2](https://merchant.qpay.mn/v2), not just in your environment variables.

## Step-by-Step Setup

### 1. Access QPay Merchant Portal
- Go to: [https://merchant.qpay.mn/v2](https://merchant.qpay.mn/v2)
- Login with your QPay merchant credentials

### 2. Configure Callback URL
1. **Navigate to Settings/Configuration** in the merchant portal
2. **Find "Callback URL" or "Webhook URL" settings**
3. **Set the callback URL to your production domain:**
   ```
   https://yourdomain.com/api/qpay-callback
   ```

### 3. For Development (Localhost)
Since QPay cannot reach localhost, you have these options:

#### Option A: Use ngrok (Temporary)
1. **Sign up for ngrok**: [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. **Get your authtoken** from the dashboard
3. **Install authtoken**:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
4. **Start ngrok tunnel**:
   ```bash
   ngrok http 3000
   ```
5. **Use the ngrok URL** as your callback:
   ```
   https://your-ngrok-url.ngrok.io/api/qpay-callback
   ```

#### Option B: Use Development Buttons (Current Solution)
- Use the yellow "✅ Simulate Payment Completion" buttons
- These simulate the QPay callback for development
- No need to configure callbacks for localhost

### 4. Environment Variables
Update your `.env.local` file:

```env
# For Development (with ngrok)
QPAY_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/qpay-callback

# For Production
QPAY_CALLBACK_URL=https://yourdomain.com/api/qpay-callback
```

### 5. Test the Callback
1. **Make a test payment** with a small amount (1-10 MNT)
2. **Complete the payment** in your QPay app
3. **Check your server logs** for the callback
4. **Verify payment status** in your frontend

## Current Status
✅ **Development buttons working** - Use yellow "Simulate Payment Completion" buttons  
✅ **Manual verification working** - Payment storage and retrieval working  
❌ **QPay callbacks not reaching localhost** - Need ngrok or production deployment  

## Quick Fix for Now
Use the development buttons I added:
1. **Go to your payment page**
2. **Click "✅ Simulate Payment Completion"**
3. **Payment will be marked as successful**

## For Production Deployment
1. **Deploy your app** to a public server (Vercel, Netlify, etc.)
2. **Set callback URL** in QPay merchant portal to your production domain
3. **Update environment variables** with production URL
4. **Test with small amounts** before going live

## QPay Merchant Portal Features
Based on the [QPay Merchant Portal](https://merchant.qpay.mn/v2), you should be able to:
- Configure callback URLs
- View transaction history
- Manage payment settings
- Monitor payment status
- Configure webhook endpoints

---

**Next Steps:**
1. Login to [https://merchant.qpay.mn/v2](https://merchant.qpay.mn/v2)
2. Configure your callback URL
3. Test with the development buttons for now
4. Deploy to production when ready 