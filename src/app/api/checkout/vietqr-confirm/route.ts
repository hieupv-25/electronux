import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (order.paymentStatus !== "paid") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "processing",
            paymentStatus: "paid",
            payment: {
              update: {
                status: "paid",
                transactionId: "VQR-" + Date.now(),
                paidAt: new Date(),
              },
            },
          },
        }),
        ...(order.couponId
          ? [
              prisma.coupon.update({
                where: { id: order.couponId },
                data: { usedCount: { increment: 1 } },
              }),
            ]
          : []),
      ]);
    }

    // Clear cart in DB
    if (order.userId) {
      const userCart = await prisma.cart.findFirst({ where: { userId: order.userId } });
      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Xác nhận thanh toán VietQR thành công",
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error("VietQR Confirm error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi xác nhận thanh toán VietQR" },
      { status: 500 }
    );
  }
}
