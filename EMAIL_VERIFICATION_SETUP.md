# Email Verification & Password Reset Setup Guide

This guide explains how to set up and use the email verification and password reset functionality in your application.

## Features Implemented

### 1. Email Verification for Signup
- Users receive a verification email when they sign up with an email address
- Email contains a secure verification link that expires in 24 hours
- Users must verify their email before they can fully access the application
- Resend verification email functionality

### 2. Password Reset via Email
- Users can request a password reset by entering their email address
- Secure reset link sent via email that expires in 1 hour
- Users can set a new password using the reset link
- Security measures to prevent email enumeration

## Setup Requirements

### 1. SendGrid Configuration
Make sure you have:
- SendGrid API key configured
- Verified sender email address
- Environment variables set up

### 2. Environment Variables
Add these to your `.env` file or `sendgrid.env`:
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
NEXTAUTH_URL=your_app_url
```

## Testing the Setup

### 1. Test Email Templates
Run the test script to verify templates work:
```bash
node scripts/testEmailVerification.js
```

This will:
- ✅ Test email verification template creation
- ✅ Test password reset template creation
- ✅ Check environment variables are set
- 📧 Show template HTML and text lengths

### 2. Test Email Sending (Web Interface)
Visit `/test-email` in your browser to test actual email sending:
- Enter your email address
- Click "Send Test Email"
- Check your inbox for the test verification email

### 3. Test Email Sending (API)
You can also test via API:
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

## API Endpoints

### Email Verification
- `POST /api/auth/request-email-verification` - Request email verification
- `POST /api/auth/verify-email` - Verify email with token

### Password Reset
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Registration (Updated)
- `POST /api/auth/register` - Now includes email verification

### Testing
- `POST /api/test-email` - Send test verification email

## Frontend Pages

### Email Verification
- `/verify-email` - Email verification page
- Handles verification tokens from email links
- Shows pending state for new registrations
- Resend verification functionality

### Password Reset
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token

### Testing
- `/test-email` - Test email functionality

## User Flow

### Signup Flow
1. User fills out signup form with email
2. Account is created with `isEmailVerified: false`
3. Verification email is sent automatically
4. User is redirected to `/verify-email?pending=true`
5. User clicks verification link in email
6. Email is verified and user can log in

### Password Reset Flow
1. User clicks "Forgot Password" on login page
2. User enters email address on `/forgot-password`
3. Reset email is sent (if account exists)
4. User clicks reset link in email
5. User sets new password on `/reset-password`
6. User can log in with new password

## Security Features

### Email Verification
- Secure random tokens (32 bytes hex)
- 24-hour expiration
- One-time use tokens
- Rate limiting (implemented in API)

### Password Reset
- Secure random tokens (32 bytes hex)
- 1-hour expiration for security
- One-time use tokens
- No email enumeration (same response for existing/non-existing emails)

## Email Templates

### Verification Email
- Professional HTML template with branding
- Clear call-to-action button
- Fallback text version
- Mobile-responsive design

### Password Reset Email
- Security-focused design
- Clear instructions
- Expiration warning
- Professional branding

## Manual Testing Checklist

### 1. Template Testing
- [ ] Run `node scripts/testEmailVerification.js`
- [ ] Verify templates are created successfully
- [ ] Check environment variables are set

### 2. Email Sending Testing
- [ ] Visit `/test-email` in browser
- [ ] Enter your email address
- [ ] Send test email
- [ ] Check inbox for test email
- [ ] Verify email content and styling

### 3. Signup Flow Testing
- [ ] Go to `/sign-up`
- [ ] Fill out form with email
- [ ] Submit registration
- [ ] Check for verification email
- [ ] Click verification link
- [ ] Verify email is marked as verified

### 4. Password Reset Testing
- [ ] Go to `/login`
- [ ] Click "Forgot Password"
- [ ] Enter email address
- [ ] Check for reset email
- [ ] Click reset link
- [ ] Set new password
- [ ] Verify can log in with new password

## Database Schema Updates

The User model has been updated with new fields:
```javascript
{
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

## Error Handling

### Common Issues
- **Email not received**: Check spam folder, verify sender email
- **Token expired**: Request new verification/reset email
- **Invalid token**: Check URL format, request new email
- **SendGrid errors**: Check API key and sender verification

### Error Messages
- User-friendly error messages
- Security-conscious responses
- Detailed logging for debugging

## Production Considerations

### Environment Variables
- Set `NEXTAUTH_URL` to your production domain
- Use production SendGrid API key
- Verify sender email in SendGrid dashboard

### Monitoring
- Monitor email delivery rates
- Track verification completion rates
- Set up alerts for failed emails

### Security
- Use HTTPS in production
- Implement rate limiting
- Monitor for abuse patterns
- Regular security audits

## Troubleshooting

### Email Not Sending
1. Check SendGrid API key
2. Verify sender email is confirmed
3. Check SendGrid dashboard for errors
4. Review application logs

### Verification Not Working
1. Check token format in URL
2. Verify token hasn't expired
3. Check database for token existence
4. Review API endpoint logs

### Password Reset Issues
1. Verify email exists in database
2. Check token expiration
3. Ensure new password meets requirements
4. Review reset endpoint logs

### Test Script Issues
1. Ensure `sendgrid.env` file exists
2. Check environment variables are loaded
3. Verify Node.js version compatibility
4. Check file permissions

## Support

For issues or questions:
1. Check application logs
2. Verify environment variables
3. Test with the provided test script
4. Use the `/test-email` page for live testing
5. Review SendGrid dashboard for delivery issues 