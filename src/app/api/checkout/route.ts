import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PaymentMethod, type PaymentMethod as PaymentMethodValue } from "@/generated/prisma/enums";
import { quoteCheckout } from "@/lib/checkoutQuote";
import {
  CheckoutStockError,
  createPaidOrderAndDecrementStock,
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
      totalAmount,
      couponCode,
    } = body;
    const paymentMethodValue: PaymentMethodValue = Object.values(PaymentMethod).includes(
      paymentMethod as PaymentMethodValue
    )
      ? (paymentMethod as PaymentMethodValue)
      : PaymentMethod.cod;

    const { items: checkoutItems, amount: payableAmount, coupon: couponValidation } =
      await quoteCheckout(userId, couponCode, totalAmount);

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
