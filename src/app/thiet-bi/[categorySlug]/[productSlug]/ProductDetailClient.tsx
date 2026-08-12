"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import type { CategoryProduct, CategoryPageData } from "@/data/categories";

interface Props {
  product: CategoryProduct;
  category: CategoryPageData;
}

const TABS = ["Thông số kỹ thuật", "Mô tả sản phẩm", "Đánh giá"] as const;
type Tab = (typeof TABS)[number];

export default function ProductDetailClient({ product, category }: Props) {
  const { addToCart, adding } = useCart();
  const { isSaved, toggleWishlist, togglingId } = useWishlist();

  const [activeTab, setActiveTab] = useState<Tab>("Thông số kỹ thuật");
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  const saved = isSaved(product.id);
  const cartLoading = adding === (product.variantId ?? product.id);
  const wishLoading = togglingId === product.id;

  const discount =
    product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const savingsAmount = product.oldPrice > product.price ? product.oldPrice - product.price : 0;
  const installmentPerMonth = Math.round(product.price / 6);

  // Gallery thumbnails
  const thumbnails = [
    product.img,
    product.img,
    product.img,
    product.img,
    product.img,
  ];

  const handlePrevThumb = () => {
    setActiveThumb((prev) => (prev === 0 ? thumbnails.length - 1 : prev - 1));
  };

  const handleNextThumb = () => {
    setActiveThumb((prev) => (prev === thumbnails.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    if (!product.variantId) return;
    await addToCart(product.variantId, qty);
  };

  return (
    <div className="pdp-v2">
      <div className="pdp-v2__container">
        {/* ── Main Hero Section: Gallery + Product Summary ── */}
        <section className="pdp-v2__hero">
          {/* Left Column: Image Gallery */}
          <div className="pdp-v2__gallery">
            <div className="pdp-v2__main-view">
              {/* Carousel Arrows */}
              <button
                className="pdp-v2__arrow pdp-v2__arrow--prev"
                onClick={handlePrevThumb}
                aria-label="Ảnh trước"
              >
                ‹
              </button>
              
              <div className="pdp-v2__img-wrapper">
                {!imgError ? (
                  <Image
                    src={thumbnails[activeThumb] || product.img}
                    alt={product.name}
                    width={560}
                    height={560}
                    className="pdp-v2__main-img"
                    priority
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="pdp-v2__placeholder">
                    <span>Không có ảnh</span>
                  </div>
                )}
              </div>

              <button
                className="pdp-v2__arrow pdp-v2__arrow--next"
                onClick={handleNextThumb}
                aria-label="Ảnh tiếp theo"
              >
                ›
              </button>

              {/* Bottom Image Badges */}
              <div className="pdp-v2__img-badges">
                <div className="pdp-v2__badge-item pdp-v2__badge-item--warranty">
                  <span>BẢO HÀNH <strong>2 NĂM</strong></span>
                </div>
                <div className="pdp-v2__badge-item pdp-v2__badge-item--promo">
                  <span>Phụ kiện mua kèm <strong>giảm thêm 5%</strong></span>
                </div>
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className="pdp-v2__thumbs">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  className={`pdp-v2__thumb${idx === activeThumb ? " pdp-v2__thumb--active" : ""}`}
                  onClick={() => setActiveThumb(idx)}
                >
                  <Image
                    src={thumb}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    width={64}
                    height={64}
                    className="pdp-v2__thumb-img"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Detail & Purchase Actions */}
          <div className="pdp-v2__info">
            {/* Top Badges & Wishlist Button */}
            <div className="pdp-v2__header-row">
              <div className="pdp-v2__tags">
                <span className="pdp-v2__tag pdp-v2__tag--discount">GIẢM GIÁ</span>
                <span className="pdp-v2__tag pdp-v2__tag--new">MỚI</span>
              </div>
              
              <button
                id="pdp-wishlist-btn"
                className={`pdp-v2__heart-btn${saved ? " pdp-v2__heart-btn--saved" : ""}`}
                onClick={() => toggleWishlist(product.id)}
                disabled={wishLoading}
                title={saved ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm yêu thích"}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={saved ? "#e3000b" : "none"}
                  stroke={saved ? "#e3000b" : "#64748b"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            {/* Product Title */}
            <h1 className="pdp-v2__title">{product.name}</h1>

            {/* SKU & Rating */}
            <div className="pdp-v2__meta-row">
              <span className="pdp-v2__sku">{product.sku}</span>
              <div className="pdp-v2__rating">
                <span className="pdp-v2__stars">⭐⭐⭐⭐⭐</span>
                <span className="pdp-v2__score">5.0</span>
                <span className="pdp-v2__reviews-count">(9 đánh giá)</span>
                <button className="pdp-v2__write-review">Viết đánh giá</button>
              </div>
            </div>

            {/* Highlights List */}
            <ul className="pdp-v2__highlights">
              <li>Tăng cường làm sạch và chăm sóc nhẹ nhàng.</li>
              <li>Giặt sạch nhanh, đầy tải trong chỉ 45 phút</li>
              <li>Chăn bông cỡ lớn* được hấp sấy chuyên dụng chỉ trong 60 phút</li>
              <li>Sanitise loại bỏ 99,99% vi khuẩn và virus thông thường.*</li>
              <li>DelicatesPlus nâng niu vải mỏng, tự tin giặt máy.</li>
              <li>Hiệu quả và tiết kiệm năng lượng hơn</li>
            </ul>

            {/* Price Block */}
            <div className="pdp-v2__price-section">
              <div className="pdp-v2__price-row">
                <span className="pdp-v2__price-main">{formatPrice(product.price)}</span>
                {product.oldPrice > product.price && (
                  <>
                    <span className="pdp-v2__price-old">{formatPrice(product.oldPrice)}</span>
                    <span className="pdp-v2__savings-pill">
                      Tiết kiệm {formatPrice(savingsAmount)} <strong className="pdp-v2__discount-pct">-{discount}%</strong>
                    </span>
                  </>
                )}
              </div>

              {/* Installment Badge */}
              <div className="pdp-v2__installment">
                <span className="pdp-v2__installment-tag">Lãi suất 0%</span>
                <span className="pdp-v2__installment-text">
                  <strong>{formatPrice(installmentPerMonth)}/tháng</strong> trong 6 tháng
                </span>
              </div>
            </div>

            {/* Gift Promotion Box */}
            <div className="pdp-v2__gift-box">
              <div className="pdp-v2__gift-header">
                <span>QUÀ TẶNG khi mua thêm 6.000.000 ₫</span>
              </div>
              <div className="pdp-v2__gift-body">
                <div className="pdp-v2__gift-info">
                  <p className="pdp-v2__gift-title">Bóng sấy quần áo</p>
                  <p className="pdp-v2__gift-value">(Trị giá 272.000 ₫)</p>
                </div>
                <div className="pdp-v2__gift-img-wrap">
                  <Image
                    src="https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/bep-nau/hero.png"
                    alt="Quà tặng kèm"
                    width={48}
                    height={48}
                    className="pdp-v2__gift-img"
                  />
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="pdp-v2__stock">
              <span className="pdp-v2__stock-dot">●</span>
              <span className="pdp-v2__stock-text">Hàng có sẵn</span>
            </div>

            {/* Add to Cart Action */}
            <div className="pdp-v2__cta-section">
              <button
                id="pdp-add-to-cart-btn"
                className="pdp-v2__add-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.variantId || cartLoading}
              >
                {cartLoading ? (
                  <span className="pdp-v2__spinner" />
                ) : (
                  <div className="pdp-v2__btn-content">
                    <span className="pdp-v2__btn-title">🛒 THÊM VÀO GIỎ</span>
                    <span className="pdp-v2__btn-sub">Miễn phí giao hàng</span>
                  </div>
                )}
              </button>

              <div className="pdp-v2__shipping-note">
                <span className="pdp-v2__shipping-icon">🚚</span>
                <span>Thời gian giao hàng dự kiến: <strong>3-5 ngày làm việc</strong></span>
                <span className="pdp-v2__info-icon" title="Quy định giao hàng">ⓘ</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabs Section: Specs, Description, Reviews ── */}
        <section className="pdp-v2__tabs-section">
          <nav className="pdp-v2__tabs-nav" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`pdp-v2__tab${activeTab === tab ? " pdp-v2__tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="pdp-v2__tab-content">
            {activeTab === "Thông số kỹ thuật" && (
              <div className="pdp-v2__specs-wrapper">
                <table className="pdp-v2__specs-table">
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
                        <th>Dung tích / Sức chứa</th>
                        <td>{product.capacity} L / kg</td>
                      </tr>
                    )}
                    {product.features.map((f, i) => (
                      <tr key={i}>
                        <th>Tính năng nổi bật {i + 1}</th>
                        <td>{f}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "Mô tả sản phẩm" && (
              <div className="pdp-v2__description">
                <h2>{product.name}</h2>
                <p>{category.description}</p>
                {product.features.length > 0 && (
                  <div className="pdp-v2__desc-highlights">
                    <h3>Đặc điểm nổi bật</h3>
                    <ul>
                      {product.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Đánh giá" && (
              <div className="pdp-v2__reviews">
                <div className="pdp-v2__review-summary">
                  <div className="pdp-v2__review-score-box">
                    <span className="pdp-v2__review-big-score">5.0</span>
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="pdp-v2__review-total">Dựa trên 9 đánh giá</span>
                  </div>
                  <button className="pdp-v2__write-review-btn">Viết đánh giá của bạn</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Sticky Help Widget */}
      <div className="pdp-v2__sticky-help">
        <button className="pdp-v2__help-btn">
          <span className="pdp-v2__help-icon">💬</span>
          <span>Cần trợ giúp?</span>
        </button>
      </div>
    </div>
  );
}
