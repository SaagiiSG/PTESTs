## Psychometrics Platform (Next.js 15)

A modern learning and assessment platform with seamless auth, fast payments, and an opinionated admin experience – built on Next.js 15, NextAuth 5, MongoDB, and QPay.

### Overview

This app lets learners discover courses/tests, purchase securely via QPay, and track progress – while admins manage catalog and users from a refined portal.

- **Core domains**: Auth & Identity, Catalog (Courses/Tests), Commerce (Invoices/Callbacks), Profiles, Admin
- **Stack**: Next.js 15 (App Router), React 19, NextAuth 5, MongoDB/Mongoose, Tailwind CSS 4, shadcn‑style UI, SendGrid/Twilio (opt-in)
- **Payment flow**: Create invoice → display QR/code → receive QPay callback → persist to `Payment` and cache → UI polls status

### My role and impact

- **Ownership**: End‑to‑end architecture, from App Router layout to API contracts and data models
- **Auth**: Unified email/phone credentials + optional Google; session shape tuned for admin gating
- **Payments**: Hardened QPay integration (service wrapper, verbose logs, receiver‑code fallback, clear callbacks)
- **Admin**: Task‑first UX with consistent styling, home link, and logout for parity with public pages
- **Reliability**: Mongo connection tuning for serverless, debug routes for auth/payment visibility, safer env handling

### What I learned

- **NextAuth 5**: Powerful callback model to centralize user lookups and session enrichment
- **Payments in practice**: Callback reliability and invoice_code routing (test vs course) matter more than happy paths
- **Serverless DB**: Connection reuse, timeouts, and error surfaces need deliberate configuration
- **DX/Operability**: Good debug endpoints and structured logs speed up everything – from QA to prod hotfixes

### Documentation

Start with these docs in `docs/`:

- [Overview](docs/Overview.md)
- [Architecture](docs/Architecture.md)
- [Environment](docs/Environment.md)
- [Setup](docs/Setup.md)
- [Authentication](docs/Authentication.md)
- [Payments (QPay)](docs/Payments-QPay.md)
- [API Endpoints](docs/API-Endpoints.md)
- [Data Models](docs/Data-Models.md)
- [Admin](docs/Admin.md)
- [Frontend](docs/Frontend.md)
- [Operations](docs/Operations.md)
- [Troubleshooting](docs/Troubleshooting.md)
- [Scripts](docs/Scripts.md)
- [Security](docs/Security.md)
- [Testing](docs/Testing.md)
- [Reflections](docs/Reflections.md)

### Highlights

- **Next.js 15 App Router** with server/client boundaries that keep data close to routes
- **NextAuth 5** credentials + Google with session‑level admin control
- **QPay integration** for invoices, callbacks, and status checks (test and course variants)
- **MongoDB + Mongoose** models for User, Course, Test, Purchase, Payment
- **Admin portal** with consistent navigation, home link, and logout controls
- **Bilingual-ready UI** scaffold (EN/MN) with theme support

### Quick Start

Visit `http://testcenter.mn/login`.

