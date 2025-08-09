## API Endpoints (selected)

Auth
- POST `/api/auth/register` – create user, send verification email/SMS (where configured)
- POST `/api/auth/login` – legacy JWT cookie login (coexists with NextAuth)
- All NextAuth handlers mounted via `auth.ts` (`/api/auth/[...nextauth]`)
- POST `/api/auth/request-password-reset`, `/reset-password`, `/verify-email`, etc.

Profile
- GET `/api/profile/me` – session-aware user profile
- POST `/api/profile/update` – update profile fields
- GET `/api/profile/purchase-history` – list purchases

Catalog
- GET/POST `/api/courses` – list/create course (POST requires admin)
- GET `/api/courses/[courseId]` – course detail
- GET `/api/tests` – list tests (redacts embedCode)
- GET `/api/protected-tests` – fully protected listing

Payments
- POST `/api/public/create-invoice` – create invoice (public)
- POST `/api/create-invoice` – create invoice (internal/test util with fallbacks)
- POST `/api/qpay-callback` – general/test callback
- POST `/api/qpay-course-callback` – course callback
- POST `/api/public/payment/check` – check payment status

Utilities/Debug
- GET `/api/public/status` – health check
- GET `/api/test-auth-config` – verify NextAuth configuration
- GET `/api/debug-session` – introspect session
- Multiple `test-*` and `debug-*` routes for QPay and env inspection

Each route follows Next.js App Router conventions with server code in `app/api/**/route.ts`.


