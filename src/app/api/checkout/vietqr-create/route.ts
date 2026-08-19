import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildVietQRUrl, getVietQRConfig, POPULAR_BANKS } from "@/lib/vietqr";
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
        { success: false, message: "Vui lòng đăng nhập để thanh toán qua VietQR" },
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

    // Tracking code formatted for VietQR message (e.g. ELX 294819)
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `ELX-VQR-${randomCode}`;
    const transferContent = `ELX${randomCode}`;

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
            method: PaymentMethod.banking,
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

    const vietqrConfig = getVietQRConfig();
    const qrImageUrl = buildVietQRUrl({
      bankId: vietqrConfig.bankId,
      accountNo: vietqrConfig.accountNo,
      accountName: vietqrConfig.accountName,
      template: vietqrConfig.template,
      amount,
      addInfo: transferContent,
    });

    const bank = POPULAR_BANKS.find((b) => b.id === vietqrConfig.bankId) || {
      id: vietqrConfig.bankId,
      name: "Ngân hàng Quân Đội MBBank",
      shortName: vietqrConfig.bankId,
    };

    return NextResponse.json({
      success: true,
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      qrImageUrl,
      transferInfo: {
        bankId: vietqrConfig.bankId,
        bankName: bank.name,
        bankShortName: bank.shortName,
        accountNo: vietqrConfig.accountNo,
        accountName: vietqrConfig.accountName,
        amount,
        transferContent,
      },
    });
  } catch (error) {
    console.error("VietQR Create error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khởi tạo thanh toán VietQR" },
      { status: 500 }
    );
  }
}
