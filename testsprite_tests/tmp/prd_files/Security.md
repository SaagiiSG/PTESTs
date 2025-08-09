## Security

### Secrets
- Never commit `.env*` files or real credentials.
- Set `AUTH_SECRET`/`NEXTAUTH_SECRET` in all environments.

### Authentication
- Passwords stored with bcrypt; always verify strength and hashing rounds.
- Session cookies are httpOnly and managed by NextAuth.

### Payments
- Use HTTPS callback URLs in production; validate payloads as QPay supports.
- Avoid logging sensitive data; mask secrets in debug endpoints (already done in most routes).

### PII
- Be mindful of profile fields (DOB, gender, education, family). Apply access controls and retention policies.

### Supply Chain
- Keep dependencies updated; pin versions in `package.json` and monitor advisories.


