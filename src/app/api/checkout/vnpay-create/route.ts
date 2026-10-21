import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildVNPayUrl } from "@/lib/vnpay";
import { PaymentMethod } from "@/generated/prisma/enums";
import { quoteCheckout } from "@/lib/checkoutQuote";
import {
  CheckoutStockError,
  toOrderItemsCreateData,
} from "@/lib/checkoutStock";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập để thanh toán bằng VNPay" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      recipientName = "Khách hàng",
      phone = "0987654321",
      shippingAddress = "Hà Nội, Việt Nam",
      totalAmount,
      couponCode,
    } = body;

    const { items: checkoutItems, amount, coupon: couponValidation } =
      await quoteCheckout(userId, couponCode, totalAmount);

    const trackingNumber = "ELX-VNP-" + Math.floor(100000 + Math.random() * 900000);

    // Create Order in DB with status pending & paymentStatus unpaid
    const order = await prisma.order.create({
      data: {
        userId,
        couponId: couponValidation.couponId,
        discountAmount: couponValidation.discountAmount || null,
        shippingAddress: `${recipientName} - ${shippingAddress}`,
        phone,
        totalAmount: amount,
        status: "pending",
        paymentStatus: "unpaid",
        trackingNumber,
        payment: {
          create: {
            method: PaymentMethod.vnpay,
            amount,
            status: "unpaid",
          },
        },
        items: {
          createMany: {
            data: toOrderItemsCreateData(checkoutItems),
          },
        },
      },
      select: {
        id: true,
        totalAmount: true,
        trackingNumber: true,
      },
    });

    // Client IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddr = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // Build VNPay redirect URL
    const paymentUrl = buildVNPayUrl({
      orderId: order.id,
      amount,
      orderInfo: `Thanh toan don hang Electrolux #${order.trackingNumber}`,
      ipAddr,
    });

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId: order.id,
      trackingNumber: order.trackingNumber,
    });
  } catch (error) {
    if (error instanceof CheckoutStockError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    console.error("VNPay Create error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khởi tạo thanh toán VNPay" },
      { status: 500 }
    );
  }
}
