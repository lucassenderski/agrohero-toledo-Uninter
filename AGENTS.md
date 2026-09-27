# AGENTS.md

## Project

AgroHero Toledo — marketplace for family-farm organic produce in Toledo, PR (Brazil).
Single app lives in `agrohero-toledo-deploy/`: React 19 + Vite + TypeScript frontend,
Express + TypeScript backend (`server.ts`) sharing the same repo.

## Commands (run inside `agrohero-toledo-deploy/`)

| Purpose | Command |
| --- | --- |
| Install deps | `npm install` |
| Typecheck | `npm run lint` (`tsc --noEmit`) |
| Build frontend | `npm run build` |
| Start backend | `RUN_SERVER=1 PORT=3000 npx tsx server.ts` |
| Start frontend | `DISABLE_HMR=true npx vite --port 12000 --host 0.0.0.0` |
| Security tests | `npm run test:security` (vitest + supertest) |

Vite proxies `/api` to `http://localhost:3000`, so the frontend must run behind the
backend for API calls to work locally.

### Previewing in the sandbox

The work host (`*.prod-runtime.all-hands.dev`) is rejected by Vite's `allowedHosts`
check. For a browser check, temporarily set `server.allowedHosts: true` in
`vite.config.ts` and revert it afterwards — do not commit that change.

## Payment model

There is no online payment gateway. Do not reintroduce Mercado Pago or any hosted
checkout.

- `paymentMethods.ts` (repo root, imported by `server.ts`) is the single source of
  truth for accepted methods: `pix`, `credit_card`, `debit_card`, `cash`.
- `GET /api/payment-methods` returns `{ policy, methods }`; the frontend renders
  whatever the backend sends instead of hard-coding options.
- Orders are always created with `paymentStatus: 'pending_on_pickup'`. The backend
  rejects any order attempting `paymentStatus: 'paid'` with HTTP 400 — payment is
  settled in person at pickup or delivery.
- Money is never collected, stored, or transmitted by the app: no card numbers,
  CVV, or PIX codes anywhere in the codebase.

Payment types live in `src/types.ts` (`PaymentMethod`, `PaymentOption`,
`Order.paymentStatus`).

## Order e-mail notifications

`POST /api/orders` sends two kinds of transactional e-mail through `mailer.ts`
(nodemailer), both best-effort: an SMTP failure must never undo a saved order, and
the endpoint still returns 201.

- Customer confirmation goes to `Order.customerEmail`, which is required and
  validated server-side.
- One "prepare the order" notice goes to each producer in the order, grouped by
  producer so a multi-producer cart does not spam one address.
- The producer address is resolved from the server catalog by `productId`
  (`resolveProducer`), never trusted from the client payload — otherwise anyone
  could send mail to arbitrary addresses.
- `smtpConfig()` reads env vars at call time, so tests can start a local SMTP
  server and point the app at it without reimporting modules.
- Without SMTP configured, `isMailConfigured` is false and the order is still
  accepted; `POST /api/orders` reports `emailNotification` in its response.

`tests/orders-email.test.ts` drives a real `smtp-server` on a loopback port and
parses the delivered messages with `mailparser`, so the transport is exercised for
real rather than mocked.

## Conventions

- `npm run lint` is the typecheck; keep it green before finishing.
- `tests/security.test.ts` covers headers, CORS, auth protection, input validation,
  and payment policy. Extend it when behaviour changes.
- UI copy is Brazilian Portuguese.
