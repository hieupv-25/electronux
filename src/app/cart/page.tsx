"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartContext";

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " ₫";
}

export default function CartPage() {
  const { cart, updateQty, removeItem, addToCart, loading } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [showExtraServices, setShowExtraServices] = useState(true);
  const [warrantyYears, setWarrantyYears] = useState("2");
  const [addedWarranty, setAddedWarranty] = useState(false);
  const [addedOldItem, setAddedOldItem] = useState(false);
  const [addedAddons, setAddedAddons] = useState<Record<string, boolean>>({});

  const items = cart?.items ?? [];

  const toggleAddon = (id: string, price: number) => {
    setAddedAddons((prev) => {
      const isAdded = !!prev[id];
      return { ...prev, [id]: !isAdded };
    });
  };

  // Calculate extra costs (warranty, addons)
  const extraCosts =
    (addedWarranty ? 1820000 : 0) +
    Object.entries(addedAddons).reduce((acc, [id, added]) => {
      if (!added) return acc;
      if (id === "dem") return acc + 166000;
      if (id === "gia") return acc + 2028000;
      if (id === "chande") return acc + 450000;
      return acc;
    }, 0);

  const subtotal = (cart?.subtotal ?? 12543000) + extraCosts;
  const savings = cart?.savings ?? 3053000;
  const total = (cart?.total ?? 9490000) + extraCosts;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "var(--font-geist-sans), sans-serif", color: "#111827" }}>
      {/* ================= 1. TOP HEADER ================= */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Back button */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#111827", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}
          >
            ‹ Quay lại
          </Link>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image src="/electrolux_logo.svg" alt="Electrolux" width={140} height={34} priority />
          </Link>

          {/* Location picker */}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#374151",
            }}
          >
            <svg width="14" height="16" viewBox="0 0 10 14" fill="none">
              <path
                d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 115 3.5a1.5 1.5 0 010 3z"
                fill="#111827"
              />
            </svg>
            Chọn vị trí của bạn
          </button>
        </div>

        {/* Sub-bar */}
        <div style={{ background: "#001e38", color: "#fff", padding: "10px 0", fontSize: "0.9rem", fontWeight: 500 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              🚚 Miễn phí vận chuyển
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              🛠️ Miễn phí lắp đặt
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              💳 Trả góp 0%
            </span>
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN LAYOUT ================= */}
      <main style={{ display: "grid", gridTemplateColumns: "1fr 420px", minHeight: "calc(100vh - 120px)" }}>
        {/* ── LEFT COLUMN ── */}
        <div style={{ padding: "40px 60px 80px 80px" }}>
          {items.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 12 }}>Giỏ hàng của bạn đang trống</h2>
              <p style={{ color: "#6b7280", marginBottom: 24 }}>Hãy chọn sản phẩm bạn yêu thích để thêm vào giỏ hàng.</p>
              <Link
                href="/"
                style={{
                  background: "#001e38",
                  color: "#fff",
                  padding: "12px 28px",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Product item card */}
              {items.map((item) => {
                const img = item.variant.product.images[0]?.url || "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-2.jpg";
                const priceNum = item.variant.price;
                const origNum = item.variant.originalPrice || priceNum;

                return (
                  <div key={item.id} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 32 }}>
                    {/* Item row */}
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 24, alignItems: "start" }}>
                      {/* Image + gallery thumbs */}
                      <div>
                        <div style={{ width: 140, height: 140, position: "relative", background: "#fff" }}>
                          <Image
                            src={img}
                            alt={item.variant.product.name}
                            width={140}
                            height={140}
                            style={{ objectFit: "contain", width: "100%", height: "100%" }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <div style={{ width: 32, height: 32, border: "1px solid #001e38", borderRadius: 4, padding: 2, cursor: "pointer" }}>
                            <Image src={img} alt="thumb" width={28} height={28} style={{ objectFit: "contain" }} />
                          </div>
                        </div>
                      </div>

                      {/* Product details */}
                      <div>
                        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", lineHeight: 1.4, marginBottom: 6 }}>
                          {item.variant.product.name}
                        </h2>
                        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: 16 }}>
                          {item.variant.sku}
                        </p>

                        {/* Quantity selector */}
                        <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 4, overflow: "hidden" }}>
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            disabled={loading}
                            style={{ width: 36, height: 36, border: "none", background: "#fff", cursor: "pointer", fontSize: "1.1rem" }}
                          >
                            −
                          </button>
                          <span style={{ minWidth: 40, textAlign: "center", fontWeight: 600, fontSize: "0.95rem" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            disabled={loading}
                            style={{ width: 36, height: 36, border: "none", background: "#fff", cursor: "pointer", fontSize: "1.1rem" }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price & Delete */}
                      <div style={{ textAlign: "right" }}>
                        {/* Delete button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={loading}
                          aria-label="Xóa sản phẩm"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", marginBottom: 16 }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>

                        <div>
                          <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", display: "block" }}>
                            {fmt(priceNum)}
                          </span>
                          {origNum > priceNum && (
                            <span style={{ fontSize: "0.88rem", textDecoration: "line-through", color: "#9ca3af", display: "block" }}>
                              {fmt(origNum)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dịch vụ thêm Section */}
                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
                      <button
                        onClick={() => setShowExtraServices(!showExtraServices)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.92rem",
                          color: "#111827",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 12,
                        }}
                      >
                        Dịch vụ thêm {showExtraServices ? "˄" : "˅"}
                      </button>

                      {showExtraServices && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingLeft: 4 }}>
                          {/* 1. Lắp đặt cơ bản */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M9 12l2 2 4-4" />
                              </svg>
                              <span>Công lắp đặt cơ bản</span>
                            </div>
                            <div>
                              <span style={{ textDecoration: "line-through", color: "#9ca3af", marginRight: 8 }}>300.000 đ</span>
                              <span style={{ fontWeight: 600, color: "#111827" }}>Miễn phí</span>
                            </div>
                          </div>

                          {/* 2. Gia hạn bảo hành */}
                          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 12, alignItems: "center" }}>
                              <div style={{ width: 36, height: 36, background: "#f8fafc", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                🛡️
                              </div>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: "0.92rem", display: "block", marginBottom: 6 }}>Gia hạn bảo hành</span>
                                <select
                                  value={warrantyYears}
                                  onChange={(e) => setWarrantyYears(e.target.value)}
                                  style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 10px", fontSize: "0.88rem", background: "#fff" }}
                                >
                                  <option value="2">+2 năm</option>
                                  <option value="3">+3 năm</option>
                                </select>
                                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>Bạn có thể mua gia hạn bảo hành</p>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <button
                                  onClick={() => setAddedWarranty(!addedWarranty)}
                                  style={{
                                    border: "1px solid #001e38",
                                    background: addedWarranty ? "#001e38" : "#fff",
                                    color: addedWarranty ? "#fff" : "#001e38",
                                    borderRadius: 4,
                                    padding: "6px 20px",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    marginBottom: 6,
                                  }}
                                >
                                  {addedWarranty ? "ĐÃ THÊM" : "THÊM"}
                                </button>
                                <span style={{ fontSize: "0.95rem", fontWeight: 700, display: "block" }}>1.820.000 ₫</span>
                              </div>
                            </div>
                          </div>

                          {/* 3. Thu sản phẩm cũ */}
                          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 12, alignItems: "center" }}>
                              <div style={{ width: 36, height: 36, background: "#ecfdf5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                ♻️
                              </div>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: "0.92rem", display: "block" }}>Thu sản phẩm cũ</span>
                                <p style={{ fontSize: "0.82rem", color: "#166534", margin: "2px 0" }}>
                                  Tiết kiệm tới 1 triệu khi mua sản phẩm mới.
                                </p>
                                <span style={{ fontSize: "0.78rem", color: "#6b7280", display: "block" }}>
                                  *Chỉ áp dụng cho một số tỉnh/thành phố. <a href="#" style={{ color: "#001e38", textDecoration: "underline" }}>Cách thức hoạt động?</a>
                                </span>
                              </div>
                              <button
                                onClick={() => setAddedOldItem(!addedOldItem)}
                                style={{
                                  border: "1px solid #001e38",
                                  background: addedOldItem ? "#001e38" : "#fff",
                                  color: addedOldItem ? "#fff" : "#001e38",
                                  borderRadius: 4,
                                  padding: "6px 20px",
                                  fontWeight: 700,
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                }}
                              >
                                {addedOldItem ? "ĐÃ THÊM" : "THÊM"}
                              </button>
                            </div>
                          </div>

                          {/* 4. Addon deals ("GIẢM GIÁ") */}
                          <div style={{ marginTop: 12 }}>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e11d48", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                              GIẢM GIÁ
                            </span>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                              {/* Addon 1 */}
                              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div>
                                  <span style={{ background: "#e11d48", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: 2 }}>GIẢM GIÁ</span>
                                  <p style={{ fontSize: "0.82rem", fontWeight: 600, margin: "8px 0 4px" }}>Đệm chống rung máy giặt E4WHPA02</p>
                                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>E4WHPA02</span>
                                </div>
                                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <button
                                    onClick={() => toggleAddon("dem", 166000)}
                                    style={{ border: "1px solid #001e38", background: addedAddons["dem"] ? "#001e38" : "#fff", color: addedAddons["dem"] ? "#fff" : "#001e38", borderRadius: 4, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                                  >
                                    {addedAddons["dem"] ? "ĐÃ THÊM" : "THÊM"}
                                  </button>
                                  <div style={{ textAlign: "right" }}>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "block" }}>166.000 ₫</span>
                                    <span style={{ fontSize: "0.75rem", textDecoration: "line-through", color: "#9ca3af" }}>200.000 ₫</span>
                                  </div>
                                </div>
                              </div>

                              {/* Addon 2 */}
                              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div>
                                  <span style={{ background: "#e11d48", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: 2 }}>GIẢM GIÁ</span>
                                  <p style={{ fontSize: "0.82rem", fontWeight: 600, margin: "8px 0 4px" }}>Giá đỡ máy sấy có khay kéo</p>
                                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>STA9GW</span>
                                </div>
                                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <button
                                    onClick={() => toggleAddon("gia", 2028000)}
                                    style={{ border: "1px solid #001e38", background: addedAddons["gia"] ? "#001e38" : "#fff", color: addedAddons["gia"] ? "#fff" : "#001e38", borderRadius: 4, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                                  >
                                    {addedAddons["gia"] ? "ĐÃ THÊM" : "THÊM"}
                                  </button>
                                  <div style={{ textAlign: "right" }}>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "block" }}>2.028.000 ₫</span>
                                    <span style={{ fontSize: "0.75rem", textDecoration: "line-through", color: "#9ca3af" }}>2.400.000 ₫</span>
                                  </div>
                                </div>
                              </div>

                              {/* Addon 3 */}
                              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div>
                                  <span style={{ background: "#e11d48", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: 2 }}>GIẢM GIÁ</span>
                                  <p style={{ fontSize: "0.82rem", fontWeight: 600, margin: "8px 0 4px" }}>Chân đế máy giặt PN333</p>
                                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>TH-F00201</span>
                                </div>
                                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <button
                                    onClick={() => toggleAddon("chande", 450000)}
                                    style={{ border: "1px solid #001e38", background: addedAddons["chande"] ? "#001e38" : "#fff", color: addedAddons["chande"] ? "#fff" : "#001e38", borderRadius: 4, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                                  >
                                    {addedAddons["chande"] ? "ĐÃ THÊM" : "THÊM"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Gift section */}
              <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: 20 }}>
                  <div style={{ width: 60, height: 60, background: "#fff", borderRadius: 6, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <Image src="https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-4.jpg" alt="Gift" width={60} height={60} style={{ objectFit: "contain" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: 700 }}>Bông sấy quần áo</span>
                      <span style={{ background: "#001e38", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                        🎁 Quà tặng kèm
                      </span>
                    </div>
                    <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>1174611 • Số: 1</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "0.82rem", display: "block" }}>150.000 đ</span>
                    <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>Miễn phí</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", marginBottom: 14 }}>
                  Những phương pháp thanh toán hợp lệ
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: "0.85rem", color: "#4b5563", marginBottom: 16 }}>
                  <div>✓ Thẻ quốc tế</div>
                  <div>✓ Thẻ ATM / Thẻ ngân hàng khác</div>
                  <div>✓ Thanh toán khi giao hàng (Không áp dụng với Dịch vụ thu phí)</div>
                  <div>✓ Trả góp</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8" }}>VISA</span>
                  <span style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700, color: "#ea580c" }}>Mastercard</span>
                  <span style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700, color: "#0284c7" }}>JCB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (SUMMARY SIDEBAR) ── */}
        <div style={{ background: "#f4f6f8", borderLeft: "1px solid #e5e7eb", padding: "40px 48px 80px 48px" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 28 }}>
            GIỎ HÀNG
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#4b5563" }}>
              <span>Tổng phụ</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>{fmt(subtotal)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#ef4444" }}>
              <span>Tiết kiệm</span>
              <span style={{ fontWeight: 600 }}>- {fmt(savings)}</span>
            </div>

            <div style={{ borderTop: "1px solid #d1d5db", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#111827" }}>Tổng cộng</span>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#001e38" }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Big CTA */}
          <button
            style={{
              width: "100%",
              background: "#001e38",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "16px 0",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: 0.5,
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            TIẾN HÀNH THANH TOÁN
          </button>

          {/* PCI DSS guarantee badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "#166534", marginBottom: 36 }}>
            <span>🔒</span>
            <span><strong>PCI DSS</strong> Giao dịch của bạn luôn được đảm bảo an toàn</span>
          </div>

          {/* Coupon Accordion */}
          <div style={{ borderTop: "1px solid #d1d5db", paddingTop: 20 }}>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500, color: "#4b5563", display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}
            >
              <span>⚙</span> Điều khoản và điều kiện
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Nhập mã giảm giá"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  flex: 1,
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  padding: "10px 14px",
                  fontSize: "0.9rem",
                  background: "#fff",
                  outline: "none",
                }}
              />
              <button
                style={{
                  background: "#001e38",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "0 18px",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                ÁP DỤNG
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating help widget at bottom right */}
      <button
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "#fff",
          color: "#111827",
          border: "1px solid #d1d5db",
          borderRadius: 24,
          padding: "10px 18px",
          fontWeight: 600,
          fontSize: "0.88rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 100,
        }}
      >
        💬 Cần trợ giúp?
      </button>
    </div>
  );
}
