import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString || !['localhost', '127.0.0.1', 'postgres'].includes(new URL(connectionString).hostname)) {
  throw new Error('TEST_DATABASE_URL must point to an isolated local PostgreSQL test database.');
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString, ssl: false, max: 10 }) });
globalThis.prisma = prisma;
const { markOrderPaidAndDecrementStock, cancelUnpaidOrder, CheckoutStockError } = await import('../src/lib/checkoutStock.ts');
after(() => prisma.$disconnect());

async function fixture(stock = 10) {
  const key = randomUUID();
  const user = await prisma.user.create({ data: { email: `${key}@example.test`, firstName: 'Test', lastName: 'User', passwordHash: 'test-only' } });
  const category = await prisma.category.create({ data: { name: key, slug: key } });
  const product = await prisma.product.create({ data: { name: 'Test product', slug: key, categoryId: category.id } });
  const variant = await prisma.productVariant.create({ data: { productId: product.id, sku: key, variantName: 'Default', price: 100000, stockQuantity: stock } });
  const coupon = await prisma.coupon.create({ data: { code: key, discountType: 'fixed_amount', discountValue: 1000, startDate: new Date('2020-01-01'), endDate: new Date('2099-01-01') } });
  const cart = await prisma.cart.create({ data: { userId: user.id, items: { create: { variantId: variant.id, quantity: 2 } } } });
  const createOrder = (overrides = {}) => prisma.order.create({ data: {
    userId: user.id, couponId: coupon.id, totalAmount: 200000, shippingAddress: 'Test', phone: '0000000000',
    items: { create: { variantId: variant.id, quantity: 2, price: 100000 } },
    payment: { create: { method: 'vnpay', amount: 200000 } }, ...overrides,
  } });
  const order = await createOrder();
  return { order, variant, coupon, cart, createOrder };
}
const pay = orderId => markOrderPaidAndDecrementStock({ orderId, paymentMethod: 'vnpay', transactionId: 'fixture-txn' });

test('concurrent callbacks settle an order and decrement stock/coupon only once', async () => {
  const f = await fixture(); const results = await Promise.all([pay(f.order.id), pay(f.order.id)]);
  assert.deepEqual(results.map(r => r.alreadyPaid).sort(), [false, true]);
  assert.equal((await prisma.productVariant.findUnique({ where: { id: f.variant.id } })).stockQuantity, 8);
  assert.equal((await prisma.coupon.findUnique({ where: { id: f.coupon.id } })).usedCount, 1);
  assert.equal(await prisma.payment.count({ where: { orderId: f.order.id, status: 'paid' } }), 1);
  assert.equal(await prisma.cartItem.count({ where: { cartId: f.cart.id } }), 0);
});
test('two orders competing for final stock cannot oversell; losing order rolls back', async () => {
  const f = await fixture(2); const other = await f.createOrder();
  const results = await Promise.allSettled([pay(f.order.id), pay(other.id)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.ok(results.find(r => r.status === 'rejected').reason instanceof CheckoutStockError);
  assert.equal((await prisma.productVariant.findUnique({ where: { id: f.variant.id } })).stockQuantity, 0);
  const orders = await prisma.order.findMany({ where: { id: { in: [f.order.id, other.id] } } });
  assert.deepEqual(orders.map(o => o.paymentStatus).sort(), ['paid', 'unpaid']);
  assert.equal(orders.find(o => o.paymentStatus === 'unpaid').status, 'pending');
  assert.equal((await prisma.coupon.findUnique({ where: { id: f.coupon.id } })).usedCount, 1);
});
test('insufficient stock rolls back order claim, payment, coupon and cart updates', async () => {
  const f = await fixture(1); await assert.rejects(pay(f.order.id), CheckoutStockError);
  const order = await prisma.order.findUnique({ where: { id: f.order.id }, include: { payment: true } });
  assert.equal(order.status, 'pending'); assert.equal(order.paymentStatus, 'unpaid'); assert.equal(order.payment.status, 'unpaid');
  assert.equal((await prisma.coupon.findUnique({ where: { id: f.coupon.id } })).usedCount, 0);
  assert.equal(await prisma.cartItem.count({ where: { cartId: f.cart.id } }), 1);
});
test('cancelled and refunded orders cannot be settled by delayed callbacks', async () => {
  const f = await fixture(); await cancelUnpaidOrder(f.order.id); await assert.rejects(pay(f.order.id), CheckoutStockError);
  const refunded = await f.createOrder({ status: 'completed', paymentStatus: 'refunded' });
  await assert.rejects(pay(refunded.id), CheckoutStockError);
  assert.equal((await prisma.productVariant.findUnique({ where: { id: f.variant.id } })).stockQuantity, 10);
});
test('concurrent cancellation and settlement leave a consistent terminal state', async () => {
  const f = await fixture(); await Promise.allSettled([pay(f.order.id), cancelUnpaidOrder(f.order.id)]);
  const order = await prisma.order.findUnique({ where: { id: f.order.id }, include: { payment: true } });
  const remaining = (await prisma.productVariant.findUnique({ where: { id: f.variant.id } })).stockQuantity;
  assert.ok((order.status === 'processing' && order.paymentStatus === 'paid' && order.payment.status === 'paid' && remaining === 8) ||
    (order.status === 'cancelled' && order.paymentStatus === 'unpaid' && order.payment.status === 'unpaid' && remaining === 10));
  assert.equal(await cancelUnpaidOrder(f.order.id), false);
});
