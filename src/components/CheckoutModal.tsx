"use client";

import { useState } from "react";
import Image from "next/image";
import { CartItem } from "./CartContext";

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  onSuccess: () => void;
};

type OrderResult = {
  id: string;
  trackingNumber: string;
  recipientName: string;
  phone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  items: CartItem[];
  createdAt: string;
};

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  onSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [name, setName] = useState("Nguyễn Văn A");
  const [phone, setPhone] = useState("0912345678");
  const [address, setAddress] = useState("123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh");
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: name,
          phone,
          shippingAddress: address,
          paymentMethod,
          items,
          totalAmount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderResult(data.order);
        setStep("success");
        onSuccess();
      } else {
        alert(data.message || "Thanh toán thất bại, vui lòng thử lại.");
        setStep("form");
      }
    } catch {
      alert("Lỗi kết nối tới máy chủ.");
      setStep("form");
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 640,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          position: "relative",
          animation: "modalFadeIn 0.3s ease",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#001e38",
            color: "#fff",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/electrolux_logo.svg" alt="Electrolux" width={110} height={26} />
            <span style={{ fontSize: "1.1rem", fontWeight: 600, borderLeft: "1px solid #ffffff40", paddingLeft: 10 }}>
              {step === "success" ? "Xác Nhận Đơn Hàng" : "Thanh Toán Đơn Hàng"}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "1.5rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* STEP 1: FORM INPUT & PAYMENT METHOD SELECTION */}
        {step === "form" && (
          <form onSubmit={handleCheckout} style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 16 }}>
              1. Thông tin giao hàng
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Họ và tên người nhận
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Địa chỉ giao hàng chi tiết
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 16 }}>
              2. Phương thức thanh toán
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                { id: "vnpay", label: "Cổng thanh toán VNPAY / Ví Điện Tử", desc: "Thanh toán qua quét mã QR VNPAY / Momo" },
                { id: "card", label: "Thẻ Quốc Tế (VISA, Mastercard, JCB)", desc: "Giao dịch an toàn tiêu chuẩn PCI DSS" },
                { id: "atm", label: "Thẻ ATM / Thẻ Nội Địa", desc: "Tất cả các ngân hàng tại Việt Nam" },
                { id: "cod", label: "Thanh toán khi nhận hàng (COD)", desc: "Kiểm tra hàng trước khi thanh toán" },
              ].map((method) => (
                <label
                  key={method.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    border: paymentMethod === method.id ? "2px solid #001e38" : "1px solid #e5e7eb",
                    borderRadius: 8,
                    background: paymentMethod === method.id ? "#f0f4f8" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: 18, height: 18, accentColor: "#001e38" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#111827" }}>{method.label}</div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{method.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Total Summary */}
            <div
              style={{
                background: "#f9fafb",
                padding: 16,
                borderRadius: 8,
                marginBottom: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: "1rem", fontWeight: 600, color: "#374151" }}>Tổng tiền thanh toán:</span>
              <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#001e38" }}>{formatVND(totalAmount)}</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: 16,
                background: "#001e38",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "1.05rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,30,56,0.3)",
              }}
            >
              XÁC NHẬN THANH TOÁN ({formatVND(totalAmount)})
            </button>
          </form>
        )}

        {/* STEP 2: PROCESSING SIMULATION */}
        {step === "processing" && (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div
              style={{
                width: 60,
                height: 60,
                border: "4px solid #e5e7eb",
                borderTopColor: "#001e38",
                borderRadius: "50%",
                margin: "0 auto 24px",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              Backend Đang Xử Lý Thanh Toán...
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#6b7280" }}>
              Đang kết nối cổng thanh toán, khởi tạo hóa đơn và cập nhật trạng thái đơn hàng.
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESS RESULT UI */}
        {step === "success" && orderResult && (
          <div style={{ padding: 32, textAlign: "center" }}>
            {/* Big Green Success Checkmark */}
            <div
              style={{
                width: 80,
                height: 80,
                background: "#10b981",
                color: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 10px 25px rgba(16,185,129,0.35)",
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#065f46", marginBottom: 8 }}>
              ✅ THANH TOÁN THÀNH CÔNG!
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#4b5563", marginBottom: 24 }}>
              Cảm ơn bạn đã mua sắm tại Electrolux. Đơn hàng của bạn đã được khởi tạo và xác nhận thanh toán thành công.
            </p>

            {/* Order details box */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #a7f3d0",
                borderRadius: 10,
                padding: 20,
                textAlign: "left",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.9rem", color: "#374151" }}>Mã đơn hàng:</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#065f46" }}>
                  {orderResult.trackingNumber}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", color: "#374151" }}>Trạng thái thanh toán:</span>
                <span
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 20,
                    letterSpacing: 0.5,
                  }}
                >
                  payment_status = PAID
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: "0.9rem", color: "#374151" }}>Phương thức thanh toán:</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111827" }}>
                  {orderResult.paymentMethod}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: "0.9rem", color: "#374151" }}>Người nhận hàng:</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111827" }}>
                  {orderResult.recipientName} ({orderResult.phone})
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: "0.9rem", color: "#374151" }}>Địa chỉ:</span>
                <span style={{ fontSize: "0.9rem", color: "#111827", maxWidth: "60%", textAlign: "right" }}>
                  {orderResult.shippingAddress}
                </span>
              </div>

              <div style={{ borderTop: "1px dashed #6ee7b7", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#065f46" }}>Tổng tiền đã thanh toán:</span>
                <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#065f46" }}>
                  {formatVND(orderResult.totalAmount)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                onClose();
                window.location.href = "/";
              }}
              style={{
                width: "100%",
                padding: 16,
                background: "#001e38",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "1.05rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              TIẾP TỤC MUA SẮM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
