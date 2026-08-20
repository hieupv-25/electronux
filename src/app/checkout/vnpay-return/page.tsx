"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

function VNPayReturnContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "failed";
  const orderId = searchParams.get("orderId") || "";
  const txnNo = searchParams.get("txnNo") || "";
  const responseCode = searchParams.get("code") || "";

  const isSuccess = status === "success";

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
        padding: "40px 32px",
        textAlign: "center",
      }}
    >
      {isSuccess ? (
        <>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#dcfce7",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            Thanh toán thành công!
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.975rem", marginBottom: 32, lineHeight: 1.6 }}>
            Cảm ơn bạn đã mua sắm tại Electrolux. Đơn hàng của bạn đã được hệ thống tự động xác nhận thanh toán thành công qua <strong>VNPay</strong>.
          </p>

          <div
            style={{
              background: "#f1f5f9",
              borderRadius: 12,
              padding: "20px 24px",
              textAlign: "left",
              marginBottom: 32,
              fontSize: "0.925rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#64748b" }}>Phương thức:</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Cổng thanh toán VNPay</span>
            </div>
            {orderId && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#64748b" }}>Mã đơn hàng:</span>
                <span style={{ fontWeight: 700, color: "#0b2545" }}>{orderId}</span>
              </div>
            )}
            {txnNo && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#64748b" }}>Mã giao dịch VNPay:</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{txnNo}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#64748b" }}>Trạng thái đơn hàng:</span>
              <span style={{ fontWeight: 700, color: "#2563eb", background: "#dbeafe", padding: "2px 8px", borderRadius: 4 }}>
                📦 Đang chuẩn bị
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Trạng thái thanh toán:</span>
              <span style={{ fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 4 }}>
                ✅ Đã thanh toán (Code 00)
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="12" />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            Thanh toán không thành công
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.975rem", marginBottom: 32, lineHeight: 1.6 }}>
            Giao dịch qua VNPay đã bị hủy hoặc không thành công (Mã lỗi: {responseCode || "Hủy giao dịch"}). Quý khách vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
        </>
      )}

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/account/orders"
          style={{
            background: "#0b2545",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          Xem danh sách đơn hàng
        </Link>
        <Link
          href="/"
          style={{
            background: "#e2e8f0",
            color: "#1e293b",
            padding: "12px 24px",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <>
      <Header navItems={navItems} />

      <main style={{ minHeight: "65vh", background: "#f8fafc", padding: "60px 16px" }}>
        <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Đang kiểm tra kết quả giao dịch VNPay...</div>}>
          <VNPayReturnContent />
        </Suspense>
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}
