import { prisma } from "@/lib/prisma";

type CouponRecord = {
  id: string;
  code: string;
  discountType: string;
  discountValue: unknown;
  minOrderAmount: unknown;
  maxDiscountAmount: unknown;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export type CouponValidation = {
  valid: boolean;
  message: string;
  code: string | null;
  couponId: string | null;
  discountAmount: number;
  finalAmount: number;
};

function money(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCouponCode(code?: string | null) {
  return (code ?? "").trim().toUpperCase();
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function calculateDiscount(coupon: CouponRecord, subtotal: number) {
  const discountValue = money(coupon.discountValue);
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = subtotal * (discountValue / 100);
  } else if (coupon.discountType === "fixed_amount") {
    discount = discountValue;
  } else if (coupon.discountType === "free_shipping") {
    discount = 0;
  }

  const maxDiscount = money(coupon.maxDiscountAmount);
  if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);

  return Math.max(0, Math.min(subtotal, Math.round(discount)));
}

export async function validateCouponCode({
  code,
  subtotal,
  userId,
}: {
  code?: string | null;
  subtotal: number;
  userId?: string | null;
}): Promise<CouponValidation> {
  const normalizedCode = normalizeCouponCode(code);
  const orderSubtotal = Math.max(0, Math.round(Number(subtotal) || 0));

  if (!normalizedCode) {
    return {
      valid: true,
      message: "",
      code: null,
      couponId: null,
      discountAmount: 0,
      finalAmount: orderSubtotal,
    };
  }

  if (orderSubtotal <= 0) {
    return {
      valid: false,
      message: "Giỏ hàng chưa có giá trị để áp dụng mã giảm giá.",
      code: normalizedCode,
      couponId: null,
      discountAmount: 0,
      finalAmount: orderSubtotal,
    };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      minOrderAmount: true,
      maxDiscountAmount: true,
      usageLimit: true,
      usageLimitPerUser: true,
      usedCount: true,
      startDate: true,
      endDate: true,
      isActive: true,
    },
  });

  if (!coupon || !coupon.isActive) {
    return {
      valid: false,
      message: "Mã giảm giá không tồn tại hoặc đã bị tắt.",
      code: normalizedCode,
      couponId: null,
      discountAmount: 0,
      finalAmount: orderSubtotal,
    };
  }

  const now = new Date();
  if (coupon.startDate > now || endOfDay(coupon.endDate) < now) {
    return {
      valid: false,
      message: "Mã giảm giá chưa đến thời gian áp dụng hoặc đã hết hạn.",
      code: normalizedCode,
      couponId: coupon.id,
      discountAmount: 0,
      finalAmount: orderSubtotal,
    };
  }

  const minOrderAmount = money(coupon.minOrderAmount);
  if (minOrderAmount > 0 && orderSubtotal < minOrderAmount) {
    return {
      valid: false,
      message: `Đơn hàng cần tối thiểu ${new Intl.NumberFormat("vi-VN").format(minOrderAmount)} ₫ để dùng mã này.`,
      code: normalizedCode,
      couponId: coupon.id,
      discountAmount: 0,
      finalAmount: orderSubtotal,
    };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      message: "Mã giảm giá đã hết lượt sử dụng.",
      code: normalizedCode,
      couponId: coupon.id,
      discountAmount: 0,
      finalAmount: orderSubtotal,
    };
  }

  const perUserLimit = coupon.usageLimitPerUser ?? 1;
  if (userId && perUserLimit > 0) {
    const usedByUser = await prisma.order.count({
      where: {
        userId,
        couponId: coupon.id,
        deletedAt: null,
        paymentStatus: "paid",
        status: { not: "cancelled" },
      },
    });

    if (usedByUser >= perUserLimit) {
      return {
        valid: false,
        message: "Bạn đã sử dụng hết lượt cho mã giảm giá này.",
        code: normalizedCode,
        couponId: coupon.id,
        discountAmount: 0,
        finalAmount: orderSubtotal,
      };
    }
  }

  const discountAmount = calculateDiscount(coupon, orderSubtotal);

  return {
    valid: true,
    message:
      coupon.discountType === "free_shipping"
        ? "Đã áp dụng mã miễn phí vận chuyển."
        : `Đã áp dụng mã ${coupon.code}.`,
    code: coupon.code,
    couponId: coupon.id,
    discountAmount,
    finalAmount: Math.max(0, orderSubtotal - discountAmount),
  };
}

export async function incrementCouponUsage(couponId?: string | null) {
  if (!couponId) return;

  await prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}
