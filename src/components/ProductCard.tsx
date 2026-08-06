"use client";

import Image from "next/image";
import { useCart } from "./CartContext";

type ProductCardProps = {
  product: {
    variantId: string;
    img: string;
    name: string;
    sku: string;
    price: string;
    oldPrice?: string;
    badge?: string;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, adding } = useCart();
  const isAddingThis = adding === product.variantId;

  return (
    <div className="product-card">
      {product.badge && <span className="product-card__badge">{product.badge}</span>}
      <Image
        src={product.img}
        alt={product.name}
        width={300}
        height={300}
        className="product-card__img"
        style={{ objectFit: "contain", margin: "0 auto" }}
      />
      <h3 className="product-card__name">{product.name}</h3>
      <p className="product-card__sku">{product.sku}</p>
      <p className="product-card__price">{product.price}</p>
      {product.oldPrice && <p className="product-card__price-old">{product.oldPrice}</p>}
      <div className="product-card__actions">
        <button
          onClick={() => addToCart(product.variantId)}
          disabled={isAddingThis}
          className="cta-btn"
          style={{
            width: "100%",
            cursor: isAddingThis ? "not-allowed" : "pointer",
            opacity: isAddingThis ? 0.7 : 1,
          }}
        >
          {isAddingThis ? "Đang thêm..." : "Thêm vào giỏ"}
        </button>
        <a href="#" className="cta-btn cta-btn--outline" style={{ width: "100%" }}>
          Xem chi tiết
        </a>
      </div>
    </div>
  );
}
