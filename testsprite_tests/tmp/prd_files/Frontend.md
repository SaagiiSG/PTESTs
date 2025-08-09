## Frontend

### App Router
- Pages live under `app/` with server and client components.
- Loading states via `loading.tsx` and route‑level layouts.

### Key Areas
- `/home` – main landing after login
- `/Course/[courseId]` – course detail and lessons
- `/Tests` – tests catalog and related pages
- `/profile/*` – profile, history, settings
- `/admin/*` – admin portal (see Admin.md)

### Internationalization & Theming
- `lib/language.tsx` provides a minimal EN/MN translation context.
- `next-themes` for dark/light themes.

### UI Components
- `components/ui/*` primitives
- Higher-level components: `PaymentOptionsModal`, `QPayPayment`, `TestsListWithSearch`, etc.


