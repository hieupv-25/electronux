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

type VNPayQRData = {
  orderId: string;
  trackingNumber: string;
  paymentUrl: string;
  qrDataUrl: string;
  amount: number;
};

type VietQRData = {
  orderId: string;
  trackingNumber: string;
  qrImageUrl: string;
  transferInfo: {
    bankId: string;
    bankName: string;
    bankShortName: string;
    accountNo: string;
    accountName: string;
    amount: number;
    transferContent: string;
  };
};

const POLL_INTERVAL = 2000; // 2 seconds
const QR_TIMEOUT = 600; // 10 minutes in seconds

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  onSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "processing" | "vnpay_qr" | "vietqr" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("vietqr");
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  // QR States
  const [vnpayData, setVnpayData] = useState<VNPayQRData | null>(null);
  const [vietqrData, setVietqrData] = useState<VietQRData | null>(null);
  const [qrTimeLeft, setQrTimeLeft] = useState(QR_TIMEOUT);
  const [pollingStatus, setPollingStatus] = useState<"waiting" | "confirmed" | "failed">("waiting");
  const [simulating, setSimulating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const handlePaymentConfirmed = useCallback(
    (trackingNumber: string, amount: number, currentMethod = "VIETQR") => {
      stopPolling();
      setPollingStatus("confirmed");
      setOrderResult({
        id: vietqrData?.orderId || vnpayData?.orderId || "",
        trackingNumber,
        recipientName: name,
        phone,
        shippingAddress: address,
        paymentMethod: currentMethod,
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
    },
    [vietqrData, vnpayData, name, phone, address, items, onSuccess, stopPolling]
  );

  const startPolling = useCallback(
    (orderId: string, checkUrl: string, currentMethod: string) => {
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

      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${checkUrl}?orderId=${orderId}`);
          const data = await res.json();
          if (data.status === "paid") {
            handlePaymentConfirmed(data.trackingNumber, data.totalAmount, currentMethod);
          }
        } catch {
          // silently ignore network errors during polling
        }
      }, POLL_INTERVAL);
    },
    [handlePaymentConfirmed, stopPolling]
  );

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setStep("form");
      setVnpayData(null);
      setVietqrData(null);
      setQrTimeLeft(QR_TIMEOUT);
      setPollingStatus("waiting");
      setCopiedKey(null);
    }
    return () => stopPolling();
  }, [isOpen, stopPolling]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");

    try {
      // 1. VIETQR Method
      if (paymentMethod === "vietqr") {
        const createRes = await fetch("/api/checkout/vietqr-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientName: name,
            phone,
            shippingAddress: address,
            totalAmount,
            items,
          }),
        });

        const createData = await createRes.json();
        if (!createRes.ok || !createData.success || !createData.qrImageUrl) {
          alert(createData.message || "Không thể khởi tạo mã VietQR, vui lòng thử lại.");
          setStep("form");
          return;
        }

        setVietqrData(createData);
        setPollingStatus("waiting");
        setStep("vietqr");
        startPolling(createData.orderId, "/api/checkout/vietqr-status", "VIETQR");
        return;
      }

      // 2. VNPAY / Card / ATM Method
      if (paymentMethod === "vnpay" || paymentMethod === "card" || paymentMethod === "atm") {
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

        // Generate QR Code
        const qrRes = await fetch("/api/checkout/vnpay-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentUrl: createData.paymentUrl }),
        });

        const qrJson = await qrRes.json();
        if (!qrRes.ok || !qrJson.success || !qrJson.qrDataUrl) {
          window.location.assign(createData.paymentUrl);
          return;
        }

        const newQrData: VNPayQRData = {
          orderId: createData.orderId,
          trackingNumber: createData.trackingNumber,
          paymentUrl: createData.paymentUrl,
          qrDataUrl: qrJson.qrDataUrl,
          amount: totalAmount,
        };
        setVnpayData(newQrData);
        setPollingStatus("waiting");
        setStep("vnpay_qr");
        startPolling(createData.orderId, "/api/checkout/vnpay-status", "VNPAY");
        return;
      }

      // 3. COD Method
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
    setVnpayData(null);
    setVietqrData(null);
    setPollingStatus("waiting");
    setStep("form");
  };

  // Simulating VietQR payment
  const handleSimulateVietQR = async () => {
    if (!vietqrData?.orderId) return;
    setSimulating(true);
    try {
      const res = await fetch("/api/checkout/vietqr-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: vietqrData.orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handlePaymentConfirmed(data.trackingNumber, data.totalAmount, "VIETQR");
      } else {
        alert(data.message || "Không thể xác nhận thanh toán.");
      }
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setSimulating(false);
    }
  };

  // Simulating VNPay payment
  const handleSimulateVNPay = async () => {
    if (!vnpayData?.orderId) return;
    setSimulating(true);
    try {
      const res = await fetch("/api/checkout/vnpay-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: vnpayData.orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handlePaymentConfirmed(data.trackingNumber, data.totalAmount, "VNPAY");
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
          borderRadius: 14,
          maxWidth: step === "vietqr" ? 560 : step === "vnpay_qr" ? 480 : 640,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          position: "relative",
          animation: "modalFadeIn 0.3s ease",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#001e38",
            color: "#fff",
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/electrolux_logo.svg" alt="Electrolux" width={110} height={26} />
            <span style={{ fontSize: "1.05rem", fontWeight: 600, borderLeft: "1px solid #ffffff40", paddingLeft: 10 }}>
              {step === "success"
                ? "Xác Nhận Đơn Hàng"
                : step === "vietqr"
                ? "Chuyển Khoản Qua VietQR"
                : step === "vnpay_qr"
                ? "Quét Mã QR VNPAY"
                : "Thanh Toán Đơn Hàng"}
            </span>
          </div>
          <button
            onClick={step === "vnpay_qr" || step === "vietqr" ? handleCancelQR : onClose}
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
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", marginBottom: 14 }}>
              1. Thông tin giao hàng
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Họ và tên người nhận
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
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
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0912345678"
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
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Địa chỉ giao hàng chi tiết
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
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

            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", marginBottom: 14 }}>
              2. Phương thức thanh toán
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                {
                  id: "vietqr",
                  label: "Chuyển khoản VietQR (Mọi Ngân Hàng / MoMo / Viettel Money)",
                  desc: "Quét mã QR tự động điền số tiền & nội dung, xác nhận chuyển khoản tức thì",
                },
                {
                  id: "vnpay",
                  label: "Cổng thanh toán VNPAY (Sandbox / Thật)",
                  desc: "Quét mã QR VNPAY hoặc thanh toán qua cổng điện tử",
                },
              ].map((method) => (
                <label
                  key={method.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    border: paymentMethod === method.id ? "2px solid #001e38" : "1px solid #e5e7eb",
                    borderRadius: 10,
                    background: paymentMethod === method.id ? "#f0f6ff" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
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
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#111827" }}>{method.label}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>{method.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Total Summary */}
            <div
              style={{
                background: "#f9fafb",
                padding: "14px 18px",
                borderRadius: 8,
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#374151" }}>Tổng tiền thanh toán:</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#001e38" }}>{formatVND(totalAmount)}</span>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: 15,
                background: "#001e38",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "1.05rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,30,56,0.3)",
              }}
            >
              XÁC NHẬN ĐẶT HÀNG ({formatVND(totalAmount)})
            </button>
          </form>
        )}

        {/* ── STEP 2: PROCESSING ── */}
        {step === "processing" && (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div
              style={{
                width: 54,
                height: 54,
                border: "4px solid #e5e7eb",
                borderTopColor: "#001e38",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              Đang tạo mã thanh toán...
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              Vui lòng chờ trong giây lát để hệ thống khởi tạo đơn hàng.
            </p>
          </div>
        )}

        {/* ── STEP 3A: VIETQR SCREEN ── */}
        {step === "vietqr" && vietqrData && (
          <div style={{ padding: "24px 20px" }}>
            {/* Header info */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#eff6ff",
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "1px solid #bfdbfe",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#1e40af", fontWeight: 700 }}>
                  🏛️ Chuyển khoản VietQR liên ngân hàng 24/7
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                Mở app ngân hàng bất kỳ (VCB, MB, Techcom, BIDV, MoMo...) và quét mã QR:
              </p>
            </div>

            {/* Layout: QR Image + Bank Details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 16,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              {/* QR Image Card */}
              <div
                style={{
                  background: "#fff",
                  border: "2px solid #001e38",
                  borderRadius: 14,
                  padding: 12,
                  textAlign: "center",
                  boxShadow: "0 4px 16px rgba(0,30,56,0.08)",
                  maxWidth: 320,
                  margin: "0 auto",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vietqrData.qrImageUrl}
                  alt="Mã VietQR Chuyển Khoản"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 8,
                    display: "block",
                  }}
                />
              </div>

              {/* Transfer Details Card */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
                  📋 Thông tin chuyển khoản thủ công (Nếu không quét được QR):
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b" }}>Ngân hàng:</span>
                    <strong style={{ color: "#0f172a" }}>{vietqrData.transferInfo.bankName} ({vietqrData.transferInfo.bankShortName})</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b" }}>Chủ tài khoản:</span>
                    <strong style={{ color: "#0f172a" }}>{vietqrData.transferInfo.accountName}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b" }}>Số tài khoản:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <strong style={{ color: "#001e38", fontSize: "0.95rem" }}>{vietqrData.transferInfo.accountNo}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(vietqrData.transferInfo.accountNo, "acc")}
                        style={{
                          background: copiedKey === "acc" ? "#10b981" : "#e2e8f0",
                          color: copiedKey === "acc" ? "#fff" : "#334155",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 6px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {copiedKey === "acc" ? "✓ Đã chép" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b" }}>Số tiền:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <strong style={{ color: "#b91c1c", fontSize: "1rem" }}>{formatVND(vietqrData.transferInfo.amount)}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(vietqrData.transferInfo.amount), "amount")}
                        style={{
                          background: copiedKey === "amount" ? "#10b981" : "#e2e8f0",
                          color: copiedKey === "amount" ? "#fff" : "#334155",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 6px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {copiedKey === "amount" ? "✓ Đã chép" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1px dashed #f59e0b",
                      borderRadius: 6,
                      padding: "8px 10px",
                      marginTop: 4,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ color: "#92400e", fontSize: "0.78rem", display: "block" }}>Nội dung chuyển khoản (Bắt buộc):</span>
                      <strong style={{ color: "#b45309", fontSize: "1rem", letterSpacing: 0.5 }}>{vietqrData.transferInfo.transferContent}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(vietqrData.transferInfo.transferContent, "content")}
                      style={{
                        background: copiedKey === "content" ? "#10b981" : "#f59e0b",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {copiedKey === "content" ? "✓ Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown & Status */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
                Mã QR có hiệu lực trong: <strong style={{ color: "#0f172a" }}>{formatTimeLeft(qrTimeLeft)}</strong>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 20,
                  background: pollingStatus === "waiting" ? "#fef3c7" : "#dcfce7",
                  border: `1px solid ${pollingStatus === "waiting" ? "#fde68a" : "#86efac"}`,
                }}
              >
                {pollingStatus === "waiting" ? (
                  <>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: "2px solid #d97706",
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    <span style={{ fontSize: "0.82rem", color: "#92400e", fontWeight: 600 }}>
                      Đang chờ hệ thống ghi nhận chuyển khoản...
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: "0.82rem", color: "#166534", fontWeight: 700 }}>
                    ✅ Đã nhận được chuyển khoản! Đang chuyển hướng...
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                onClick={handleCancelQR}
                style={{
                  padding: "10px 16px",
                  background: "none",
                  color: "#64748b",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                ← Quay lại chọn phương thức khác
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3B: VNPAY QR SCREEN ── */}
        {step === "vnpay_qr" && vnpayData && (
          <div style={{ padding: "28px 24px", textAlign: "center" }}>
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
              <span style={{ fontSize: "0.9rem", color: "#4b5563", fontWeight: 500 }}>Số tiền:</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#001e38" }}>
                {formatVND(vnpayData.amount)}
              </span>
            </div>

            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: 18 }}>
              Quét mã QR bên dưới bằng app ngân hàng hoặc ví VNPay:
            </p>

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
                src={vnpayData.qrDataUrl}
                alt="Mã QR VNPay"
                width={220}
                height={220}
                style={{ display: "block" }}
              />
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
                  padding: "4px 12px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                }}
              >
                VNPAY · QR
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 20,
                  background: pollingStatus === "waiting" ? "#fef3c7" : "#dcfce7",
                  border: `1px solid ${pollingStatus === "waiting" ? "#fde68a" : "#86efac"}`,
                }}
              >
                {pollingStatus === "waiting" ? (
                  <>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: "2px solid #d97706",
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    <span style={{ fontSize: "0.82rem", color: "#92400e", fontWeight: 600 }}>
                      Đang chờ hệ thống ghi nhận thanh toán tự động...
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: "0.82rem", color: "#166534", fontWeight: 700 }}>
                    ✅ Đã nhận được thanh toán! Đang chuyển hướng...
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href={vnpayData.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: "12px 16px",
                  background: "#f0f4f8",
                  color: "#001e38",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                🔗 Mở trang thanh toán VNPay
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
                ← Quay lại chọn phương thức khác
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: SUCCESS ── */}
        {step === "success" && orderResult && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div
              style={{
                width: 76,
                height: 76,
                background: "#10b981",
                color: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: "0 10px 25px rgba(16,185,129,0.35)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#065f46", marginBottom: 6 }}>
              ✅ ĐẶT HÀNG THÀNH CÔNG!
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: 20 }}>
              Cảm ơn bạn đã mua sắm tại Electrolux. Đơn hàng của bạn đã được ghi nhận vào hệ thống.
            </p>

            {/* Order details */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #a7f3d0",
                borderRadius: 10,
                padding: 18,
                textAlign: "left",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Mã đơn hàng:</span>
                <strong style={{ fontSize: "0.95rem", color: "#065f46" }}>{orderResult.trackingNumber}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Phương thức:</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{orderResult.paymentMethod}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Người nhận:</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
                  {orderResult.recipientName} ({orderResult.phone})
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Địa chỉ giao hàng:</span>
                <span style={{ fontSize: "0.85rem", color: "#111827", maxWidth: "60%", textAlign: "right" }}>
                  {orderResult.shippingAddress}
                </span>
              </div>

              <div style={{ borderTop: "1px dashed #6ee7b7", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#065f46" }}>Tổng tiền:</span>
                <strong style={{ fontSize: "1.15rem", color: "#065f46" }}>{formatVND(orderResult.totalAmount)}</strong>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: 14,
                background: "#001e38",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              HOÀN TẤT & TIẾP TỤC MUA SẮM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
