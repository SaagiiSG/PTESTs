## Scripts Catalog

This project includes numerous maintenance and debug scripts under `scripts/` (Node.js).

### Categories
- Setup & Migration: `migratePurchases.js`, `migrateUserProfiles.js`, `implementHybridPurchases.js`
- Debug & Inspection: `debug-qpay-payment-check.js`, `debugApiIssues.js`, `checkAuthSetup.js`
- Cleanup & Fixers: `fixNextJS15Params.js`, `fixSyntaxErrors.js`, `cleanupTestData.js`
- Email & Embed: `checkSendGridStatus.js`, `fixEmbedCodeDecryption.js`, `debugEmbedCode.js`

### Usage

Run scripts with Node after setting `.env.local`:
```bash
node scripts/<script-name>.js
```

Prefer running on a staging database or with read‑only flags when available.


