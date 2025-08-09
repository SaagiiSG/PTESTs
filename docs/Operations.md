## Operations

### Deployment
- Recommended: Vercel. Configure environment variables in Project Settings.
- Ensure MongoDB allowlisting as needed (CSV provided).

### Observability
- Use API health checks: `/api/public/status`, `/api/test-auth-config`, `/api/debug-session`.
- Payment verification: `/api/test-qpay*`, `/api/debug-qpay-public`.

### Backups & Data
- Use MongoDB Atlas backups for production clusters.
- Keep a retention policy for `Payment` records matching finance requirements.

### Rate Limiting & Abuse
- Consider adding middleware and per-route throttling for public endpoints.


