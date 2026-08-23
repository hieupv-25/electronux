"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";

interface RegisteredProductItem {
  id: string;
  registrationId: string;
  productName: string;
  sku: string;
  pnc: string;
  img: string;
  category?: string;
  serialNumber?: string;
  purchaseDate?: string;
  registeredAt?: string;
  status?: string;
  warrantyMonths?: number;
}

export default function RegisteredProductsClient() {
  const [products, setProducts] = useState<RegisteredProductItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("electrolux_registered_products");
        if (raw) {
          setProducts(JSON.parse(raw));
        }
      } catch (err) {
        console.error("Lỗi khi đọc sản phẩm đã đăng ký:", err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container">
        <h1 className="account-heading">Sản phẩm đã đăng ký</h1>

        <div className="account-layout">
          <AccountSidebar activeHref="/account/registered-products" />

          <div className="account-content">
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0b2545" }}>
                {products.length} sản phẩm
              </span>
            </div>

            <div style={{ marginBottom: "32px" }}>
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
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  background: "#fff",
                }}
              >
                <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> ĐĂNG KÝ SẢN PHẨM MỚI
              </Link>
            </div>

            {/* List of Registered Products */}
            {isLoaded && products.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
                {products.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "24px",
                      background: "#fff",
                      display: "grid",
                      gridTemplateColumns: "130px 1fr auto",
                      gap: "24px",
                      alignItems: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Image */}
                    <div style={{ width: 130, height: 130, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRadius: 6, padding: 12 }}>
                      <Image
                        src={item.img || "/icon-water-heater-instant.svg"}
                        alt={item.productName}
                        width={100}
                        height={100}
                        style={{ objectFit: "contain", maxHeight: "100%" }}
                      />
                    </div>

                    {/* Details */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: 12, fontSize: "0.78rem", fontWeight: 700 }}>
                          ✓ {item.status || "Đang bảo hành"}
                        </span>
                        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          Mã đăng ký: <strong>{item.registrationId || item.id}</strong>
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0b2545", margin: "0 0 10px", lineHeight: 1.35 }}>
                        {item.productName}
                      </h3>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: "0.88rem", color: "#334155" }}>
                        <p style={{ margin: 0 }}><strong>Mã model:</strong> {item.sku}</p>
                        <p style={{ margin: 0 }}><strong>Số PNC:</strong> {item.pnc}</p>
                        <p style={{ margin: 0 }}><strong>Số serial:</strong> {item.serialNumber || "Chưa cập nhật"}</p>
                        <p style={{ margin: 0 }}><strong>Ngày mua:</strong> {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, borderLeft: "1px solid #f1f5f9", paddingLeft: 20 }}>
                      <Link
                        href="/support/book-service"
                        style={{
                          padding: "10px 18px",
                          background: "#0b2545",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          borderRadius: 4,
                          textDecoration: "none",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        YÊU CẦU DỊCH VỤ
                      </Link>
                      <Link
                        href="/support"
                        style={{
                          padding: "8px 18px",
                          background: "none",
                          border: "1px solid #cbd5e1",
                          color: "#0b2545",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          borderRadius: 4,
                          textDecoration: "none",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        TÌM HỖ TRỢ
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

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

