## Project Overview

This repository contains a full‑stack learning and assessment platform built on Next.js 15 (App Router) with:

- Authentication via NextAuth 5 (credentials + Google)
- MongoDB + Mongoose for persistence
- Payment integration with QPay (test and course flows)
- An admin portal for managing users, courses, tests, and analytics
- A bilingual UI scaffold (EN/MN), theming, and a modern component library

### Core Domains

- Auth and Identity: Account creation, email/phone verification, secure sign‑in, session management.
- Catalog: Courses and Tests with metadata, pricing, and content.
- Commerce: QPay invoice creation, callbacks, and payment reconciliation.
- Profiles: User profile enrichment and history.
- Admin: Dashboard, user management, content creation, analytics.

### Tech Stack

- Runtime: Next.js 15, React 19
- Auth: next-auth 5 (beta)
- DB: MongoDB via Mongoose 8
- Payments: QPay REST APIs
- Email/SMS: SendGrid, Twilio (optional/configurable)
- UI: Tailwind CSS 4, shadcn‑style components in `components/ui/*`

### High-Level Flow

1) User signs in (email or phone) → session created by NextAuth → protected pages and API routes use `auth()`
2) User purchases a course/test → invoice created with QPay → QR/code returned
3) QPay sends callbacks to our API → we persist status in `Payment` and memory cache → UI polls/checks status

See `Architecture.md` for diagrams and deeper details, and `Payments-QPay.md` for flow specifics.


