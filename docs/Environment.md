## Environment Variables

Never commit real secrets. Use a `.env.local` for local development and Vercel project env for deployments.

### Core

- NODE_ENV: runtime environment
- NEXTAUTH_URL: public URL for NextAuth callbacks
- AUTH_SECRET or NEXTAUTH_SECRET: NextAuth encryption/CSRF
- MONGODB_URI: MongoDB connection string

### Authentication

- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET: Optional Google OAuth provider

### Email

- SENDGRID_API_KEY, SENDGRID_FROM_EMAIL: Required to send emails via `lib/sendEmail.ts`

### SMS (optional)

- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

### QPay (Test/General)

- QPAY_BASE_URL: e.g., `https://merchant.qpay.mn/v2`
- QPAY_CLIENT_ID
- QPAY_CLIENT_SECRET
- QPAY_INVOICE_CODE: invoice code used for generic/test payments
- QPAY_CALLBACK_URL: public callback endpoint (e.g., `https://<domain>/api/qpay-callback`)

### QPay (Course-Specific)

- QPAY_COURSE_CLIENT_ID
- QPAY_COURSE_CLIENT_SECRET
- QPAY_COURSE_INVOICE_CODE
- QPAY_COURSE_BASE_URL (optional; defaults to `merchant.qpay.mn/v2`)
- QPAY_COURSE_CALLBACK_URL (optional; routes often derive from NEXTAUTH_URL)

### Notes

- Some routes accept both general and course variants and determine usage by `invoice_code`.
- Debug routes exist to validate configuration (see `Troubleshooting.md`).


