"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/components/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

export default function WishlistPage() {
  const { data: session } = useSession();
  const { items, loading, toggleWishlist } = useWishlist();

  return (
    <>
      <Header navItems={navItems} />

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 16px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, color: "#5c6a7d", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 12, fontWeight: 700 }}>
              MyElectrolux
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: "2rem", color: "var(--elx-navy)" }}>Danh sách yêu thích</h1>
          </div>

          {!session?.user && (
            <div style={{ color: "var(--elx-gray-dark)", fontWeight: 600 }}>Bạn cần đăng nhập để xem danh sách yêu thích.</div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--elx-gray-dark)" }}>Đang tải...</div>
        ) : items.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--elx-border)", padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>♡</div>
            <h2 style={{ margin: "0 0 10px", color: "var(--elx-navy)" }}>Chưa có sản phẩm yêu thích</h2>
            <p style={{ margin: 0, color: "var(--elx-gray-dark)" }}>Hãy nhấn vào icon trái tim trên sản phẩm để lưu lại.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {items.map((item) => (
              <article key={item.id} style={{ background: "#fff", border: "1px solid var(--elx-border)", padding: 16 }}>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <button
                    type="button"
                    aria-label="Xóa khỏi yêu thích"
                    onClick={() => toggleWishlist(item.productId)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: 10,
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      border: "1px solid var(--elx-border)",
                      background: "#fff",
                      color: "var(--elx-red)",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    ♥
                  </button>

                  {item.image ? (
                    <Link href={item.url || "/"}> 
                      <Image src={item.image} alt={item.name} width={280} height={280} style={{ width: "100%", height: "auto", objectFit: "contain" }} />
                    </Link>
                  ) : (
                    <div style={{ height: 220, display: "grid", placeItems: "center", background: "#f4f6f8", color: "#8a97a8" }}>
                      No image
                    </div>
                  )}
                </div>

                <h3 style={{ margin: "0 0 10px", minHeight: 48, fontSize: "1rem", lineHeight: 1.5 }}>
                  <Link href={item.url || "/"} style={{ color: "var(--elx-navy)" }}>{item.name}</Link>
                </h3>

                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
                  <strong style={{ fontSize: "1.2rem", color: "var(--elx-navy)" }}>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                  </strong>
                  {item.oldPrice > item.price && (
                    <span style={{ fontSize: 14, color: "#8a97a8", textDecoration: "line-through" }}>
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.oldPrice)}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Link
                    href={item.url || "/"}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "12px 14px",
                      background: "var(--elx-navy)",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    Xem chi tiết
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(item.productId)}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid var(--elx-border)",
                      background: "#fff",
                      color: "var(--elx-navy)",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Bỏ lưu
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}
