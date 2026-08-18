import { NextRequest, NextResponse } from "next/server";
import { verifyVNPayResponse } from "@/lib/vnpay";
import { prisma } from "@/lib/prisma";

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
      // Automatic confirmation - update order status to paid & processing
      if (currentOrder.paymentStatus !== "paid") {
        await prisma.$transaction([
          prisma.order.update({
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
          }),
          ...(currentOrder.couponId
            ? [
                prisma.coupon.update({
                  where: { id: currentOrder.couponId },
                  data: { usedCount: { increment: 1 } },
                }),
              ]
            : []),
        ]);
      }

      // Clear cart for the user in DB if order belonged to user
      if (currentOrder.userId) {
        const userCart = await prisma.cart.findFirst({ where: { userId: currentOrder.userId } });
        if (userCart) {
          await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }

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
    console.error("VNPay Return route error:", error);
    return NextResponse.redirect(
      `${frontendReturnUrl}?status=failed&orderId=${orderId}&message=ServerError`
    );
  }
}
