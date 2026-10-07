/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS isolates transpiled source and dependency doubles. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const load = require('./load-typescript.cjs');
process.env.VNP_HASHSECRET = 'callback-test-secret';
const vnpay = load('src/lib/vnpay.ts');
const stock = load('src/lib/checkoutStock.ts', { '@/lib/prisma': { prisma: {} }, '@/generated/prisma/enums': { PaymentMethod: { cod: 'cod' } } });

function callback(overrides = {}, extra = '') {
  const params = { vnp_TxnRef: 'order-1', vnp_Amount: '12500000', vnp_ResponseCode: '00', vnp_TransactionStatus: '00', vnp_TransactionNo: 'txn-1', ...overrides };
  const message = Object.keys(params).sort().map(k => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`).join('&');
  params.vnp_SecureHash = crypto.createHmac('sha512', process.env.VNP_HASHSECRET).update(message).digest('hex');
  return { url: `http://localhost/callback?${new URLSearchParams(params)}${extra}` };
}
function setup(route, order = { id: 'order-1', totalAmount: 125000, status: 'pending', paymentStatus: 'unpaid' }, options = {}) {
  const calls = { reads: 0, paid: 0, cancelled: 0 };
  const { GET } = load(`src/app/api/checkout/vnpay-${route}/route.ts`, {
    'next/server': { NextResponse: { json: body => body, redirect: location => ({ location }) } },
    '@/lib/vnpay': vnpay,
    '@/lib/prisma': { prisma: { order: { findUnique: async () => { calls.reads++; return order; } } } },
    '@/generated/prisma/enums': { PaymentMethod: { vnpay: 'vnpay' } },
    '@/lib/checkoutStock': {
      CheckoutStockError: stock.CheckoutStockError,
      markOrderPaidAndDecrementStock: async () => { calls.paid++; if (options.error) throw options.error; return { alreadyPaid: Boolean(options.alreadyPaid) }; },
      cancelUnpaidOrder: async () => { calls.cancelled++; return options.cancelled ?? true; },
    },
  });
  return { GET, calls };
}
for (const route of ['ipn', 'return']) {
  test(`${route}: invalid signature does not read or mutate orders`, async () => {
    const { GET, calls } = setup(route); const request = callback(); request.url += 'a';
    await GET(request); assert.deepEqual(calls, { reads: 0, paid: 0, cancelled: 0 });
  });
  test(`${route}: duplicate parameters are rejected before database access`, async () => {
    const { GET, calls } = setup(route); await GET(callback({}, '&vnp_Amount=100'));
    assert.equal(calls.reads, 0);
  });
  test(`${route}: correctly signed mismatched amount never updates the order`, async () => {
    const { GET, calls } = setup(route); const result = await GET(callback({ vnp_Amount: '100' }));
    assert.equal(calls.paid + calls.cancelled, 0);
    if (route === 'ipn') assert.equal(result.RspCode, '04'); else assert.match(result.location, /InvalidAmount/);
  });
  test(`${route}: paid orders survive a late failed callback`, async () => {
    const { GET, calls } = setup(route, { totalAmount: 125000, status: 'processing', paymentStatus: 'paid' });
    await GET(callback({ vnp_ResponseCode: '24', vnp_TransactionStatus: '02' }));
    assert.equal(calls.paid + calls.cancelled, 0);
  });
  test(`${route}: success requires both response and transaction status`, async () => {
    const { GET, calls } = setup(route); await GET(callback({ vnp_TransactionStatus: '02' }));
    assert.equal(calls.paid, 0); assert.equal(calls.cancelled, 1);
  });
  test(`${route}: successful callback invokes transactional settlement`, async () => {
    const { GET, calls } = setup(route); await GET(callback()); assert.equal(calls.paid, 1); assert.equal(calls.cancelled, 0);
  });
}
test('IPN distinguishes a concurrent duplicate from first settlement', async () => {
  const { GET } = setup('ipn', undefined, { alreadyPaid: true }); assert.equal((await GET(callback())).RspCode, '02');
});
test('IPN acknowledges an already cancelled order without stock changes', async () => {
  const { GET, calls } = setup('ipn', { totalAmount: 125000, status: 'cancelled', paymentStatus: 'unpaid' });
  assert.equal((await GET(callback())).RspCode, '02'); assert.equal(calls.paid + calls.cancelled, 0);
});
test('IPN returns not found for an unknown order', async () => {
  const { GET } = setup('ipn', null); assert.equal((await GET(callback())).RspCode, '01');
});
test('IPN returns a stock failure acknowledgement', async () => {
  const { GET } = setup('ipn', undefined, { error: new stock.CheckoutStockError('Insufficient stock') });
  assert.equal((await GET(callback())).RspCode, '51');
});
