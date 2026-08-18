"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";
import { formatPrice } from "@/lib/formatPrice";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variant: {
    sku: string;
    product: {
      name: string;
      slug: string;
      images: { url: string }[];
    };
  };
};

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  recipientName?: string;
  phone?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  paymentMethod?: string;
  items: OrderItem[];
};

export default function OrdersClient() {
  const { data: session } = useSession();

  const user = session?.user;
  const firstName = user?.firstName || "viv";
  const lastName = user?.lastName || "vietttishnl";
  const fullName = user?.name || `${firstName} ${lastName}`.trim();

  // Tab Selection: "current"
  const [activeTab] = useState<"current">("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sample mock data for paid orders only
  const sampleOrders: Record<string, Order[]> = {
    current: [
      {
        id: "ELX-9938210",
        totalAmount: 17990000,
        status: "shipping",
        paymentStatus: "paid",
        createdAt: "2026-08-05T14:30:00Z",
        recipientName: fullName,
        phone: "0987 654 321",
        shippingAddress: "123 Đường Nguyễn Trãi, Phường Thanh Xuân Trung, Quận Thanh Xuân, Hà Nội",
        trackingNumber: "ELX-VN-2026-9938210",
        paymentMethod: "Thẻ ATM / Internet Banking (VNPAY)",
        items: [
          {
            id: "item-2",
            quantity: 1,
            price: 17990000,
            variant: {
              sku: "EHI8278BF",
              product: {
                name: "Bếp từ âm Electrolux 80cm 2 vùng nấu S500",
                slug: "ehi8278bf",
                images: [
                  {
                    url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/bep-nau/EHI8278BF.jpg",
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let loadedOrders: Order[] = [];
        const res = await fetch(`/api/account/orders?type=${activeTab}&search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          const paidOrders = (data.orders || []).filter((o: Order) => o.paymentStatus === "paid");
          if (paidOrders.length > 0) {
            loadedOrders = paidOrders.map((o: Order) => ({
              ...o,
              recipientName: o.recipientName || fullName,
              phone: o.phone || "0987 654 321",
              shippingAddress: o.shippingAddress || "123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội",
              trackingNumber: o.trackingNumber || `ELX-VN-2026-${o.id.replace(/[^0-9]/g, "") || "9938210"}`,
              paymentMethod: o.paymentMethod || "Thẻ ATM / Internet Banking (VNPAY)",
            }));
          }
        }

        // Merge with localStorage orders
        try {
          const localStored = JSON.parse(localStorage.getItem("electrolux_user_orders") || "[]");
          if (Array.isArray(localStored) && localStored.length > 0) {
            const combined = [...localStored, ...loadedOrders, ...(sampleOrders[activeTab] || [])];
            const uniqueMap = new Map<string, Order>();
            combined.forEach((o) => {
              if (o.id && !uniqueMap.has(o.id)) {
                uniqueMap.set(o.id, {
                  ...o,
                  recipientName: o.recipientName || fullName,
                  phone: o.phone || "0987 654 321",
                  shippingAddress: o.shippingAddress || "123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội",
                  trackingNumber: o.trackingNumber || `ELX-VN-2026-${o.id.replace(/[^0-9]/g, "") || "9938210"}`,
                  paymentMethod: o.paymentMethod || "Thẻ ATM / Internet Banking (VNPAY)",
                });
              }
            });
            loadedOrders = Array.from(uniqueMap.values());
          }
        } catch {}

        if (loadedOrders.length === 0) {
          loadedOrders = (sampleOrders[activeTab] || []).filter((o) => o.paymentStatus === "paid");
        }

        if (searchQuery) {
          setOrders(
            loadedOrders.filter(
              (o) =>
                o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.items.some((i) =>
                  i.variant.product.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            )
          );
        } else {
          setOrders(loadedOrders);
        }
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, searchQuery, fullName]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="orders-badge orders-badge--warning">Chờ xử lý</span>;
      case "processing":
        return <span className="orders-badge orders-badge--info">Đang chuẩn bị</span>;
      case "shipping":
        return <span className="orders-badge orders-badge--info">Đang giao hàng</span>;
      case "completed":
        return <span className="orders-badge orders-badge--success">Hoàn thành</span>;
      case "cancelled":
        return <span className="orders-badge orders-badge--danger">Đã hủy</span>;
      default:
        return <span className="orders-badge orders-badge--info">Đang xử lý</span>;
    }
  };

  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container">
        <h1 className="account-heading">Lịch sử mua hàng</h1>

        <div className="account-layout">
          {/* ====== SIDEBAR ====== */}
          <AccountSidebar activeHref="/account/orders" />

          {/* ====== CONTENT AREA ====== */}
          <div className="orders-content">
            {/* ====== TABS ====== */}
            <div className="orders-tabs">
              <button
                className={`orders-tab orders-tab--active`}
              >
                Đơn hàng hiện tại
              </button>
            </div>

            {/* ====== SEARCH BAR ====== */}
            <div className="orders-search">
              <input
                type="text"
                placeholder="Tìm kiếm mã đơn đặt hàng hoặc tên sản phẩm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0b2545"
                strokeWidth="2"
                className="orders-search__icon"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>

            {/* ====== ORDERS LIST / EMPTY STATE ====== */}
            {loading ? (
              <div className="orders-loading">Đang tải lịch sử mua hàng...</div>
            ) : orders.length > 0 ? (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div
                      className="order-card__header"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div>
                        <span className="order-card__code" style={{ textDecoration: "underline" }}>
                          Mã đơn: {order.id}
                        </span>
                        <span className="order-card__date">
                          ({new Date(order.createdAt).toLocaleDateString("vi-VN")})
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#16a34a",
                            padding: "4px 10px",
                            borderRadius: "16px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                          }}
                        >
                          ✓ Đã thanh toán
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <div
                      className="order-card__body"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item">
                          <div className="order-item__img">
                            <Image
                              src={
                                item.variant.product.images[0]?.url ||
                                "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/bep-nau/KIS87553IT.jpg"
                              }
                              alt={item.variant.product.name}
                              width={80}
                              height={80}
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                          <div className="order-item__info">
                            <h4 className="order-item__name">{item.variant.product.name}</h4>
                            <p className="order-item__sku">SKU: {item.variant.sku}</p>
                            <p className="order-item__qty">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="order-item__price">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card__footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          background: "#001e50",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "8px 18px",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        XEM CHI TIẾT ĐƠN HÀNG →
                      </button>

                      <div>
                        <span className="order-card__total-label">Tổng tiền: </span>
                        <span className="order-card__total-value">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="orders-empty">
                <p>Không có đơn hàng nào trong mục này.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ====== ORDER DETAIL MODAL ====== */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              background: "#ffffff",
              maxWidth: "760px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "8px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                background: "#001e50",
                color: "#fff",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>
                <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                  Đặt ngày {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              {/* Order Status Bar */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f8fafc",
                  padding: "14px 18px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block" }}>Trạng thái giao hàng</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                <div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block" }}>Thanh toán</span>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Đã thanh toán
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block" }}>Mã vận đơn</span>
                  <strong style={{ fontSize: "0.9rem", color: "#001e50" }}>
                    {selectedOrder.trackingNumber || `ELX-VN-2026-${selectedOrder.id}`}
                  </strong>
                </div>
              </div>

              {/* Delivery & Payment Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "28px",
                }}
              >
                {/* Shipping Info */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "16px 18px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#001e50",
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "6px",
                    }}
                  >
                    📍 Thông tin giao hàng
                  </h3>
                  <p style={{ margin: "0 0 4px 0", fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>
                    {selectedOrder.recipientName || fullName}
                  </p>
                  <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Số điện thoại: <strong>{selectedOrder.phone || "0987 654 321"}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: 1.4 }}>
                    Địa chỉ: {selectedOrder.shippingAddress || "123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội"}
                  </p>
                </div>

                {/* Payment Info */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "16px 18px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#001e50",
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "6px",
                    }}
                  >
                    💳 Phương thức thanh toán
                  </h3>
                  <p style={{ margin: "0 0 4px 0", fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>
                    {selectedOrder.paymentMethod || "Thẻ ATM / Internet Banking (VNPAY)"}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#15803d", fontWeight: 600 }}>
                    Thanh toán thành công qua cổng thanh toán trực tuyến
                  </p>
                </div>
              </div>

              {/* Products List */}
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#001e50",
                  marginBottom: "12px",
                }}
              >
                🛒 Danh sách sản phẩm
              </h3>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginBottom: "24px",
                }}
              >
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any, idx: number) => {
                    const itemName = item.variant?.product?.name || item.name || item.productName || "Sản phẩm Electrolux";
                    const itemImg = item.variant?.product?.images?.[0]?.url || item.image || item.img || "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/bep-nau/EHI8278BF.jpg";
                    const itemSku = item.variant?.sku || item.sku || "ELX-SKU";
                    const itemQty = item.quantity || 1;
                    const itemPrice = item.price || item.variant?.price || 0;
                    const itemSlug = item.variant?.product?.slug || item.slug || "ehi8278bf";

                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "14px 18px",
                          borderBottom: idx < selectedOrder.items.length - 1 ? "1px solid #f1f5f9" : "none",
                          background: "#fff",
                        }}
                      >
                        <div
                          style={{
                            width: 70,
                            height: 70,
                            borderRadius: 6,
                            overflow: "hidden",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={itemImg}
                            alt={itemName}
                            width={70}
                            height={70}
                            style={{ objectFit: "contain", width: "100%", height: "100%" }}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "0.92rem", fontWeight: 600, color: "#001e50" }}>
                            <Link
                              href={`/thiet-bi/may-giat/${itemSlug}`}
                              style={{ color: "#001e50", textDecoration: "none" }}
                              onClick={() => setSelectedOrder(null)}
                            >
                              {itemName}
                            </Link>
                          </h4>
                          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              SKU: {itemSku}
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              Số lượng: <strong>{itemQty}</strong>
                            </span>
                            <Link
                              href={`/thiet-bi/may-giat/${itemSlug}`}
                              style={{
                                fontSize: "0.78rem",
                                color: "#001e50",
                                fontWeight: 600,
                                textDecoration: "underline",
                              }}
                              onClick={() => setSelectedOrder(null)}
                            >
                              Xem sản phẩm ❯
                            </Link>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <strong style={{ fontSize: "0.95rem", color: "#e3000b", display: "block" }}>
                            {formatPrice(itemPrice * itemQty)}
                          </strong>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            ({formatPrice(itemPrice)} / sản phẩm)
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>
                    Không có sản phẩm nào trong đơn hàng này.
                  </div>
                )}
              </div>

              {/* Order Total Breakdown */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "6px",
                  padding: "16px 20px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.88rem", color: "#475569" }}>
                  <span>Tạm tính:</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.88rem", color: "#475569" }}>
                  <span>Phí vận chuyển:</span>
                  <span style={{ color: "#15803d", fontWeight: 600 }}>Miễn phí</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: "0.88rem", color: "#475569" }}>
                  <span>Phí lắp đặt:</span>
                  <span style={{ color: "#15803d", fontWeight: 600 }}>Miễn phí</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTop: "1px dashed #cbd5e1",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#001e50",
                  }}
                >
                  <span>Tổng tiền thanh toán:</span>
                  <span style={{ color: "#e3000b" }}>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link
                  href="/support#lien-he"
                  style={{
                    color: "#001e50",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    textDecoration: "underline",
                  }}
                  onClick={() => setSelectedOrder(null)}
                >
                  Cần hỗ trợ về đơn hàng này?
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    padding: "10px 24px",
                    background: "#001e50",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer footerSections={footerSections} />
    </>
  );
}
