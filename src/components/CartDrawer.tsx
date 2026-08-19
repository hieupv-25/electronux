"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "./CartContext";
import CheckoutModal from "./CheckoutModal";

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "₫";
}

export default function CartDrawer() {
  const { data: session } = useSession();
  const {
    cart,
    isOpen,
    closeCart,
    loading,
    updateQty,
    removeItem,
    clearCart,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const items = cart?.items ?? [];

  /* Lock body scroll while drawer open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeCart]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 999,
          transition: "opacity 0.3s",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* ── Drawer Panel ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(480px, 100vw)",
          background: "#fff",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            background: "var(--elx-navy, #003057)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.15rem",
                letterSpacing: 0.3,
              }}
            >
              Giỏ hàng
            </span>
            {session?.user && items.length > 0 && (
              <span
                style={{
                  background: "#ff3a30",
                  color: "#fff",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                }}
              >
                {items.reduce((s, i) => s + i.quantity, 0)} sản phẩm
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Đóng giỏ hàng"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
          {!session?.user ? (
            /* Unauthenticated state */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 16,
                padding: 32,
                textAlign: "center",
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              </svg>
              <p
                style={{
                  color: "#111827",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                }}
              >
                Vui lòng đăng nhập
              </p>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("open-auth-modal", { detail: { view: "login" } })
                    );
                  }
                }}
                style={{
                  background: "var(--elx-navy, #003057)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 28px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 16,
                padding: 32,
                textAlign: "center",
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                }}
              >
                Giỏ hàng của bạn đang trống
              </p>
              <button
                onClick={closeCart}
                style={{
                  background: "var(--elx-navy, #003057)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 28px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            /* Cart items */
            <div style={{ display: "flex", flexDirection: "column" }}>
              {items.map((item) => {
                const img = item.variant.product.images[0]?.url;
                const priceNum = item.variant.price;
                const origNum = item.variant.originalPrice;
                const hasDiscount = origNum > priceNum;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "14px 20px",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {/* Image */}
                    {img ? (
                      <div
                        style={{
                          flexShrink: 0,
                          width: 80,
                          height: 80,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "#f8f9fa",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <Image
                          src={img}
                          alt={item.variant.product.name}
                          width={80}
                          height={80}
                          style={{ objectFit: "contain", width: "100%", height: "100%" }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          flexShrink: 0,
                          width: 80,
                          height: 80,
                          background: "#f3f4f6",
                          borderRadius: 10,
                        }}
                      />
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "0.92rem",
                          color: "#111827",
                          marginBottom: 2,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.variant.product.name}
                      </p>
                      {item.variant.variantName && (
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "#6b7280",
                            marginBottom: 6,
                          }}
                        >
                          {item.variant.variantName}
                        </p>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--elx-navy, #003057)",
                            fontSize: "0.98rem",
                          }}
                        >
                          {fmt(priceNum)}
                        </span>
                        {hasDiscount && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#9ca3af",
                              fontSize: "0.82rem",
                            }}
                          >
                            {fmt(origNum)}
                          </span>
                        )}
                      </div>

                      {/* Qty controls + delete */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            overflow: "hidden",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQty(item.id, item.quantity - 1)
                            }
                            style={{
                              width: 32,
                              height: 32,
                              border: "none",
                              background: "#f9fafb",
                              cursor: "pointer",
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              color: "#374151",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              minWidth: 36,
                              textAlign: "center",
                              fontWeight: 600,
                              fontSize: "0.92rem",
                              color: "#111827",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(item.id, item.quantity + 1)
                            }
                            style={{
                              width: 32,
                              height: 32,
                              border: "none",
                              background: "#f9fafb",
                              cursor: "pointer",
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              color: "#374151",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Xóa sản phẩm"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            padding: 4,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear all */}
              {items.length > 1 && (
                <div style={{ padding: "10px 20px" }}>
                  <button
                    onClick={clearCart}
                    disabled={loading}
                    style={{
                      background: "none",
                      border: "1px solid #fca5a5",
                      borderRadius: 6,
                      color: "#ef4444",
                      padding: "6px 14px",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer (totals + CTA) ── */}
        {items.length > 0 && (
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: "18px 24px 24px",
              background: "#fafafa",
            }}
          >
            {/* Savings */}
            {(cart?.savings ?? 0) > 0 && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: 8,
                  padding: "8px 14px",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                >
                  <path d="M20 12V22H4V12" />
                  <path d="M22 7H2v5h20V7z" />
                  <path d="M12 22V7" />
                  <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                </svg>
                <span style={{ color: "#15803d", fontSize: "0.88rem", fontWeight: 600 }}>
                  Tiết kiệm {fmt(cart!.savings)}
                </span>
              </div>
            )}

            {/* Subtotal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: "0.9rem",
                color: "#6b7280",
              }}
            >
              <span>Tạm tính:</span>
              <span>{fmt(cart?.subtotal ?? 0)}</span>
            </div>

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 18,
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "#111827",
              }}
            >
              <span>Tổng cộng:</span>
              <span style={{ color: "var(--elx-navy, #003057)" }}>
                {fmt(cart?.total ?? 0)}
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              style={{
                width: "100%",
                background: "var(--elx-navy, #003057)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 0",
                fontWeight: 700,
                fontSize: "1.05rem",
                cursor: "pointer",
                marginBottom: 10,
                transition: "opacity 0.2s",
              }}
            >
              Tiến hành thanh toán →
            </button>
            <Link
              href="/cart"
              onClick={closeCart}
              style={{
                display: "block",
                textAlign: "center",
                width: "100%",
                background: "#f3f4f6",
                color: "var(--elx-navy, #003057)",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                padding: "12px 0",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                marginBottom: 10,
              }}
            >
              Xem chi tiết giỏ hàng
            </Link>
            <button
              onClick={closeCart}
              style={{
                width: "100%",
                background: "transparent",
                color: "#6b7280",
                border: "none",
                padding: "8px 0",
                fontWeight: 500,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items}
        totalAmount={cart?.total ?? 0}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          closeCart();
          clearCart();
        }}
      />
    </>
  );
}
