import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildVietQRUrl, getVietQRConfig, POPULAR_BANKS } from "@/lib/vietqr";
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
        { success: false, message: "Vui lòng đăng nhập để thanh toán qua VietQR" },
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

    // Tracking code formatted for VietQR message (e.g. ELX 294819)
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `ELX-VQR-${randomCode}`;
    const transferContent = `ELX${randomCode}`;

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
    if (error instanceof CheckoutStockError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    console.error("VietQR Create error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khởi tạo thanh toán VietQR" },
      { status: 500 }
    );
  }
}
