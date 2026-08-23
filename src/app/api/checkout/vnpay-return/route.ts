import { NextRequest, NextResponse } from "next/server";
import { verifyVNPayResponse } from "@/lib/vnpay";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/enums";
import { CheckoutStockError, markOrderPaidAndDecrementStock } from "@/lib/checkoutStock";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParamsObject: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    searchParamsObject[key] = value;
  });

  const { isValid, orderId, responseCode, transactionNo } = verifyVNPayResponse(searchParamsObject);

  const frontendReturnUrl =
    process.env.NEXT_PUBLIC_VNP_RETURNURL || "http://localhost:3000/checkout/vnpay-return";

  if (!orderId) {
    return NextResponse.redirect(`${frontendReturnUrl}?status=failed&message=Invalid+Order`);
  }

  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, paymentStatus: true, couponId: true },
    });

    if (!currentOrder) {
      return NextResponse.redirect(`${frontendReturnUrl}?status=failed&orderId=${orderId}&message=OrderNotFound`);
    }

    if (isValid && responseCode === "00") {
      await markOrderPaidAndDecrementStock({
        orderId,
        transactionId: transactionNo,
        gatewayResponse: searchParamsObject,
        paymentMethod: PaymentMethod.vnpay,
      });

      return NextResponse.redirect(
        `${frontendReturnUrl}?status=success&orderId=${orderId}&txnNo=${transactionNo}&code=${responseCode}`
      );
    } else {
      // Payment failed or cancelled
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
      }).catch(() => null);

      return NextResponse.redirect(
        `${frontendReturnUrl}?status=failed&orderId=${orderId}&code=${responseCode}`
      );
    }
  } catch (error) {
    if (error instanceof CheckoutStockError) {
      return NextResponse.redirect(
        `${frontendReturnUrl}?status=failed&orderId=${orderId}&message=${encodeURIComponent(error.message)}`
      );
    }

    console.error("VNPay Return route error:", error);
    return NextResponse.redirect(
      `${frontendReturnUrl}?status=failed&orderId=${orderId}&message=ServerError`
    );
  }
}
