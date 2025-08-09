## Psychometrics Platform (Next.js 15)

Production‑ready learning and assessment platform with NextAuth 5, MongoDB, and QPay payments.

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

### Quick Start

```bash
npm install
cp .env.example .env.local  # create and fill in values
npm run dev
```

Visit `http://localhost:3000`.

### Deployment

Deploy on Vercel and configure environment variables per `docs/Environment.md`.
