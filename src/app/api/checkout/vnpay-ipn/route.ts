import { NextRequest, NextResponse } from "next/server";
import { verifyVNPayResponse } from "@/lib/vnpay";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParamsObject: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      searchParamsObject[key] = value;
    });

    const { isValid, orderId, responseCode, transactionNo } = verifyVNPayResponse(searchParamsObject);

    if (!isValid) {
      return NextResponse.json({ RspCode: "97", Message: "Invalid checksum" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, paymentStatus: true, userId: true },
    });

    if (!order) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" });
    }

    // Check if order is already processed
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" });
    }

    if (responseCode === "00") {
      // Payment successful - auto confirm
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "processing",
          paymentStatus: "paid",
          payment: {
            update: {
              status: "paid",
              transactionId: transactionNo,
              paidAt: new Date(),
            },
          },
        },
      });

      if (order.userId) {
        const userCart = await prisma.cart.findFirst({ where: { userId: order.userId } });
        if (userCart) {
          await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }

      return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      // Payment failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "cancelled",
          paymentStatus: "unpaid",
          payment: {
            update: {
              status: "unpaid",
            },
          },
        },
      });

      return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
    }
  } catch (error) {
    console.error("VNPay IPN error:", error);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" });
  }
}
