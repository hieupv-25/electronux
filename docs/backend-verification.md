# Backend verification and CV evidence

Verified locally on 2026-10-21. This is development verification, not a claim
about production traffic, payment volume, uptime or percentage coverage.

- 31 Prisma models: count `model` declarations in `prisma/schema.prisma`.
- 7 versioned Prisma migrations: count `prisma/migrations/*/migration.sql`.
  All 7 applied successfully to a fresh local PostgreSQL database.
- 2 supported OAuth providers: Google and Facebook in `src/auth.ts`, enabled
  when their credentials are configured.
- 45 automated payment tests passed, with zero failures or skips: 40 isolated
  signing/callback tests and 5 tests using actual Prisma/PostgreSQL transactions.
- TypeScript checking and ESLint on changed production files passed.

## Payment corrections

Invalid signatures, duplicate VNPay parameters and signed amount mismatches
cannot change orders. Both the response code and transaction status must
indicate success. A conditional pending/unpaid order update claims settlement
inside the transaction before stock is decremented. Repeated/concurrent callbacks
cannot apply stock or coupon changes twice; a stock failure rolls back the claim.
Cancellation also uses a conditional update, preserving paid/refunded orders.
VNPay signing requires environment credentials rather than a source-code fallback.

The browser return route still supports settlement for the existing sandbox
flow. This is not evidence of a certified live VNPay integration. VNPay's
[official integration guide](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html)
describes IPN as the authoritative payment notification for a live integration.

## Repeat verification

Use Node 22 or newer. Install dependencies with `npm ci`, then `npx prisma generate`.

```powershell
node --test tests/vnpay.test.cjs tests/callbacks.test.cjs tests/pricing.test.cjs
npx tsc --noEmit --incremental false
npx eslint src/lib/vnpay.ts src/lib/checkoutStock.ts src/app/api/checkout/vnpay-ipn/route.ts src/app/api/checkout/vnpay-return/route.ts
```

For integration tests, create a disposable local PostgreSQL database, then set
`DATABASE_URL`, `DIRECT_URL` and `TEST_DATABASE_URL` to its URL. These settings
override developer `.env` files for Prisma migration commands. Never use a real
customer database. The runner rejects nonlocal database hosts and inserts test
fixtures; dispose of the entire test database afterward.

```powershell
npx prisma migrate deploy
node --import ./tests/register.mjs --test tests/checkout.integration.mjs
```

The PostgreSQL tests cover simultaneous callbacks, competing orders for final
stock, transaction rollback, cancelled/refunded orders, and simultaneous
cancellation/settlement. GitHub Actions repeats the checks against PostgreSQL 16.
The local Windows run used a disposable embedded PostgreSQL instance from the
E_commerce test dependencies. Existing unrelated worktree changes were retained.

## Server-owned checkout prices

COD demo, VNPay creation and VietQR creation now share checkoutQuote.ts. The quote
uses current stored cart quantities/prices and validates the coupon against that
subtotal. Browser totalAmount is an expected quote only; a mismatch returns 409
before creating any order or payment URL. Browser couponBaseAmount has no effect.
The 12 new route tests check forged totals, coupon bases, omitted totals and
anonymous requests across all three entry points. The artificial checkout delay
was removed; no timing improvement is claimed.

Extra warranty/add-on prices held only in browser state are not authoritative
cart items. Until represented by persisted cart SKUs, these mismatched quotes
are rejected rather than charged or silently discarded. This prototype still
contains simulated payment flows; verification is not evidence of live settlement.