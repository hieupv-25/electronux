"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";

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
  items: OrderItem[];
};

export default function OrdersClient() {
  const { data: session } = useSession();

  const user = session?.user;
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  // Tab Selection: "unpaid" | "current" | "past"
  const [activeTab, setActiveTab] = useState<"unpaid" | "current" | "past">("unpaid");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/account/orders?type=${activeTab}&search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Failed to load orders", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, searchQuery]);

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
        return null;
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
                className={`orders-tab ${activeTab === "unpaid" ? "orders-tab--active" : ""}`}
                onClick={() => setActiveTab("unpaid")}
              >
                Đơn chờ thanh toán
              </button>
              <button
                className={`orders-tab ${activeTab === "current" ? "orders-tab--active" : ""}`}
                onClick={() => setActiveTab("current")}
              >
                Đơn hàng hiện tại
              </button>
              <button
                className={`orders-tab ${activeTab === "past" ? "orders-tab--active" : ""}`}
                onClick={() => setActiveTab("past")}
              >
                Đơn hàng cũ
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
                    <div className="order-card__header">
                      <div>
                        <span className="order-card__code">Mã đơn: {order.id}</span>
                        <span className="order-card__date">
                          ({new Date(order.createdAt).toLocaleDateString("vi-VN")})
                        </span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="order-card__body">
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
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card__footer">
                      <span className="order-card__total-label">Tổng tiền:</span>
                      <span className="order-card__total-value">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.totalAmount)}
                      </span>
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

      <Footer footerSections={footerSections} />
    </>
  );
}
