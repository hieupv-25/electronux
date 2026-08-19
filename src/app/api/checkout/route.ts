import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, type PaymentMethod as PaymentMethodValue } from "@/generated/prisma/enums";
import { memoryCarts } from "../cart/route";
import { validateCouponCode } from "@/lib/coupons";

function getSessionKey(userId?: string | null, sessionId?: string | null): string {
  return userId || sessionId || "default-session";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value || "default-session";
    const key = getSessionKey(userId, sessionId);

    const body = (await req.json()) as {
      recipientName?: string;
      phone?: string;
      shippingAddress?: string;
      paymentMethod?: string;
      items?: unknown[];
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

    const baseAmount = Math.max(0, Number(couponBaseAmount ?? totalAmount) || 0);
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
      : Math.max(0, Number(totalAmount) || 0);

    const trackingNumber = "ELX-2026-" + Math.floor(100000 + Math.random() * 900000);
    const orderId = "order-" + Date.now();

    // Deduct stock in DB for checked-out variants
    const checkoutItems = (items as Array<{ variantId?: string; quantity?: number; variant?: { id?: string } }>) || [];
    for (const item of checkoutItems) {
      const vId = item.variantId || item.variant?.id;
      const qty = item.quantity || 1;
      if (vId) {
        try {
          await prisma.productVariant.update({
            where: { id: vId },
            data: {
              stockQuantity: {
                decrement: qty,
              },
            },
          });
        } catch (err) {
          console.warn(`Could not update stock for variant ${vId}:`, err);
        }
      }
    }

    // Try DB insertion for Order record
    try {
      if (userId) {
        await prisma.$transaction(async (tx) => {
          await tx.order.create({
            data: {
              userId,
              couponId: couponValidation.couponId,
              discountAmount: couponValidation.discountAmount || null,
              shippingAddress,
              phone,
              totalAmount: payableAmount,
              status: "processing",
              paymentStatus: "paid",
              trackingNumber,
              payment: {
                create: {
                  method: paymentMethodValue,
                  amount: payableAmount,
                  status: "paid",
                  paidAt: new Date(),
                },
              },
            },
          });

          if (couponValidation.couponId) {
            await tx.coupon.update({
              where: { id: couponValidation.couponId },
              data: { usedCount: { increment: 1 } },
            });
          }

          // Clear cart in DB
          const userCart = await tx.cart.findFirst({ where: { userId } });
          if (userCart) {
            await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
          }
        });
      }
    } catch (e) {
      console.warn("DB checkout record creation warning, using simulated response:", e);
    }

    // Always clear memory cart
    memoryCarts[key] = [];

    // Return successful payment response
    return NextResponse.json({
      success: true,
      message: "Thanh toán thành công",
      order: {
        id: orderId,
        trackingNumber,
        recipientName,
        phone,
        shippingAddress,
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: "PAID",
        orderStatus: "PROCESSING",
        totalAmount: payableAmount,
        couponCode: couponValidation.code,
        discountAmount: couponValidation.discountAmount,
        items,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi trong quá trình xử lý thanh toán" },
      { status: 500 }
    );
  }
}
