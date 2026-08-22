import { PaymentMethod, type PaymentMethod as PaymentMethodValue } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class CheckoutStockError extends Error {
  status: number;

  constructor(message: string, status = 409) {
    super(message);
    this.name = "CheckoutStockError";
    this.status = status;
  }
}

export type CheckoutCartItem = {
  variantId: string;
  sku: string;
  productName: string;
  quantity: number;
  price: number;
  stockQuantity: number;
};

type PaymentGatewayResponse = Prisma.InputJsonValue | undefined;

export async function getUserCartCheckoutItems(userId: string): Promise<CheckoutCartItem[]> {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              price: true,
              stockQuantity: true,
              isActive: true,
              product: {
                select: {
                  name: true,
                  isActive: true,
                  deletedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (cart?.items ?? [])
    .filter((item) => item.variant.isActive && item.variant.product.isActive && !item.variant.product.deletedAt)
    .map((item) => ({
      variantId: item.variant.id,
      sku: item.variant.sku,
      productName: item.variant.product.name,
      quantity: Math.max(1, item.quantity),
      price: Number(item.variant.price),
      stockQuantity: item.variant.stockQuantity,
    }));
}

export function getCheckoutItemsTotal(items: CheckoutCartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function assertCheckoutItemsInStock(items: CheckoutCartItem[]) {
  if (items.length === 0) {
    throw new CheckoutStockError("Giỏ hàng đang trống.", 400);
  }

  const outOfStock = items.find((item) => item.stockQuantity <= 0);
  if (outOfStock) {
    throw new CheckoutStockError(`Sản phẩm ${outOfStock.productName} đã hết hàng.`);
  }

  const overStock = items.find((item) => item.quantity > item.stockQuantity);
  if (overStock) {
    throw new CheckoutStockError(
      `Sản phẩm ${overStock.productName} chỉ còn ${overStock.stockQuantity} sản phẩm trong kho.`,
    );
  }
}

export function toOrderItemsCreateData(items: CheckoutCartItem[]) {
  return items.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
    price: item.price,
  }));
}

async function decrementCheckoutItemsStock(
  tx: Prisma.TransactionClient,
  items: Array<{ variantId: string; quantity: number; productName?: string }>
) {
  for (const item of items) {
    const result = await tx.productVariant.updateMany({
      where: {
        id: item.variantId,
        stockQuantity: { gte: item.quantity },
      },
      data: {
        stockQuantity: { decrement: item.quantity },
      },
    });

    if (result.count !== 1) {
      throw new CheckoutStockError(
        item.productName
          ? `Sản phẩm ${item.productName} không đủ tồn kho để thanh toán.`
          : "Một sản phẩm trong đơn không đủ tồn kho để thanh toán.",
      );
    }
  }
}

async function clearUserCart(tx: Prisma.TransactionClient, userId: string) {
  const cart = await tx.cart.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (cart) {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}

export async function createPaidOrderAndDecrementStock({
  userId,
  couponId,
  discountAmount,
  shippingAddress,
  phone,
  totalAmount,
  trackingNumber,
  paymentMethod,
  items,
}: {
  userId: string;
  couponId?: string | null;
  discountAmount?: number | null;
  shippingAddress: string;
  phone: string;
  totalAmount: number;
  trackingNumber: string;
  paymentMethod: PaymentMethodValue;
  items: CheckoutCartItem[];
}) {
  assertCheckoutItemsInStock(items);

  return prisma.$transaction(async (tx) => {
    await decrementCheckoutItemsStock(tx, items);

    const order = await tx.order.create({
      data: {
        userId,
        couponId: couponId || null,
        discountAmount: discountAmount || null,
        shippingAddress,
        phone,
        totalAmount,
        status: "processing",
        paymentStatus: "paid",
        trackingNumber,
        items: { createMany: { data: toOrderItemsCreateData(items) } },
        payment: {
          create: {
            method: paymentMethod,
            amount: totalAmount,
            status: "paid",
            paidAt: new Date(),
          },
        },
      },
      select: {
        id: true,
        trackingNumber: true,
        totalAmount: true,
      },
    });

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    await clearUserCart(tx, userId);
    return order;
  });
}

export async function markOrderPaidAndDecrementStock({
  orderId,
  transactionId,
  gatewayResponse,
  paymentMethod = PaymentMethod.cod,
}: {
  orderId: string;
  transactionId?: string | null;
  gatewayResponse?: PaymentGatewayResponse;
  paymentMethod?: PaymentMethodValue;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              select: {
                sku: true,
                stockQuantity: true,
                product: { select: { name: true } },
              },
            },
          },
        },
        payment: { select: { id: true } },
      },
    });

    if (!order) {
      throw new CheckoutStockError("Không tìm thấy đơn hàng.", 404);
    }

    if (order.paymentStatus === "paid") {
      return { order, alreadyPaid: true };
    }

    const stockItems = order.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      stockQuantity: item.variant.stockQuantity,
      productName: item.variant.product.name,
    }));
    assertCheckoutItemsInStock(
      stockItems.map((item) => ({
        ...item,
        sku: "",
        price: 0,
      })),
    );
    await decrementCheckoutItemsStock(tx, stockItems);

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "processing",
        paymentStatus: "paid",
      },
    });

    const paymentData = {
      status: "paid" as const,
      transactionId,
      gatewayResponse,
      paidAt: new Date(),
    };

    if (order.payment) {
      await tx.payment.update({
        where: { orderId },
        data: paymentData,
      });
    } else {
      await tx.payment.create({
        data: {
          orderId,
          method: paymentMethod,
          amount: Number(order.totalAmount),
          ...paymentData,
        },
      });
    }

    if (order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    await clearUserCart(tx, order.userId);
    return { order: updatedOrder, alreadyPaid: false };
  });
}
