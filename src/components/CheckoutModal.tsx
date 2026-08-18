"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

type QRData = {
  orderId: string;
  trackingNumber: string;
  paymentUrl: string;
  qrDataUrl: string;
  amount: number;
};

const POLL_INTERVAL = 3000; // 3 seconds
const QR_TIMEOUT = 300; // 5 minutes in seconds

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  onSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "processing" | "qr" | "success">("form");
  const [name, setName] = useState("Nguyễn Văn A");
  const [phone, setPhone] = useState("0912345678");
  const [address, setAddress] = useState("123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh");
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  // QR State
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [qrTimeLeft, setQrTimeLeft] = useState(QR_TIMEOUT);
  const [pollingStatus, setPollingStatus] = useState<"waiting" | "confirmed" | "failed">("waiting");
  const [simulating, setSimulating] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const handlePaymentConfirmed = useCallback((trackingNumber: string, amount: number) => {
    stopPolling();
    setPollingStatus("confirmed");
    setOrderResult({
      id: qrData?.orderId || "",
      trackingNumber,
      recipientName: name,
      phone,
      shippingAddress: address,
      paymentMethod: "VNPAY",
      paymentStatus: "PAID",
      orderStatus: "processing",
      totalAmount: amount,
      items,
      createdAt: new Date().toISOString(),
    });
    setTimeout(() => {
      onSuccess();
      setStep("success");
    }, 500);
  }, [qrData, name, phone, address, items, onSuccess, stopPolling]);

  const startPolling = useCallback((orderId: string) => {
    // Countdown timer
    setQrTimeLeft(QR_TIMEOUT);
    countdownRef.current = setInterval(() => {
      setQrTimeLeft((prev) => {
        if (prev <= 1) {
          stopPolling();
          setPollingStatus("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Polling for payment status
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/vnpay-status?orderId=${orderId}`);
        const data = await res.json();
        if (data.status === "paid") {
          handlePaymentConfirmed(data.trackingNumber, data.totalAmount);
        }
      } catch {
        // silently ignore network errors during polling
      }
    }, POLL_INTERVAL);
  }, [handlePaymentConfirmed, stopPolling]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setStep("form");
      setQrData(null);
      setQrTimeLeft(QR_TIMEOUT);
      setPollingStatus("waiting");
    }
    return () => stopPolling();
  }, [isOpen, stopPolling]);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");

    try {
      if (paymentMethod === "vnpay" || paymentMethod === "card" || paymentMethod === "atm") {
        // Step 1: Create VNPay order
        const createRes = await fetch("/api/checkout/vnpay-create", {
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

        const createData = await createRes.json();
        if (!createRes.ok || !createData.success || !createData.paymentUrl) {
          alert(createData.message || "Không thể khởi tạo thanh toán VNPay, vui lòng thử lại.");
          setStep("form");
          return;
        }

        // Step 2: Generate QR Code
        const qrRes = await fetch("/api/checkout/vnpay-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentUrl: createData.paymentUrl }),
        });

        const qrJson = await qrRes.json();
        if (!qrRes.ok || !qrJson.success || !qrJson.qrDataUrl) {
          // fallback: redirect as before if QR fails
          window.location.assign(createData.paymentUrl);
          return;
        }

        // Step 3: Show QR
        const newQrData: QRData = {
          orderId: createData.orderId,
          trackingNumber: createData.trackingNumber,
          paymentUrl: createData.paymentUrl,
          qrDataUrl: qrJson.qrDataUrl,
          amount: totalAmount,
        };
        setQrData(newQrData);
        setPollingStatus("waiting");
        setStep("qr");
        startPolling(createData.orderId);
        return;
      }

      // COD / other methods
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

  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCancelQR = () => {
    stopPolling();
    setQrData(null);
    setPollingStatus("waiting");
    setStep("form");
  };

  const handleSimulatePayment = async () => {
    if (!qrData?.orderId) return;
    setSimulating(true);
    try {
      const res = await fetch("/api/checkout/vnpay-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: qrData.orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handlePaymentConfirmed(data.trackingNumber, data.totalAmount);
      } else {
        alert(data.message || "Không thể mô phỏng thanh toán.");
      }
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setSimulating(false);
    }
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
          maxWidth: step === "qr" ? 480 : 640,
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
              {step === "success" ? "Xác Nhận Đơn Hàng" : step === "qr" ? "Quét Mã QR Thanh Toán" : "Thanh Toán Đơn Hàng"}
            </span>
          </div>
          <button
            onClick={step === "qr" ? handleCancelQR : onClose}
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

        {/* ── STEP 1: FORM ── */}
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
                { id: "vnpay", label: "Cổng thanh toán VNPAY / QR Code", desc: "Quét mã QR bằng app ngân hàng hoặc ví VNPay" },
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

        {/* ── STEP 2: PROCESSING ── */}
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
              Đang khởi tạo thanh toán...
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#6b7280" }}>
              Đang tạo đơn hàng và sinh mã QR, vui lòng chờ trong giây lát.
            </p>
          </div>
        )}

        {/* ── STEP 3: QR CODE ── */}
        {step === "qr" && qrData && (
          <div style={{ padding: "28px 24px", textAlign: "center" }}>
            {/* Amount badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#f0f4f8",
                borderRadius: 8,
                padding: "10px 20px",
                marginBottom: 20,
                border: "1px solid #d1dde8",
              }}
            >
              <span style={{ fontSize: "0.9rem", color: "#4b5563", fontWeight: 500 }}>Số tiền thanh toán:</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#001e38" }}>
                {formatVND(qrData.amount)}
              </span>
            </div>

            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: 18, lineHeight: 1.5 }}>
              Sử dụng <strong>app ngân hàng</strong> hoặc <strong>ví VNPay / MoMo</strong> để quét mã QR bên dưới
            </p>

            {/* QR Image */}
            <div
              style={{
                display: "inline-block",
                padding: 16,
                background: "#fff",
                border: "2px solid #001e38",
                borderRadius: 16,
                boxShadow: "0 8px 24px rgba(0,30,56,0.12)",
                marginBottom: 20,
                position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrData.qrDataUrl}
                alt="Mã QR thanh toán VNPay"
                width={220}
                height={220}
                style={{ display: "block" }}
              />
              {/* VNPay badge overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#001e38",
                  color: "#fff",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: "4px 12px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                }}
              >
                VNPAY · QR
              </div>
            </div>

            {/* Timer */}
            <div style={{ marginBottom: 20, marginTop: 8 }}>
              {qrTimeLeft > 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={qrTimeLeft < 60 ? "#dc2626" : "#6b7280"} strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span style={{
                    fontSize: "0.95rem",
                    color: qrTimeLeft < 60 ? "#dc2626" : "#6b7280",
                    fontWeight: qrTimeLeft < 60 ? 700 : 400,
                  }}>
                    Mã QR hết hạn sau: <strong style={{ fontVariantNumeric: "tabular-nums" }}>{formatTimeLeft(qrTimeLeft)}</strong>
                  </span>
                </div>
              ) : (
                <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.9rem" }}>
                  ⚠ Mã QR đã hết hạn. Vui lòng thử lại.
                </p>
              )}
            </div>

            {/* Polling status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 8,
                marginBottom: 20,
                background: pollingStatus === "waiting" ? "#fffbeb" : pollingStatus === "confirmed" ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${pollingStatus === "waiting" ? "#fcd34d" : pollingStatus === "confirmed" ? "#86efac" : "#fca5a5"}`,
              }}
            >
              {pollingStatus === "waiting" && (
                <>
                  <span style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "2px solid #f59e0b",
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "0.875rem", color: "#92400e", fontWeight: 500 }}>
                    Đang chờ xác nhận thanh toán từ VNPay...
                  </span>
                </>
              )}
              {pollingStatus === "confirmed" && (
                <span style={{ fontSize: "0.875rem", color: "#15803d", fontWeight: 600 }}>
                  ✅ Đã xác nhận thanh toán! Đang chuyển hướng...
                </span>
              )}
              {pollingStatus === "failed" && (
                <span style={{ fontSize: "0.875rem", color: "#dc2626", fontWeight: 600 }}>
                  ❌ Hết thời gian chờ. Vui lòng thử lại.
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* ⚠️ Sandbox only: Simulate payment confirmation */}
              <button
                onClick={handleSimulatePayment}
                disabled={simulating || pollingStatus !== "waiting"}
                style={{
                  padding: "13px 16px",
                  background: simulating ? "#d1fae5" : "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: simulating ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pollingStatus !== "waiting" ? 0.5 : 1,
                }}
              >
                {simulating ? (
                  <>
                    <span style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      border: "2px solid #fff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Đang xác nhận...
                  </>
                ) : "✅ Mô phỏng thanh toán thành công (Sandbox)"}
              </button>

              <a
                href={qrData.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: "12px 16px",
                  background: "#f0f4f8",
                  color: "#001e38",
                  border: "1px solid #d1dde8",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                🔗 Mở trang thanh toán VNPay (dự phòng)
              </a>
              <button
                onClick={handleCancelQR}
                style={{
                  padding: "10px 16px",
                  background: "none",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Hủy và chọn phương thức khác
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: SUCCESS ── */}
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
                  PAID
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
