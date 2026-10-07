import { NextRequest, NextResponse } from "next/server";
import { readVNPayParams, verifyVNPayResponse } from "@/lib/vnpay";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/enums";
import { cancelUnpaidOrder, CheckoutStockError, markOrderPaidAndDecrementStock } from "@/lib/checkoutStock";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParamsObject = readVNPayParams(url.searchParams);

  const { isValid, orderId, responseCode, transactionNo, amount } = verifyVNPayResponse(searchParamsObject);

  const frontendReturnUrl =
    process.env.NEXT_PUBLIC_VNP_RETURNURL || "http://localhost:3000/checkout/vnpay-return";

  if (!isValid || !orderId) {
    return NextResponse.redirect(`${frontendReturnUrl}?status=failed&message=Invalid+Order`);
  }

  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, paymentStatus: true, totalAmount: true },
    });

    if (!currentOrder) {
      return NextResponse.redirect(`${frontendReturnUrl}?status=failed&orderId=${orderId}&message=OrderNotFound`);
    }

    if (amount !== Number(currentOrder.totalAmount)) {
      return NextResponse.redirect(`${frontendReturnUrl}?status=failed&message=InvalidAmount`);
    }

    const encodedOrderId = encodeURIComponent(orderId);
    if (currentOrder.paymentStatus === "paid") {
      return NextResponse.redirect(`${frontendReturnUrl}?status=success&orderId=${encodedOrderId}`);
    }

    if (responseCode === "00" && searchParamsObject.vnp_TransactionStatus === "00") {
      await markOrderPaidAndDecrementStock({
        orderId,
        transactionId: transactionNo,
        gatewayResponse: searchParamsObject,
        paymentMethod: PaymentMethod.vnpay,
      });

      return NextResponse.redirect(
        `${frontendReturnUrl}?status=success&orderId=${encodedOrderId}&txnNo=${encodeURIComponent(transactionNo)}&code=${encodeURIComponent(responseCode)}`
      );
    } else {
      // Payment failed or cancelled
      await cancelUnpaidOrder(orderId);

      return NextResponse.redirect(
        `${frontendReturnUrl}?status=failed&orderId=${encodedOrderId}&code=${encodeURIComponent(responseCode)}`
      );
    }
  } catch (error) {
    if (error instanceof CheckoutStockError) {
      return NextResponse.redirect(
        `${frontendReturnUrl}?status=failed&orderId=${encodeURIComponent(orderId)}&message=${encodeURIComponent(error.message)}`
      );
    }

    console.error("VNPay Return route error:", error);
    return NextResponse.redirect(
      `${frontendReturnUrl}?status=failed&orderId=${encodeURIComponent(orderId)}&message=ServerError`
    );
  }
}
