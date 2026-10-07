/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS isolates transpiled source and dependency doubles. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const load = require('./load-typescript.cjs');
process.env.VNP_HASHSECRET = 'isolated-test-secret';
process.env.VNP_TMNCODE = 'TEST';
const vnpay = load('src/lib/vnpay.ts');

function signed(overrides = {}) {
  const params = { vnp_TxnRef: 'order-1', vnp_ResponseCode: '00', vnp_TransactionStatus: '00',
    vnp_TransactionNo: 'txn-1', vnp_Amount: '12500000', vnp_OrderInfo: 'Test order + tiếng Việt', ...overrides };
  const message = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`).join('&');
  return { ...params, vnp_SecureHash: crypto.createHmac('sha512', process.env.VNP_HASHSECRET).update(message).digest('hex') };
}

test('valid signed callback preserves amount, order and transaction', () => {
  assert.deepEqual(vnpay.verifyVNPayResponse(signed()), { isValid: true, orderId: 'order-1', responseCode: '00', transactionNo: 'txn-1', amount: 125000 });
});
test('changing a signed amount invalidates the callback', () => {
  assert.equal(vnpay.verifyVNPayResponse({ ...signed(), vnp_Amount: '100' }).isValid, false);
});
test('hex digest case does not change validity', () => {
  const params = signed(); params.vnp_SecureHash = params.vnp_SecureHash.toUpperCase();
  assert.equal(vnpay.verifyVNPayResponse(params).isValid, true);
});
for (const amount of ['0', '-100', 'NaN', '1.5', '9007199254740992']) {
  test(`signed malformed amount ${amount} is rejected`, () => assert.equal(vnpay.verifyVNPayResponse(signed({ vnp_Amount: amount })).isValid, false));
}
test('missing or malformed hash fails without throwing', () => {
  for (const digest of ['', 'abc', 'z'.repeat(128)]) assert.equal(vnpay.verifyVNPayResponse({ ...signed(), vnp_SecureHash: digest }).isValid, false);
});
test('duplicate query parameters cannot be silently overwritten', () => {
  const params = new URLSearchParams(signed()); params.append('vnp_TxnRef', 'other-order');
  assert.equal(vnpay.verifyVNPayResponse(vnpay.readVNPayParams(params)).isValid, false);
});
test('missing configuration never accepts callbacks or builds payment URLs', () => {
  const params = signed(); const key = process.env.VNP_HASHSECRET;
  try {
    delete process.env.VNP_HASHSECRET;
    assert.equal(vnpay.verifyVNPayResponse(params).isValid, false);
    assert.throws(() => vnpay.buildVNPayUrl({ orderId: '1', amount: 100 }), /not configured/);
  } finally { process.env.VNP_HASHSECRET = key; }
});
test('payment URL uses configured credentials and amount multiplied by 100', () => {
  const url = new URL(vnpay.buildVNPayUrl({ orderId: 'order-1', amount: 125000, orderInfo: 'Test order + tiếng Việt' }));
  assert.equal(url.searchParams.get('vnp_Amount'), '12500000');
  assert.equal(url.searchParams.get('vnp_TmnCode'), 'TEST');
  assert.equal(vnpay.verifyVNPayResponse(Object.fromEntries(url.searchParams)).isValid, true);
});

module.exports = { signed };
