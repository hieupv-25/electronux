"use client";

import Image from "next/image";
import Link from "next/link";
import { calcDiscountBadge, formatPrice } from "@/lib/formatPrice";
import type { CategoryProduct } from "@/data/categories";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";

import { ALL_CATEGORIES } from "@/lib/getCategoryData";

type ProductCardProps = {
  product: CategoryProduct;
  categorySlug?: string;
};

export default function ProductCard({ product, categorySlug }: ProductCardProps) {
  // Infer the correct category slug if not passed or if default
  let resolvedCategorySlug = categorySlug;
  if (!resolvedCategorySlug) {
    const found = ALL_CATEGORIES.find((cat) => cat.products.some((p) => p.slug === product.slug));
    resolvedCategorySlug = found ? found.slug : "may-giat";
  }

  const badge = calcDiscountBadge(product.price, product.oldPrice);
  const detailHref = `/thiet-bi/${resolvedCategorySlug}/${product.slug}`;

  const { addToCart, adding } = useCart();
  const { isSaved, toggleWishlist } = useWishlist();

  const isAddingThis = adding === product.variantId;
  const canAddToCart = Boolean(product.variantId);
  const saved = isSaved(product.id);

  const handleWishlistClick = () => {
    void toggleWishlist({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.img,
      price: product.price,
      oldPrice: product.oldPrice,
      categorySlug: resolvedCategorySlug,
      url: detailHref,
    });
  };

  return (
    <article className="plp-card">
      <div className="plp-card__top">
        {badge && <span className="plp-card__badge">{badge}</span>}
        <button
          type="button"
          className="plp-card__wishlist"
          aria-label="Thêm vào yêu thích"
          onClick={handleWishlistClick}
          style={{ color: saved ? "#e3000b" : "#64748b" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={saved ? "#e3000b" : "none"}
            stroke={saved ? "#e3000b" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <Link href={detailHref} className="plp-card__img-link">
          <Image
            src={product.img}
            alt={product.name}
            width={280}
            height={280}
            className="plp-card__img"
            style={{ width: "100%", height: "auto" }}
          />
        </Link>
        <p className="plp-card__sku">{product.sku}</p>
        <h2 className="plp-card__name">
          <Link href={detailHref}>{product.name}</Link>
        </h2>
        {product.features.length > 0 && (
          <ul className="plp-card__features">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="plp-card__bottom">
        <div className="plp-card__badges">
          {product.freeShipping && (
            <span className="plp-card__service-badge">
              <Image src="/icon-free-shipping.svg" alt="" width={16} height={16} />
              Miễn phí vận chuyển
            </span>
          )}
          {product.freeInstallation && (
            <span className="plp-card__service-badge">
              <Image src="/icon-free-install.svg" alt="" width={16} height={16} />
              Miễn phí lắp đặt
            </span>
          )}
          {product.installment0Percent && (
            <span className="plp-card__service-badge">
              <Image src="/icon-installment.svg" alt="" width={16} height={16} />
              Trả góp 0%
            </span>
          )}
        </div>

        <div className="plp-card__price-row">
          <strong className="plp-card__price">{formatPrice(product.price)}</strong>
          <span className="plp-card__price-old">{formatPrice(product.oldPrice)}</span>
        </div>

        <div className="plp-card__actions">
          <button
            type="button"
            onClick={() => product.variantId && addToCart(product.variantId)}
            disabled={isAddingThis || !canAddToCart}
            title={canAddToCart ? undefined : "Sản phẩm này chưa có variantId, chưa thể thêm vào giỏ"}
            className="cta-btn plp-card__add-btn"
            style={{
              cursor: isAddingThis || !canAddToCart ? "not-allowed" : "pointer",
              opacity: isAddingThis || !canAddToCart ? 0.7 : 1,
            }}
          >
            {isAddingThis ? "Đang thêm..." : "Thêm vào giỏ"}
          </button>
          <Link href={detailHref} className="cta-btn cta-btn--outline plp-card__detail-btn">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
