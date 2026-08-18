"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";
import { formatPrice } from "@/lib/formatPrice";

type PaidServiceItem = {
  id: string;
  orderId: string;
  serviceName: string;
  sku: string;
  price: number;
  imageUrl: string;
  productType: string;
  purchasedAt: string;
  paymentStatus: "paid";
  status: "Đã xác nhận" | "Đang thực hiện" | "Hoàn thành";
};

const samplePaidServices: PaidServiceItem[] = [
  {
    id: "svc-1",
    orderId: "ELX-SVC-993821",
    serviceName: "Vệ sinh máy giặt sấy từ 10kg tại nhà",
    sku: "23675",
    price: 930000,
    imageUrl: "/dichvubaoduong.jpg",
    productType: "Máy giặt sấy",
    purchasedAt: "05/08/2026",
    paymentStatus: "paid",
    status: "Đã xác nhận",
  },
  {
    id: "svc-2",
    orderId: "ELX-SVC-774619",
    serviceName: "Dịch vụ vệ sinh máy hút ẩm",
    sku: "HA-0101-KD",
    price: 300000,
    imageUrl: "/dichvubaoduong.jpg",
    productType: "Máy hút ẩm",
    purchasedAt: "20/07/2026",
    paymentStatus: "paid",
    status: "Hoàn thành",
  },
];

export default function ServiceHistoryClient() {
  const [services, setServices] = useState<PaidServiceItem[]>(samplePaidServices);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("electrolux_paid_services");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices([...parsed, ...samplePaidServices]);
        }
      }
    } catch (e) {
      console.error("Error reading paid services from localStorage:", e);
    }
  }, []);

  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container">
        <h1 className="account-heading">Lịch sử dịch vụ bảo hành</h1>

        <div className="account-layout">
          <AccountSidebar activeHref="/account/service-history" />

          <div className="account-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#001e50" }}>
                {services.length} Dịch vụ đã thanh toán
              </span>
              <Link
                href="/services"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  background: "#001e50",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  borderRadius: "4px",
                  textDecoration: "none",
                  letterSpacing: "0.5px",
                }}
              >
                + MUA DỊCH VỤ MỚI
              </Link>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "28px" }}>
              Danh sách các gói dịch vụ bảo dưỡng, vệ sinh thiết bị chính hãng bạn đã thanh toán. Để dời hoặc hủy lịch hẹn, vui lòng{" "}
              <Link href="/support#lien-he" style={{ color: "#001e50", textDecoration: "underline", fontWeight: 600 }}>
                liên hệ bộ phận Chăm sóc khách hàng.
              </Link>
            </p>

            {/* List of Paid Services */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
              {services.map((svc) => (
                <div
                  key={svc.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    background: "#ffffff",
                    padding: "20px",
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ width: 90, height: 90, borderRadius: 6, overflow: "hidden", background: "#f8fafc", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                    <Image
                      src={svc.imageUrl}
                      alt={svc.serviceName}
                      width={90}
                      height={90}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#001e50", margin: 0 }}>
                        {svc.serviceName}
                      </h3>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        ✓ Đã thanh toán
                      </span>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 6px" }}>
                      Mã đơn dịch vụ: <strong>{svc.orderId}</strong> | SKU: <strong>{svc.sku}</strong>
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 12px" }}>
                      Ngày đặt mua: {svc.purchasedAt}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px dashed #e2e8f0" }}>
                      <span style={{ fontSize: "0.88rem", color: "#334155", fontWeight: 600 }}>
                        Trạng thái: <span style={{ color: "#0284c7" }}>{svc.status}</span>
                      </span>
                      <strong style={{ fontSize: "1.1rem", color: "#e3000b", fontWeight: 700 }}>
                        {formatPrice(svc.price)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
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
