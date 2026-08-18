import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildVNPayUrl } from "@/lib/vnpay";
import { PaymentMethod } from "@/generated/prisma/enums";

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
      items = [],
    } = body;

    const amount = Number(totalAmount);
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
    const orderItemsData = Array.isArray(items) && items.length > 0
      ? items.map((item: any) => ({
          variantId: item.variantId || item.variant?.id || defaultVariantId,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price || item.variant?.price || firstVariant?.price || 1000000),
        })).filter((i: any) => Boolean(i.variantId))
      : [];

    // Create Order in DB with status pending & paymentStatus unpaid
    const order = await prisma.order.create({
      data: {
        userId,
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
