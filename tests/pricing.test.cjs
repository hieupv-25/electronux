/* eslint-disable @typescript-eslint/no-require-imports -- Isolate server dependencies with the CommonJS test loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-typescript.cjs');
const stock = load('src/lib/checkoutStock.ts', { '@/lib/prisma': { prisma: {} }, '@/generated/prisma/enums': { PaymentMethod: { cod: 'cod' } } });

function setup(path, { loggedIn = true, discount = 0 } = {}) {
  const calls = { subtotal: null, stored: null, gateway: null };
  const items = [{ variantId: 'variant-1', sku: 'SKU', productName: 'Product', price: 100000, quantity: 2, stockQuantity: 10 }];
  const checkoutStock = { ...stock, getUserCartCheckoutItems: async () => items,
    createPaidOrderAndDecrementStock: async data => { calls.stored = data; return { id: 'order-1' }; } };
  const quote = load('src/lib/checkoutQuote.ts', {
    '@/lib/checkoutStock': checkoutStock,
    '@/lib/coupons': { validateCouponCode: async ({ subtotal }) => {
      calls.subtotal = subtotal;
      return { valid: true, code: discount ? 'SALE' : null, couponId: null, discountAmount: discount, finalAmount: subtotal - discount };
    } },
  });
  const route = load(`src/app/api/checkout/${path}`, {
    'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } },
    '@/auth': { auth: async () => loggedIn ? { user: { id: 'user-1' } } : null },
    '@/lib/prisma': { prisma: { order: { create: async ({ data }) => { calls.stored = data; return { id: 'order-1', totalAmount: data.totalAmount }; } } } },
    '@/lib/checkoutQuote': quote,
    '@/lib/checkoutStock': checkoutStock,
    '@/generated/prisma/enums': { PaymentMethod: { cod: 'cod', vnpay: 'vnpay', banking: 'banking' } },
    '@/lib/vnpay': { buildVNPayUrl: data => { calls.gateway = data; return 'https://sandbox.example.test'; } },
    '@/lib/vietqr': { getVietQRConfig: () => ({}), buildVietQRUrl: data => { calls.gateway = data; return 'https://qr.example.test'; }, POPULAR_BANKS: [] },
  });
  return { calls, post: body => route.POST({ json: async () => body, headers: new Headers() }) };
}

for (const route of ['route.ts', 'vnpay-create/route.ts', 'vietqr-create/route.ts']) {
  test(`${route}: forged browser total cannot create a cheap order`, async () => {
    const { post, calls } = setup(route); const result = await post({ totalAmount: 1 });
    assert.equal(result.status, 409); assert.equal(calls.stored, null); assert.equal(calls.gateway, null);
  });
  test(`${route}: coupon uses database subtotal despite forged couponBaseAmount`, async () => {
    const { post, calls } = setup(route, { discount: 10000 });
    const result = await post({ couponCode: 'SALE', couponBaseAmount: 1, totalAmount: 190000 });
    assert.equal(result.status, 200); assert.equal(calls.subtotal, 200000); assert.equal(calls.stored.totalAmount, 190000);
    if (calls.gateway) assert.equal(calls.gateway.amount, 190000);
  });
  test(`${route}: no supplied total still derives amount from stored items`, async () => {
    const { post, calls } = setup(route); assert.equal((await post({})).status, 200);
    assert.equal(calls.stored.totalAmount, 200000);
  });
  test(`${route}: anonymous checkout cannot read prices or create an order`, async () => {
    const { post, calls } = setup(route, { loggedIn: false }); assert.equal((await post({})).status, 401);
    assert.equal(calls.subtotal, null); assert.equal(calls.stored, null);
  });
}
