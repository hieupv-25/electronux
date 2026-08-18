"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/formatPrice";

export default function WishlistClient() {
  const { items, count, removeItem } = useWishlist();
  const { addToCart, adding } = useCart();

  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container" style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <h1 className="account-heading" style={{ fontSize: "28px", fontWeight: 700, color: "#001e50", marginBottom: 24 }}>
          Sản phẩm yêu thích
        </h1>

        <div className="account-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32 }}>
          <AccountSidebar activeHref="/account/wishlist" />

          <div className="account-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#001e50" }}>
                {count} Sản phẩm
              </span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginBottom: 28 }} />

            {items.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "#f8fafc",
                  borderRadius: 12,
                  border: "1px dashed #cbd5e1",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    color: "#e3000b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    margin: "0 auto 20px",
                  }}
                >
                  ♥
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                  Danh sách yêu thích của bạn đang trống
                </h3>
                <p style={{ color: "#64748b", fontSize: 14, maxWidth: 460, margin: "0 auto 24px", lineHeight: 1.6 }}>
                  Hãy khám phá các sản phẩm và nhấn biểu tượng trái tim để lưu lại những sản phẩm bạn quan tâm!
                </p>
                <Link
                  href="/"
                  style={{
                    display: "inline-block",
                    background: "#001e50",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: 14,
                    padding: "12px 28px",
                    borderRadius: 6,
                    textDecoration: "none",
                  }}
                >
                  Khám phá sản phẩm ngay
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 20,
                }}
              >
                {items.map((item) => {
                  const targetVariantId = item.productId || item.id;
                  const isAdding = adding === targetVariantId;
                  const itemUrl = item.url || (item.categorySlug ? `/thiet-bi/${item.categorySlug}/${item.slug}` : `#`);

                  return (
                    <div
                      key={item.id || item.productId}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        background: "#ffffff",
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        transition: "box-shadow 0.2s",
                      }}
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.productId || item.id)}
                        title="Xóa khỏi yêu thích"
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#fee2e2",
                          border: "none",
                          color: "#dc2626",
                          fontSize: 16,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2,
                        }}
                      >
                        ✕
                      </button>

                      {/* Product Image */}
                      <Link href={itemUrl} style={{ display: "block", marginBottom: 12, textAlign: "center" }}>
                        <Image
                          src={item.image || "/electrolux_logo.svg"}
                          alt={item.name}
                          width={200}
                          height={200}
                          style={{ objectFit: "contain", maxHeight: 180, width: "auto", margin: "0 auto" }}
                        />
                      </Link>

                      {/* Product Title */}
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 8, lineHeight: 1.4, height: 42, overflow: "hidden" }}>
                        <Link href={itemUrl} style={{ color: "inherit", textDecoration: "none" }}>
                          {item.name}
                        </Link>
                      </h3>

                      {/* Price */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16, marginTop: "auto" }}>
                        <strong style={{ fontSize: 18, color: "#e3000b", fontWeight: 700 }}>
                          {formatPrice(item.price)}
                        </strong>
                        {item.oldPrice > item.price && (
                          <span style={{ fontSize: 13, textDecoration: "line-through", color: "#94a3b8" }}>
                            {formatPrice(item.oldPrice)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button
                          onClick={() => addToCart(targetVariantId)}
                          disabled={isAdding}
                          style={{
                            width: "100%",
                            background: "#001e50",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 6,
                            padding: "10px 14px",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          {isAdding ? "Đang thêm..." : "🛒 Thêm vào giỏ hàng"}
                        </button>
                        <Link
                          href={itemUrl}
                          style={{
                            textAlign: "center",
                            background: "#f1f5f9",
                            color: "#334155",
                            borderRadius: 6,
                            padding: "8px 14px",
                            fontWeight: 600,
                            fontSize: 13,
                            textDecoration: "none",
                          }}
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer sections={footerSections} />
    </>
  );
}
