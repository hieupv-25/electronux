import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PaymentMethod, type PaymentMethod as PaymentMethodValue } from "@/generated/prisma/enums";
import { validateCouponCode } from "@/lib/coupons";
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
      totalAmount?: number | string;
      couponCode?: string | null;
      couponBaseAmount?: number | string;
    };
    const {
      recipientName = "Khách hàng",
      phone = "0987654321",
      shippingAddress = "Hà Nội, Việt Nam",
      paymentMethod = "cod",
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

    const checkoutItems = await getUserCartCheckoutItems(userId);
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
    });

    // Return successful payment response
    return NextResponse.json({
      success: true,
      message: "Thanh toán thành công",
      order: {
        id: order.id,
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
