# QPay Course-Specific Setup Guide

This guide explains how to set up separate QPay credentials specifically for course purchases, allowing you to use different payment accounts for tests and courses.

## Overview

The system now supports two separate QPay configurations:
1. **General QPay** - Used for test purchases and other payments
2. **Course QPay** - Used specifically for course purchases

## Current Configuration

### General QPay (for tests)
- **Client ID**: `PSYCHOMETRICS`
- **Client Secret**: `iIxpGxUu`
- **Invoice Code**: `PSYCHOMETRICS_INVOICE`
- **Base URL**: `https://merchant.qpay.mn/v2`

### Course QPay (for courses)
- **Client ID**: `PSYCHOMETRICS_COURSE` (placeholder)
- **Client Secret**: `your_course_secret_here` (placeholder)
- **Invoice Code**: `PSYCHOMETRICS_COURSE_INVOICE`
- **Base URL**: `https://merchant.qpay.mn/v2`

## Setup Instructions

### 1. Get Course-Specific QPay Credentials

Contact QPay to request separate credentials for course payments:

**Email**: info@qpay.mn
**Subject**: Request for Course-Specific QPay Credentials

**Request Template**:
```
Subject: Request for Course-Specific QPay Credentials

Dear QPay Team,

We currently have QPay credentials for our main business (PSYCHOMETRICS).
We would like to request separate QPay credentials specifically for course payments.

Current Account: PSYCHOMETRICS
Requested New Account: PSYCHOMETRICS_COURSE (or similar)

Purpose: Separate payment tracking for course purchases vs test purchases

Please provide:
1. Client ID for course payments
2. Client Secret for course payments
3. Invoice Code for course payments

Thank you,
[Your Name]
```

### 2. Update Environment Variables

Once you receive the course-specific credentials, update your `.env.local` file:

```bash
# QPay Course Configuration
QPAY_COURSE_CLIENT_ID=your_course_client_id_here
QPAY_COURSE_CLIENT_SECRET=your_course_client_secret_here
QPAY_COURSE_BASE_URL=https://merchant.qpay.mn/v2
QPAY_COURSE_INVOICE_CODE=your_course_invoice_code_here
```

### 3. Test the Configuration

Run the course-specific test script:

```bash
node scripts/test-qpay-course.js
```

This will verify that:
- Course credentials are properly configured
- Authentication works
- Invoice creation works
- Payment checking works

### 4. Verify the Setup

The system will automatically:
- Use course-specific QPay for course purchases
- Use general QPay for test purchases
- Route callbacks to appropriate handlers
- Store payment data with service type indicators

## API Endpoints

### Course-Specific Endpoints

1. **Invoice Creation**: `/api/public/create-course-invoice`
2. **Payment Check**: `/api/public/payment/course-check`
3. **Callback Handler**: `/api/qpay-course-callback`

### General Endpoints (for tests)

1. **Invoice Creation**: `/api/public/create-invoice`
2. **Payment Check**: `/api/public/payment/check`
3. **Callback Handler**: `/api/qpay-callback`

## How It Works

### For Course Purchases
1. User selects a course for purchase
2. System calls `/api/public/create-course-invoice`
3. Uses `QPAY_COURSE_CLIENT_ID` and `QPAY_COURSE_CLIENT_SECRET`
4. Creates invoice with course-specific invoice code
5. Callback goes to `/api/qpay-course-callback`
6. Payment data stored with `service_type: 'course'`

### For Test Purchases
1. User selects a test for purchase
2. System calls `/api/public/create-invoice`
3. Uses `QPAY_CLIENT_ID` and `QPAY_CLIENT_SECRET`
4. Creates invoice with general invoice code
5. Callback goes to `/api/qpay-callback`
6. Payment data stored with general service type

## Benefits

1. **Separate Tracking**: Course and test payments are tracked separately
2. **Different Accounts**: Can use different QPay merchant accounts
3. **Independent Management**: Each service can be managed independently
4. **Clear Reporting**: Easy to generate separate reports for courses vs tests
5. **Risk Management**: Isolate payment issues between services

## Troubleshooting

### Common Issues

1. **"Course credentials not configured"**
   - Check that `QPAY_COURSE_CLIENT_ID` and `QPAY_COURSE_CLIENT_SECRET` are set in `.env.local`

2. **"Course authentication failed"**
   - Verify the course credentials with QPay
   - Check that the credentials are for the correct environment (production/sandbox)

3. **"Course invoice creation failed"**
   - Ensure the course invoice code is valid
   - Check that the course account is activated with QPay

### Testing

Run these tests to verify everything works:

```bash
# Test general QPay (for tests)
node scripts/test-qpay-direct.js

# Test course QPay (for courses)
node scripts/test-qpay-course.js
```

## Deployment

When deploying to production:

1. Update the callback URLs in your environment variables
2. Ensure both sets of credentials are configured
3. Test both payment flows in production
4. Monitor the logs for any issues

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify credentials with QPay support
3. Test with the provided test scripts
4. Contact the development team for assistance 