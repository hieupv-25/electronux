import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildVNPayUrl } from "@/lib/vnpay";
import { PaymentMethod } from "@/generated/prisma/enums";
import { validateCouponCode } from "@/lib/coupons";

type CheckoutItemPayload = {
  variantId?: string;
  variant?: {
    id?: string;
    price?: number | string;
  };
  quantity?: number | string;
  price?: number | string;
};

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
      totalAmount = 0,
      couponCode,
      couponBaseAmount,
      items = [],
    } = body;

    const baseAmount = Math.max(0, Number(couponBaseAmount ?? totalAmount) || 0);
    const couponValidation = await validateCouponCode({
      code: couponCode,
      subtotal: baseAmount,
      userId,
    });

    if (!couponValidation.valid) {
      return NextResponse.json(
        { success: false, message: couponValidation.message },
        { status: 400 }
      );
    }

    const amount = couponValidation.code
      ? couponValidation.finalAmount
      : Math.max(0, Number(totalAmount) || 0);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Số tiền thanh toán không hợp lệ" },
        { status: 400 }
      );
    }

    const trackingNumber = "ELX-VNP-" + Math.floor(100000 + Math.random() * 900000);

    // Get a default variantId from DB if items missing valid variantId
    const firstVariant = await prisma.productVariant.findFirst({ select: { id: true, price: true } });
    const defaultVariantId = firstVariant?.id;

    // Prepare OrderItem data
    const checkoutItems = Array.isArray(items) ? (items as CheckoutItemPayload[]) : [];
    const orderItemsData = checkoutItems.reduce<{ variantId: string; quantity: number; price: number }[]>(
      (acc, item) => {
        const variantId = item.variantId || item.variant?.id || defaultVariantId;
        if (!variantId) return acc;
        acc.push({
          variantId,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price || item.variant?.price || firstVariant?.price || 1000000),
        });
        return acc;
      },
      []
    );

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
        ...(orderItemsData.length > 0
          ? {
              items: {
                createMany: {
                  data: orderItemsData,
                },
              },
            }
          : {}),
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
    console.error("VNPay Create error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khởi tạo thanh toán VNPay" },
      { status: 500 }
    );
  }
}
