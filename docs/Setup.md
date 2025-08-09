## Local Setup

1) Prerequisites
- Node 20+
- MongoDB Atlas or local MongoDB
- QPay sandbox credentials (optional for payment dev)

2) Install
```bash
npm install
```

3) Environment
Create `.env.local` with at least:
```
MONGODB_URI=...
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
QPAY_BASE_URL=https://merchant.qpay.mn/v2
QPAY_CLIENT_ID=...
QPAY_CLIENT_SECRET=...
QPAY_INVOICE_CODE=...
QPAY_CALLBACK_URL=http://localhost:3000/api/qpay-callback
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
```

4) Run
```bash
npm run dev
```

5) Seed/Test
- Create an admin user via existing scripts or directly in MongoDB (`isAdmin: true`).
- Optionally configure Google OAuth for SSO.

6) QPay Testing
- Use `/api/test-qpay*`, `/api/debug-qpay-public`, and `/api/public/create-invoice` to validate credentials and flow.

## Deployment (Vercel)

1) Connect the GitHub repo to Vercel.
2) Add environment variables in Vercel Project Settings.
3) Ensure MongoDB IP allowlist includes Vercel egress IPs if applicable (see `vercel-ips-for-mongodb.csv`).
4) Deploy; verify with `/api/public/status`, `/api/test-auth-config`, and payment test routes.


