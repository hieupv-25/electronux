"use client";

import { useCart } from "@/components/CartContext";

export default function MaintenanceServiceActions({
  variantId,
  serviceName,
}: {
  variantId: string;
  serviceName: string;
}) {
  const { addToCart, adding } = useCart();
  const isAdding = adding === variantId;

  return (
    <button
      className="maintenance-detail__add"
      disabled={isAdding}
      onClick={() => void addToCart(variantId)}
      aria-label={`Thêm ${serviceName} vào giỏ hàng`}
    >
      {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
    </button>
  );
}
