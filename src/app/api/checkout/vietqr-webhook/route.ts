import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Universal Webhook for receiving bank transaction notifications (SePay, payOS, Casso, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // SePay format: { id, gateway, transactionDate, accountNumber, transferType, transferAmount, content, ... }
    // payOS format: { data: { orderCode, amount, description, ... } }
    // Casso format: { data: [ { id, tid, description, amount, ... } ] }

    const content: string =
      body.content ||
      body.description ||
      body.data?.description ||
      (Array.isArray(body.data) ? body.data[0]?.description : "") ||
      "";

    const amount: number =
      Number(body.transferAmount) ||
      Number(body.amount) ||
      Number(body.data?.amount) ||
      (Array.isArray(body.data) ? Number(body.data[0]?.amount) : 0) ||
      0;

    // Search for ELX tracking number or order code in description
    // Example: "ELX294819" or "ELX-VQR-294819"
    const match = content.match(/ELX[-_]?VQR[-_]?(\d+)|ELX(\d+)/i);
    const orderNumber = match ? match[1] || match[2] : null;

    let order = null;
    if (orderNumber) {
      order = await prisma.order.findFirst({
        where: {
          trackingNumber: { contains: orderNumber },
          paymentStatus: "unpaid",
        },
        select: { id: true, userId: true, totalAmount: true },
      });
    }

    if (!order && body.orderId) {
      order = await prisma.order.findUnique({
        where: { id: String(body.orderId) },
        select: { id: true, userId: true, totalAmount: true },
      });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or already paid" },
        { status: 200 } // return 200 to acknowledge webhook
      );
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "processing",
        paymentStatus: "paid",
        payment: {
          update: {
            status: "paid",
            transactionId: body.id ? String(body.id) : "AUTO-WEBHOOK-" + Date.now(),
            paidAt: new Date(),
          },
        },
      },
    });

    // Clear cart if user exists
    if (order.userId) {
      const userCart = await prisma.cart.findFirst({ where: { userId: order.userId } });
      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order marked as paid successfully",
      orderId: order.id,
    });
  } catch (error) {
    console.error("VietQR Webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing error" },
      { status: 500 }
    );
  }
}
