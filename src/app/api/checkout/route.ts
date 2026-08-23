import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PaymentMethod, type PaymentMethod as PaymentMethodValue } from "@/generated/prisma/enums";
import { validateCouponCode } from "@/lib/coupons";
import { prisma } from "@/lib/prisma";
import {
  CheckoutStockError,
  createPaidOrderAndDecrementStock,
  getCheckoutItemsTotal,
  getUserCartCheckoutItems,
} from "@/lib/checkoutStock";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập để thanh toán", authRequired: true },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      recipientName?: string;
      phone?: string;
      shippingAddress?: string;
      paymentMethod?: string;
      items?: Array<{ variantId?: string; quantity?: number; variant?: { id?: string } }>;
      totalAmount?: number | string;
      couponCode?: string | null;
      couponBaseAmount?: number | string;
    };
    const {
      recipientName = "Khách hàng",
      phone = "0987654321",
      shippingAddress = "Hà Nội, Việt Nam",
      paymentMethod = "cod",
      items = [],
      totalAmount = 0,
      couponCode,
      couponBaseAmount,
    } = body;
    const paymentMethodValue: PaymentMethodValue = Object.values(PaymentMethod).includes(
      paymentMethod as PaymentMethodValue
    )
      ? (paymentMethod as PaymentMethodValue)
      : PaymentMethod.cod;

    // Simulate backend processing delay (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    let checkoutItems = await getUserCartCheckoutItems(userId);

    // Fallback if DB cart is empty but client has items
    if (checkoutItems.length === 0 && Array.isArray(items) && items.length > 0) {
      const variantIds = items
        .map((it) => it.variantId || it.variant?.id)
        .filter(Boolean) as string[];

      if (variantIds.length > 0) {
        const variants = await prisma.productVariant.findMany({
          where: { id: { in: variantIds }, isActive: true },
          include: { product: true },
        });
        const variantMap = new Map(variants.map((v) => [v.id, v]));

        checkoutItems = items
          .map((item) => {
            const vId = item.variantId || item.variant?.id;
            const variant = vId ? variantMap.get(vId) : null;
            if (!variant || !variant.product || variant.product.deletedAt) return null;
            return {
              variantId: variant.id,
              sku: variant.sku,
              productName: variant.product.name,
              quantity: Math.max(1, item.quantity || 1),
              price: Number(variant.price),
              stockQuantity: variant.stockQuantity,
            };
          })
          .filter(Boolean) as typeof checkoutItems;
      }
    }
    const cartAmount = getCheckoutItemsTotal(checkoutItems);
    const baseAmount = Math.max(0, Number(couponBaseAmount ?? cartAmount) || cartAmount);
    const couponValidation = await validateCouponCode({
      code: couponCode,
      subtotal: baseAmount,
      userId,
    });

    if (!couponValidation.valid) {
      return NextResponse.json(
        { success: false, message: couponValidation.message },
        { status: 400 }
      );
    }

    const payableAmount = couponValidation.code
      ? couponValidation.finalAmount
      : Math.max(0, Number(totalAmount) || cartAmount);

    const trackingNumber = "ELX-2026-" + Math.floor(100000 + Math.random() * 900000);
    const isCod = paymentMethodValue === PaymentMethod.cod;
    const orderPaymentStatus = isCod ? "unpaid" : "paid";
    const orderStatus = isCod ? "pending" : "processing";

    const order = await createPaidOrderAndDecrementStock({
      userId,
      couponId: couponValidation.couponId,
      discountAmount: couponValidation.discountAmount,
      shippingAddress,
      phone,
      totalAmount: payableAmount,
      trackingNumber,
      paymentMethod: paymentMethodValue,
      items: checkoutItems,
      isCod,
    });

    // Return successful payment response
    return NextResponse.json({
      success: true,
      message: isCod ? "Đặt hàng COD thành công" : "Thanh toán thành công",
      order: {
        id: order.id,
        trackingNumber,
        recipientName,
        phone,
        shippingAddress,
        paymentMethod: isCod ? "COD" : paymentMethod.toUpperCase(),
        paymentStatus: isCod ? "UNPAID" : "PAID",
        orderStatus: orderStatus.toUpperCase(),
        totalAmount: payableAmount,
        couponCode: couponValidation.code,
        discountAmount: couponValidation.discountAmount,
        items: checkoutItems,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof CheckoutStockError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi trong quá trình xử lý thanh toán" },
      { status: 500 }
    );
  }
}
