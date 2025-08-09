## Testing

### Manual Test Matrix

- Auth
  - Credentials sign in with email and with phone
  - Session access to `/api/profile/me`
- Admin
  - Non-admin redirect; admin sees dashboard
- Payments
  - Create invoice (public and internal routes)
  - Receive callback and persist `Payment`
  - Poll status and complete purchase

### Automation Ideas

- API smoke tests for auth, profile, courses, tests endpoints
- Simulated QPay callback POSTs in CI against ephemeral MongoDB


