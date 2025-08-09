## Authentication (NextAuth 5)

### Providers

- Credentials: email or phoneNumber + password (bcrypt compare)
- Google: optional if `GOOGLE_CLIENT_ID/SECRET` set

Defined in `lib/auth.ts`. Custom `authorize` supports login by email OR phone.

### Callbacks

- `signIn`: Logging and provider-specific checks
- `jwt`: enriches token with `id`, `phoneNumber`, `isAdmin`
- `session`: fetches fresh user by `id`/`phoneNumber`/`email`, ensures latest `isAdmin`

### Session Usage

- Server: call `auth()` in route handlers and server components to access session
- Admin Gate: `app/admin/layout.tsx` redirects if `!user?.isAdmin`

### Login UI

- `app/login/page.tsx` supports identifier autodetection (email vs phone), clears storage/cookies, and uses `signIn('credentials', ...)`.

### Profile APIs

- `/api/profile/me` returns profile fields (name, email, phone, demographics, admin flag, purchases)

### Security Notes

- Always set `AUTH_SECRET` (or `NEXTAUTH_SECRET`) in production
- Clear any legacy JWT cookie flows not needed alongside NextAuth


