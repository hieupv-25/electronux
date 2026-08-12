export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}₫`;
}

export function calcDiscountBadge(price: number, oldPrice: number): string {
  const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
  return `GIẢM ${pct}%`;
}
