# Production Setup Guide

## Payment System Production Configuration

### 1. Environment Variables

Update your production environment variables:

```env
# QPay Production Configuration
QPAY_USERNAME=your_qpay_username
QPAY_PASSWORD=your_qpay_password
QPAY_INVOICE_CODE=your_invoice_code
QPAY_CALLBACK_URL=https://yourdomain.com/api/qpay-callback

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com
```

### 2. QPay Callback URL

**IMPORTANT**: Update `QPAY_CALLBACK_URL` to your production domain:

```env
QPAY_CALLBACK_URL=https://yourdomain.com/api/qpay-callback
```

### 3. SSL Certificate

Ensure your production server has a valid SSL certificate:
- Required for QPay callbacks
- Required for secure payment processing
- Required for user trust

### 4. Database Setup

#### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas cluster
2. Add your production server IP to the whitelist
3. Create a database user with read/write permissions
4. Update `MONGODB_URI` with your connection string

#### Local MongoDB (Alternative)
1. Install MongoDB on your production server
2. Configure authentication
3. Set up regular backups

### 5. Payment Flow in Production

#### How it works:
1. **User clicks "Purchase"** → Creates QPay invoice
2. **QR code generated** → User scans with QPay app
3. **Payment completed** → QPay sends callback to your server
4. **Payment verified** → User gets access to content
5. **Purchase recorded** → Stored in database

#### Callback Process:
```
QPay App → Payment Complete → Callback to your server → Payment stored → User access granted
```

### 6. Monitoring & Logs

#### Enable Payment Logging:
- All payment attempts are logged
- Failed payments are tracked
- Callback failures are monitored

#### Key Logs to Monitor:
- `/api/qpay-callback` - Payment callbacks
- `/api/purchase` - Purchase attempts
- `/api/qpay/payment/check` - Payment verification

### 7. Error Handling

#### Common Issues:
- **Callback not received**: Check QPAY_CALLBACK_URL
- **Payment not found**: Check database connection
- **Purchase failed**: Check user authentication

#### Fallback Mechanisms:
- Payment status polling (every 10 seconds)
- Manual payment verification
- Database consistency checks

### 8. Security Considerations

#### Production Security:
- ✅ SSL/TLS encryption
- ✅ Secure database connections
- ✅ Environment variable protection
- ✅ Input validation
- ✅ Rate limiting (recommended)

#### QPay Security:
- ✅ Secure API credentials
- ✅ Callback URL validation
- ✅ Payment amount verification
- ✅ Transaction logging

### 9. Testing Production

#### Before Going Live:
1. **Test with small amounts** (1-10 MNT)
2. **Verify callbacks work** with your production domain
3. **Test purchase flow** end-to-end
4. **Check database storage** of payments
5. **Verify user access** after payment

#### Test Commands:
```bash
# Test callback endpoint
curl -X POST https://yourdomain.com/api/qpay-callback \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "test-123", "payment_status": "PAID", "payment_amount": 10, "object_id": "test-invoice"}'

# Test payment check
curl -X POST https://yourdomain.com/api/qpay/payment/check \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "test-invoice"}'
```

### 10. Deployment Checklist

- [ ] Environment variables configured
- [ ] QPAY_CALLBACK_URL updated to production domain
- [ ] SSL certificate installed
- [ ] Database connection tested
- [ ] Payment flow tested with small amounts
- [ ] Error monitoring set up
- [ ] Backup strategy implemented
- [ ] Performance monitoring enabled

### 11. Support & Troubleshooting

#### If Payments Don't Work:
1. Check server logs for errors
2. Verify QPAY_CALLBACK_URL is correct
3. Test database connectivity
4. Check QPay API credentials
5. Verify SSL certificate is valid

#### Contact Support:
- QPay API issues: Contact QPay support
- Application issues: Check server logs
- Database issues: Check MongoDB connection

---

## Quick Start for Production

1. **Deploy your app** to production server
2. **Update environment variables** with production values
3. **Test payment flow** with small amounts
4. **Monitor logs** for any issues
5. **Go live** with confidence!

The payment system is now production-ready and optimized for real-world use. 🚀 