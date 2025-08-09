## Reflections and Lessons Learned

### What worked well
- Next.js App Router and server components simplified API co-location and auth checks.
- NextAuth 5 callbacks gave tight control over session shape (`id`, `phoneNumber`, `isAdmin`).
- QPay integration with a dedicated service wrapper (`lib/qpay-service.ts`) improved testability and logging.

### What was tricky
- Balancing credentials and Google providers while keeping session state consistent.
- Ensuring QPay callbacks are reliable across environments and that invoice codes map to the correct flow (test vs course).
- Mongo connections on serverless platforms—connection reuse and timeouts needed careful tuning (`lib/mongodb.ts`).

### What I’d improve next
- Add end‑to‑end tests for payment lifecycles with mocked callbacks.
- Centralize env validation at boot to fail fast with actionable errors.
- Implement rate limiting and audit logging for auth and payment endpoints.
- Expand i18n coverage and extract translation keys for all admin views.

### Closing thought
Shipping a learning + payments platform requires aligning auth, models, and external gateways with clear logs and reliable fallbacks. The codebase now reflects those principles with room to deepen automation and observability.


