import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/enums";
import { CheckoutStockError, markOrderPaidAndDecrementStock } from "@/lib/checkoutStock";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        trackingNumber: true,
        paymentStatus: true,
        couponId: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    await markOrderPaidAndDecrementStock({
      orderId,
      transactionId: "VQR-" + Date.now(),
      paymentMethod: PaymentMethod.banking,
    });

    return NextResponse.json({
      success: true,
      message: "Xác nhận thanh toán VietQR thành công",
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    if (error instanceof CheckoutStockError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }

    console.error("VietQR Confirm error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi xác nhận thanh toán VietQR" },
      { status: 500 }
    );
  }
}
