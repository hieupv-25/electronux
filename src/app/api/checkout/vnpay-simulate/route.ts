import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "processing",
        paymentStatus: "paid",
        payment: {
          update: {
            status: "paid",
            transactionId: "SANDBOX-SIM-" + Date.now(),
            paidAt: new Date(),
          },
        },
      },
      select: {
        id: true,
        trackingNumber: true,
        totalAmount: true,
        userId: true,
      },
    });

    // Clear cart
    if (order.userId) {
      const cart = await prisma.cart.findFirst({ where: { userId: order.userId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return NextResponse.json({
      success: true,
      trackingNumber: order.trackingNumber,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error("Simulate error:", error);
    return NextResponse.json({ success: false, message: "Order not found or already paid" }, { status: 500 });
  }
}
