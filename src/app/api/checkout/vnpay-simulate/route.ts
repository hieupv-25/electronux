import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/enums";
import { CheckoutStockError, markOrderPaidAndDecrementStock } from "@/lib/checkoutStock";

// ⚠️ CHỈ DÙNG TRONG SANDBOX / DEV - Mô phỏng VNPay callback
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, message: "Not available in production" }, { status: 403 });
  }

  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ success: false, message: "orderId required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        trackingNumber: true,
        totalAmount: true,
        userId: true,
        paymentStatus: true,
        couponId: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    await markOrderPaidAndDecrementStock({
      orderId,
      transactionId: "SANDBOX-SIM-" + Date.now(),
      paymentMethod: PaymentMethod.vnpay,
    });

    return NextResponse.json({
      success: true,
      trackingNumber: order.trackingNumber,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    if (error instanceof CheckoutStockError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }

    console.error("Simulate error:", error);
    return NextResponse.json({ success: false, message: "Order not found or already paid" }, { status: 500 });
  }
}
