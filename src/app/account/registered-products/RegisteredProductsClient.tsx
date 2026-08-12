"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";

export default function RegisteredProductsClient() {
  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container">
        <h1 className="account-heading">Sản phẩm đã đăng ký</h1>

        <div className="account-layout">
          <AccountSidebar activeHref="/account/registered-products" />

          <div className="account-content">
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0b2545" }}>
                0 sản phẩm
              </span>
            </div>

            <div style={{ marginBottom: "36px" }}>
              <Link
                href="/support"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  border: "1.5px solid #0b2545",
                  borderRadius: "2px",
                  color: "#0b2545",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> ĐĂNG KÝ SẢN PHẨM MỚI
              </Link>
            </div>

            {/* Trade-In Banner */}
            <div
              style={{
                position: "relative",
                borderRadius: "4px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                color: "#fff",
                padding: "48px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('/banners/refrigerators.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.25,
                  filter: "brightness(0.5)",
                }}
              />

              <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
                <div style={{ marginBottom: "16px", display: "inline-block" }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.19 9.5M11 19h8.2a1.8 1.8 0 0 0 1.567-.879 1.787 1.787 0 0 0 .007-1.787L17 10" />
                    <path d="m11 19-3-3m3 3-3 3M7 9.5l3.5-6.062a1.8 1.8 0 0 1 1.57-.88 1.78 1.78 0 0 1 1.567.88L17 10" />
                    <path d="m7 9.5-3.5 6M17 10l3.5 6.5M17 10l-3 3m3-3 3 3" />
                  </svg>
                </div>

                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase" }}>
                  ĐỔI CŨ LẤY MỚI TIẾT KIỆM
                </h2>

                <p style={{ fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "8px", fontWeight: 500 }}>
                  Đổi sản phẩm cũ của bạn lấy sản phẩm mới để được giảm thêm đến 5% giá bán.
                </p>

                <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "24px" }}>
                  Ưu đãi này có hiệu lực đến 31/12/2026
                </p>

                <Link
                  href="/support"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    letterSpacing: "0.5px",
                    textDecoration: "none",
                  }}
                >
                  TÌM HIỂU THÊM <span style={{ fontSize: "0.9rem" }}>❯</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer sections={footerSections} />
    </>
  );
}
