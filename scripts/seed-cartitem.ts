import dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

dotenv.config({ path: './.env.local' });

const rawUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';
const connectionString = rawUrl.replace(/[?&]sslmode=[^&]+/g, '');
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const cart = await prisma.cart.findFirst();
  const variant = await prisma.productVariant.findFirst();

  console.log('Cart:', cart ? { id: cart.id, sessionId: cart.sessionId, userId: cart.userId } : null);
  console.log('Variant:', variant ? { id: variant.id, productId: variant.productId, sku: variant.sku } : null);

  if (!cart || !variant) {
    console.error('Could not find an existing cart or product variant to seed.');
    process.exit(1);
  }

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
  });

  if (existing) {
    console.log('CartItem already exists:', { id: existing.id, quantity: existing.quantity });
  } else {
    const created = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: variant.id,
        quantity: 1,
      },
    });
    console.log('Created CartItem:', created);
  }

  const counts = {
    carts: await prisma.cart.count(),
    cartItems: await prisma.cartItem.count(),
  };
  console.log('Counts:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
