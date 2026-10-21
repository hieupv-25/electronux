import { validateCouponCode } from "@/lib/coupons";
import { assertCheckoutItemsInStock, CheckoutStockError, getCheckoutItemsTotal, getUserCartCheckoutItems } from "@/lib/checkoutStock";

// Browser totals are only an expected quote, never the source of an order price.
export async function quoteCheckout(userId: string, couponCode?: string | null, expectedTotal?: unknown) {
  const items = await getUserCartCheckoutItems(userId);
  assertCheckoutItemsInStock(items);
  const subtotal = getCheckoutItemsTotal(items);
  const coupon = await validateCouponCode({ code: couponCode, subtotal, userId });
  if (!coupon.valid) throw new CheckoutStockError(coupon.message, 400);
  const amount = coupon.finalAmount;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new CheckoutStockError("Số tiền thanh toán không hợp lệ.", 400);
  }
  if (expectedTotal !== undefined &&
      ((typeof expectedTotal !== "number" && typeof expectedTotal !== "string") ||
       !Number.isFinite(Number(expectedTotal)) || Number(expectedTotal) !== amount)) {
    throw new CheckoutStockError("Giá trị giỏ hàng đã thay đổi. Vui lòng tải lại giỏ hàng trước khi thanh toán.", 409);
  }
  return { items, amount, coupon };
}
