import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, type PaymentMethod as PaymentMethodValue } from "@/generated/prisma/enums";
import { memoryCarts } from "../cart/route";

function getSessionKey(userId?: string | null, sessionId?: string | null): string {
  return userId || sessionId || "default-session";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value || "default-session";
    const key = getSessionKey(userId, sessionId);

    const body = (await req.json()) as {
      recipientName?: string;
      phone?: string;
      shippingAddress?: string;
      paymentMethod?: string;
      items?: unknown[];
      totalAmount?: number | string;
    };
    const {
      recipientName = "Khách hàng",
      phone = "0987654321",
      shippingAddress = "Hà Nội, Việt Nam",
      paymentMethod = "cod",
      items = [],
      totalAmount = 0,
    } = body;
    const paymentMethodValue: PaymentMethodValue = Object.values(PaymentMethod).includes(
      paymentMethod as PaymentMethodValue
    )
      ? (paymentMethod as PaymentMethodValue)
      : PaymentMethod.cod;

    // Simulate backend processing delay (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const trackingNumber = "ELX-2026-" + Math.floor(100000 + Math.random() * 900000);
    const orderId = "order-" + Date.now();

    // Try DB insertion first
    try {
      if (userId) {
        await prisma.order.create({
          data: {
            userId,
            shippingAddress,
            phone,
            totalAmount: Number(totalAmount),
            status: "processing",
            paymentStatus: "paid",
            trackingNumber,
            payment: {
              create: {
                method: paymentMethodValue,
                amount: Number(totalAmount),
                status: "paid",
                paidAt: new Date(),
              },
            },
          },
        });

        // Clear cart in DB
        const userCart = await prisma.cart.findFirst({ where: { userId } });
        if (userCart) {
          await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }
    } catch (e) {
      console.warn("DB checkout record creation warning, using simulated response:", e);
    }

    // Always clear memory cart
    memoryCarts[key] = [];

    // Return successful payment response
    return NextResponse.json({
      success: true,
      message: "Thanh toán thành công",
      order: {
        id: orderId,
        trackingNumber,
        recipientName,
        phone,
        shippingAddress,
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: "PAID",
        orderStatus: "PROCESSING",
        totalAmount: Number(totalAmount),
        items,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi trong quá trình xử lý thanh toán" },
      { status: 500 }
    );
  }
}
