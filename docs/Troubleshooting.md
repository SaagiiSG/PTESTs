## Troubleshooting

### Auth Issues
- 401 on protected routes: confirm `AUTH_SECRET` and `NEXTAUTH_URL` set; check session cookies.
- Google login fails: verify OAuth client and redirect URIs in Google console.

### MongoDB
- Connection errors on Vercel: allowlist egress IPs; verify `MONGODB_URI` and SRV DNS resolution.

### QPay
- Auth error creating invoices: validate `QPAY_CLIENT_ID/SECRET` and base URL; confirm clock sync.
- Callbacks not arriving: verify public callback URL, ensure HTTPS, inspect Vercel function logs.
- Status stuck as NEW: check callback upsert, examine `Payment` collection for the `object_id`.

### Debug Routes
- `/api/test-auth-config` – validates NextAuth wiring
- `/api/debug-qpay-public` – logs QPay envs (masked)
- `/api/test-credentials` – dumps QPay related config (masked)


