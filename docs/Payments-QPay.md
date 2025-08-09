## Payments (QPay)

### Components

- `lib/qpay-service.ts`: Access token, invoice creation, payment check, with verbose logging
- `app/api/create-invoice/route.ts`: General invoice creator with receiver code fallbacks
- `app/api/public/create-invoice/route.ts`: Public invoice creation (supports test vs course detection)
- `app/api/qpay-callback/route.ts`: General/test callback handler
- `app/api/qpay-course-callback/route.ts`: Course callback handler
- `lib/payment-storage.ts`: Upsert `Payment` model and in‑memory cache

### Flow

1) Client requests invoice via API → QPay returns invoice id/qr/urls
2) Client shows QR/code to user
3) QPay sends callback to our server (must be publicly reachable)
4) Server stores payment status (`Payment` and memory cache)
5) Client polls via a check endpoint or retrieves payment data

### Invoice Fields

- `invoice_code`: selected by config (test vs course variants)
- `sender_invoice_no`: unique per request
- `invoice_receiver_code`: fallback list supported in `create-invoice`
- `callback_url`: must point to our callback (env-driven)

### Callback Payload (subset)

- `payment_id`, `payment_status` (NEW/PAID/FAILED/REFUNDED), `payment_amount`, `payment_date`, `object_id` (invoice id)

### Persistence

- `Payment` schema indexes by `object_id` and `payment_id` for fast lookup
- Cache ensures quick reads even if DB is momentarily unavailable

### Debug/Validation

- `/api/test-qpay*`, `/api/debug-qpay-public`, `/api/test-credentials` to inspect env and connectivity

### Security

- Ensure callback URLs use HTTPS in production
- Do not log full secrets; prefer masked logging already present in debug routes
- Validate `invoice_code` and origin if QPay provides signatures/whitelists


