import { NextRequest, NextResponse } from "next/server";
import { readVNPayParams, verifyVNPayResponse } from "@/lib/vnpay";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/enums";
import { cancelUnpaidOrder, CheckoutStockError, markOrderPaidAndDecrementStock } from "@/lib/checkoutStock";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParamsObject = readVNPayParams(url.searchParams);

    const { isValid, orderId, responseCode, transactionNo, amount } = verifyVNPayResponse(searchParamsObject);

    if (!isValid) {
      return NextResponse.json({ RspCode: "97", Message: "Invalid checksum" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, paymentStatus: true, totalAmount: true },
    });

    if (!order) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" });
    }

    if (amount !== Number(order.totalAmount)) {
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
    }

    if (order.paymentStatus !== "unpaid" || order.status !== "pending") {
      return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" });
    }

    if (responseCode === "00" && searchParamsObject.vnp_TransactionStatus === "00") {
      const result = await markOrderPaidAndDecrementStock({
        orderId,
        transactionId: transactionNo,
        gatewayResponse: searchParamsObject,
        paymentMethod: PaymentMethod.vnpay,
      });

      return NextResponse.json({ RspCode: result.alreadyPaid ? "02" : "00", Message: "Confirm Success" });
    } else {
      // Payment failed
      const cancelled = await cancelUnpaidOrder(orderId);
      return NextResponse.json({ RspCode: cancelled ? "00" : "02", Message: "Confirm Success" });
    }
  } catch (error) {
    if (error instanceof CheckoutStockError) {
      return NextResponse.json({ RspCode: "51", Message: error.message });
    }

    console.error("VNPay IPN error:", error);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" });
  }
}
