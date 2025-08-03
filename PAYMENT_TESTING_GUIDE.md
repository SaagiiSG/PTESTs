# Payment Testing Guide

## The Problem
QPay cannot send callbacks to localhost (localhost is not accessible from the internet). This means when you complete a payment in your QPay app, the callback never reaches your local development server.

## Solutions

### Option 1: Use the Development Button (Recommended)

#### For Course Payments:
1. **Go to a course page** in your app
2. **Click "Purchase Course"**
3. **You'll be redirected to the payment page** with QR code
4. **Click the "✅ Simulate Payment Completion" button** (yellow development section)
5. **Your frontend will show "Payment Successful"**

#### For Test Payments:
1. **Generate a QR code** in your app
2. **Click the "✅ Simulate Payment Completion" button** in your frontend
3. **Your frontend will show "Payment Successful"**

### Option 2: Use the Script
```bash
# After generating a QR code, copy the invoice ID from your frontend
# Then run:
node scripts/test-manual-verification.js YOUR_INVOICE_ID AMOUNT

# Example:
node scripts/test-manual-verification.js f5cfdc70-ba75-461c-b81d-08fedb1c25f6 1000
```

### Option 3: Manual API Call
```bash
curl -X POST http://localhost:3000/api/qpay-callback \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "manual-payment-123",
    "payment_status": "PAID",
    "payment_amount": 1000,
    "payment_date": "2025-07-31T07:20:00Z",
    "object_id": "YOUR_INVOICE_ID"
  }'
```

## Current Status
✅ **Payment system is working correctly**  
✅ **Payment storage is working**  
✅ **Payment retrieval is working**  
✅ **Purchase API is working**  

## For Production
When you deploy to production:
1. **Deploy your app** to a public server (Vercel, Netlify, etc.)
2. **Update `QPAY_CALLBACK_URL`** in your environment variables to your public domain
3. **QPay will automatically send callbacks** to your production server

## Testing Your Current Payment
Your payment `f5cfdc70-ba75-461c-b81d-08fedb1c25f6` is already verified and stored. Go back to your frontend and check - it should show "Payment Successful"!

## Quick Fix for Current Issue
If you're still seeing "Payment not found" in your frontend:

1. **Go to your payment page** in the browser
2. **Look for the yellow "🧪 Development Mode" section**
3. **Click the "✅ Simulate Payment Completion" button**
4. **Your payment will be marked as successful immediately**

This simulates the QPay callback that can't reach localhost during development. 