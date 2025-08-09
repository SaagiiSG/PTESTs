## Admin Portal

### Access Control
- Enforced in `app/admin/layout.tsx` via `auth()`; redirects non-admin users to `/home`.

### Navigation & Styling
- Sidebar navigation from `components/AdminSidebarNav.tsx`.
- Includes a home link and a `LogoutButton` consistent with the site’s styling, matching other pages’ look and feel per project convention.

### Pages
- `/admin` – Dashboard with stats and quick actions
- `/admin/users` – User management with filters and views
- `/admin/courses` – Course listing and creation modal
- `/admin/tests` – Test listing and creation modal
- `/admin/analytics` – Simple analytics panel

### Patterns
- Use `AdminPageWrapper` for consistent spacing and loading visuals.
- Consume server APIs from client components with graceful error handling and toasts.


