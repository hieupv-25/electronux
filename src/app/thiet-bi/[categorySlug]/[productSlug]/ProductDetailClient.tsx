"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { formatPrice } from "@/lib/formatPrice";
import type { CategoryProduct, CategoryPageData } from "@/data/categories";

interface Props {
  product: CategoryProduct;
  category: CategoryPageData;
}

const BADGES = [
  { key: "freeShipping", label: "Miễn phí vận chuyển", icon: "🚚" },
  { key: "freeInstallation", label: "Lắp đặt miễn phí", icon: "🔧" },
  { key: "installment0Percent", label: "Trả góp 0%", icon: "💳" },
] as const;

const TABS = ["Thông số kỹ thuật", "Mô tả sản phẩm", "Đánh giá"] as const;
type Tab = (typeof TABS)[number];

export default function ProductDetailClient({ product, category }: Props) {
  const { addToCart, adding } = useCart();
  const { isSaved, toggleWishlist, togglingId } = useWishlist();

  const [activeTab, setActiveTab] = useState<Tab>("Thông số kỹ thuật");
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  const saved = isSaved(product.id);
  const cartLoading = adding === (product.variantId ?? product.id);
  const wishLoading = togglingId === product.id;

  const discount =
    product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const handleAddToCart = async () => {
    if (!product.variantId) return;
    await addToCart(product.variantId, qty);
  };

  return (
    <div className="pdp-page">
      <div className="pdp-page__container">
        {/* ── Image + Summary ── */}
        <section className="pdp-hero">
          {/* Left: Image gallery */}
          <div className="pdp-gallery">
            <div className="pdp-gallery__main">
              {!imgError ? (
                <Image
                  src={product.img}
                  alt={product.name}
                  width={560}
                  height={560}
                  className="pdp-gallery__img"
                  priority
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="pdp-gallery__placeholder">
                  <span>Không có ảnh</span>
                </div>
              )}
              {discount > 0 && (
                <span className="pdp-gallery__badge">-{discount}%</span>
              )}
            </div>
          </div>

          {/* Right: Product info */}
          <div className="pdp-info">
            <p className="pdp-info__category">{category.name}</p>
            <h1 className="pdp-info__name">{product.name}</h1>
            <p className="pdp-info__sku">Mã sản phẩm: {product.sku}</p>

            {/* Price block */}
            <div className="pdp-price">
              <span className="pdp-price__current">{formatPrice(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="pdp-price__old">{formatPrice(product.oldPrice)}</span>
                  <span className="pdp-price__badge">GIẢM {discount}%</span>
                </>
              )}
            </div>

            {/* Service badges */}
            <ul className="pdp-badges">
              {BADGES.map(({ key, label, icon }) =>
                product[key] ? (
                  <li key={key} className="pdp-badge">
                    <span className="pdp-badge__icon">{icon}</span>
                    {label}
                  </li>
                ) : null
              )}
            </ul>

            {/* Highlights */}
            {product.features.length > 0 && (
              <ul className="pdp-features">
                {product.features.map((f, i) => (
                  <li key={i} className="pdp-features__item">
                    <span className="pdp-features__bullet">✔</span>
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {/* Qty */}
            <div className="pdp-qty">
              <span className="pdp-qty__label">Số lượng:</span>
              <div className="pdp-qty__controls">
                <button
                  className="pdp-qty__btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Giảm số lượng"
                >
                  −
                </button>
                <span className="pdp-qty__value">{qty}</span>
                <button
                  className="pdp-qty__btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="pdp-cta">
              <button
                id="pdp-add-to-cart-btn"
                className="pdp-cta__add-cart"
                onClick={handleAddToCart}
                disabled={!product.variantId || cartLoading}
              >
                {cartLoading ? (
                  <span className="pdp-cta__spinner" />
                ) : (
                  "🛒 Thêm vào giỏ hàng"
                )}
              </button>

              <button
                id="pdp-wishlist-btn"
                className={`pdp-cta__wishlist${saved ? " pdp-cta__wishlist--saved" : ""}`}
                onClick={() => toggleWishlist(product.id)}
                disabled={wishLoading}
                aria-label={saved ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm yêu thích"}
              >
                {wishLoading ? (
                  <span className="pdp-cta__spinner" />
                ) : saved ? (
                  "♥ Đã lưu"
                ) : (
                  "♡ Lưu"
                )}
              </button>
            </div>

            {!product.variantId && (
              <p className="pdp-info__no-variant">
                Sản phẩm chưa có thông tin biến thể trong hệ thống.
              </p>
            )}
          </div>
        </section>

        {/* ── Tabs ── */}
        <section className="pdp-tabs">
          <nav className="pdp-tabs__nav" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`pdp-tabs__tab${activeTab === tab ? " pdp-tabs__tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="pdp-tabs__panel">
            {activeTab === "Thông số kỹ thuật" && (
              <table className="pdp-specs">
                <tbody>
                  <tr>
                    <th>Mã sản phẩm</th>
                    <td>{product.sku}</td>
                  </tr>
                  {product.color && (
                    <tr>
                      <th>Màu sắc</th>
                      <td style={{ textTransform: "capitalize" }}>{product.color}</td>
                    </tr>
                  )}
                  {product.capacity && (
                    <tr>
                      <th>Dung tích</th>
                      <td>{product.capacity} L</td>
                    </tr>
                  )}
                  {product.features.map((f, i) => (
                    <tr key={i}>
                      <th>Tính năng {i + 1}</th>
                      <td>{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Mô tả sản phẩm" && (
              <div className="pdp-description">
                <h2>{product.name}</h2>
                <p>{category.description}</p>
                {product.features.length > 0 && (
                  <>
                    <h3>Điểm nổi bật</h3>
                    <ul>
                      {product.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {activeTab === "Đánh giá" && (
              <div className="pdp-reviews">
                <p className="pdp-reviews__empty">
                  Chưa có đánh giá nào. Hãy là người đầu tiên!
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
