# QPay Payment System Implementation

This project implements a complete QPay payment gateway integration based on the [QPay API documentation](https://developer.qpay.mn/).

## Features

- ✅ QR Code Generation for payments
- ✅ Real-time payment status checking
- ✅ Payment callback handling
- ✅ Payment management dashboard
- ✅ Refund functionality
- ✅ Payment history and reporting
- ✅ Modern, responsive UI
- ✅ TypeScript support
- ✅ Error handling and validation

## Prerequisites

1. **QPay Merchant Account**: You need to register as a merchant with QPay
2. **API Credentials**: Get your `client_id` and `client_secret` from QPay
3. **Invoice Code**: Obtain your invoice code from QPay
4. **Callback URL**: A publicly accessible URL for payment notifications

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# QPay Configuration
QPAY_CLIENT_ID=your_client_id_here
QPAY_CLIENT_SECRET=your_client_secret_here
QPAY_BASE_URL=https://merchant-sandbox.qpay.mn/v2
QPAY_INVOICE_CODE=your_invoice_code_here
QPAY_CALLBACK_URL=https://yourdomain.com/api/qpay-callback

# Optional QPay Settings
QPAY_BRANCH_CODE=your_branch_code
QPAY_STAFF_CODE=your_staff_code
QPAY_TERMINAL_CODE=your_terminal_code

# Public Merchant ID (for admin dashboard)
NEXT_PUBLIC_MERCHANT_ID=your_merchant_id
```

## API Endpoints

### 1. Create Invoice
```http
POST /api/create-invoice
```

**Request Body:**
```json
{
  "amount": 1000,
  "description": "Payment for services",
  "receiverCode": "CUSTOMER_ID",
  "invoiceCode": "OPTIONAL_INVOICE_CODE"
}
```

**Response:**
```json
{
  "success": true,
  "invoice_id": "invoice_id",
  "qr_image": "base64_encoded_qr_image",
  "qr_text": "qr_code_text",
  "deeplink": "qpay://payment_url",
  "web_url": "https://web_payment_url",
  "deeplink_url": "https://deeplink_url"
}
```

### 2. Check Payment Status
```http
POST /api/qpay/payment/check
```

**Request Body:**
```json
{
  "payment_id": "payment_id_here"
}
```

### 3. Get Payment List
```http
POST /api/qpay/payment/list
```

**Request Body:**
```json
{
  "object_type": "MERCHANT",
  "object_id": "merchant_id",
  "page_number": 1,
  "page_limit": 20
}
```

### 4. Refund Payment
```http
POST /api/qpay/payment/refund
```

**Request Body:**
```json
{
  "payment_id": "payment_id_here",
  "callback_url": "optional_callback_url",
  "note": "Refund reason"
}
```

### 5. Payment Callback
```http
POST /api/qpay-callback
```

This endpoint receives payment notifications from QPay and automatically processes them.

## Components

### QPayPayment Component

A reusable React component for payment processing:

```tsx
import QPayPayment from '@/components/QPayPayment';

<QPayPayment
  amount={1000}
  description="Payment for services"
  receiverCode="CUSTOMER_ID"
  onSuccess={(paymentData) => {
    // Handle successful payment
    console.log('Payment successful:', paymentData);
  }}
  onError={(error) => {
    // Handle payment error
    console.error('Payment failed:', error);
  }}
/>
```

## Pages

### 1. Payment Page (`/pay`)
- Main payment interface
- QR code generation
- Real-time payment status
- Mobile app integration

### 2. Admin Dashboard (`/admin/payments`)
- Payment management interface
- Payment history
- Search and filtering
- Export functionality
- Refund management

## Usage Examples

### Basic Payment Flow

1. **Generate QR Code:**
```tsx
const response = await fetch('/api/create-invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1000,
    description: 'Test payment',
    receiverCode: 'CUSTOMER_123'
  })
});

const data = await response.json();
// Display QR code: data.qr_image
```

2. **Check Payment Status:**
```tsx
const checkResponse = await fetch('/api/qpay/payment/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_id: 'payment_id_here'
  })
});

const paymentData = await checkResponse.json();
// paymentData.payment.payment_status will be 'PAID', 'FAILED', etc.
```

### Integration with Database

You can integrate the payment system with your database by updating the callback handler:

```tsx
// In app/api/qpay-callback/route.ts
async function handleSuccessfulPayment(paymentData: any) {
  // Update your database
  await updatePaymentStatus(paymentData.object_id, 'PAID', paymentData);
  
  // Send confirmation email
  await sendPaymentConfirmationEmail(paymentData);
  
  // Update user subscription
  await updateUserSubscription(paymentData.object_id);
}
```

## QPay Service

The `lib/qpay.ts` file contains a comprehensive service class that handles:

- Authentication and token management
- All QPay API operations
- Error handling
- Type safety with TypeScript interfaces

## Security Considerations

1. **Environment Variables**: Never commit API credentials to version control
2. **Callback Verification**: Always verify payment status with QPay API
3. **HTTPS**: Use HTTPS in production for all API calls
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Testing

### Sandbox Environment
- Use QPay sandbox URLs for testing
- Test with small amounts
- Verify callback handling

### Production Checklist
- [ ] Update to production QPay URLs
- [ ] Configure proper callback URLs
- [ ] Test payment flow end-to-end
- [ ] Verify error handling
- [ ] Set up monitoring and logging

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check `QPAY_CLIENT_ID` and `QPAY_CLIENT_SECRET`
   - Verify API credentials with QPay

2. **QR Code Not Generated**
   - Check `QPAY_INVOICE_CODE`
   - Verify amount format (must be number)
   - Check receiver code format

3. **Callback Not Received**
   - Verify `QPAY_CALLBACK_URL` is publicly accessible
   - Check server logs for errors
   - Ensure callback endpoint returns 200 status

4. **Payment Status Not Updated**
   - Check payment checking interval
   - Verify payment ID format
   - Check network connectivity

## Support

For QPay API support, contact:
- Email: info@qpay.mn
- Documentation: https://developer.qpay.mn/

## License

This implementation is provided as-is for educational and development purposes. Please ensure compliance with QPay's terms of service and your local regulations. 