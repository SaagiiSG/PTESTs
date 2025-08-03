# Payment System Setup Guide

## Issue Identified
The payment system is failing because QPay credentials are not properly configured. The error "Нэхэмжлэлийн код буруу" (Invoice code is wrong) indicates that either:
1. QPay credentials are not set up correctly
2. The invoice code format is not acceptable to QPay
3. The QPay service is not properly configured

## Quick Fix Steps

### 1. Set Up Environment Variables
Create a `.env.local` file in your project root with the following content:

```bash
# QPay Configuration
QPAY_CLIENT_ID=JAVZAN_B
QPAY_CLIENT_SECRET=fGJp4FEz
QPAY_BASE_URL=https://merchant.qpay.mn/v2
QPAY_CALLBACK_URL=http://localhost:3000/api/qpay-callback

# For production, use:
# QPAY_CALLBACK_URL=https://yourdomain.com/api/qpay-callback
```

### 2. Test the Payment System
1. Start your development server: `npm run dev`
2. Go to `/test-payment` to test the payment system
3. Click "Test QPay Connection" to verify credentials
4. Click "Test Payment Flow" to test the full payment process

### 3. Debug Payment Issues
If you're still getting errors:

1. **Check the browser console** for detailed error messages
2. **Check the server logs** for API errors
3. **Verify QPay credentials** are correct
4. **Test with different invoice codes** if needed

## Changes Made

### Fixed Issues:
1. **Invoice Code Format**: Simplified the invoice code generation to avoid special characters
2. **Environment Variables**: Updated QPay service to require proper environment variables
3. **Error Handling**: Improved error messages and debugging information
4. **Test Page**: Created `/test-payment` page for easy testing

### Files Modified:
- `lib/qpay.ts` - Updated to use environment variables properly
- `app/api/create-invoice/route.ts` - Simplified invoice code format
- `components/PaymentOptionsModal.tsx` - Simplified invoice code generation
- `app/api/test-qpay-simple/route.ts` - Improved test endpoint
- `app/test-payment/page.tsx` - New test page for debugging
- `app/course/page.tsx` - Added test payment link

## Next Steps

1. **Set up environment variables** as shown above
2. **Test the payment system** using the test page
3. **Check for any remaining errors** and fix them
4. **Verify the payment flow** works end-to-end

## Common Issues and Solutions

### Issue: "QPay credentials not configured"
**Solution**: Make sure you have a `.env.local` file with the correct QPay credentials

### Issue: "Invoice code is wrong"
**Solution**: The invoice code format has been simplified. If still failing, try using only numbers

### Issue: "Authentication failed"
**Solution**: Verify your QPay credentials are correct and the account is active

### Issue: "Network error"
**Solution**: Check your internet connection and QPay service availability

## Testing the Payment Flow

1. Go to any course page
2. Click "Enroll Now" 
3. Select QPay as payment method
4. Complete the payment process
5. Verify the course is unlocked after payment

If you encounter any issues, use the test page at `/test-payment` to debug the problem. 