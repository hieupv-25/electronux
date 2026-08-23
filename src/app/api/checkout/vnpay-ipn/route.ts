import { NextRequest, NextResponse } from "next/server";
import { verifyVNPayResponse } from "@/lib/vnpay";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/enums";
import { CheckoutStockError, markOrderPaidAndDecrementStock } from "@/lib/checkoutStock";

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
      select: { id: true, status: true, paymentStatus: true, userId: true, couponId: true },
    });

    if (!order) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" });
    }

    // Check if order is already processed
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" });
    }

    if (responseCode === "00") {
      await markOrderPaidAndDecrementStock({
        orderId,
        transactionId: transactionNo,
        gatewayResponse: searchParamsObject,
        paymentMethod: PaymentMethod.vnpay,
      });

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
    if (error instanceof CheckoutStockError) {
      return NextResponse.json({ RspCode: "51", Message: error.message });
    }

    console.error("VNPay IPN error:", error);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" });
  }
}
