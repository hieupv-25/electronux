"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  const firstName = user?.firstName || "viv";
  const lastName = user?.lastName || "vietttishnl";

  // Tab Selection: "preorder" | "unpaid" | "current" | "past"
  const [activeTab, setActiveTab] = useState<"preorder" | "unpaid" | "current" | "past">("preorder");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample mock data if DB empty for nice demo experience
  const sampleOrders: Record<string, Order[]> = {
    preorder: [],
    unpaid: [
      {
        id: "ELX-8829104",
        totalAmount: 11490000,
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: "2026-08-01T10:00:00Z",
        items: [
          {
            id: "item-1",
            quantity: 1,
            price: 11490000,
            variant: {
              sku: "EDV904S3SC",
              product: {
                name: "Máy sấy quần áo Electrolux thông hơi 9kg UltimateCare 300 xám",
                slug: "edv904s3sc",
                images: [
                  {
                    url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/may-say/EDV904S3SC.avif",
                  },
                ],
              },
            },
          },
        ],
      },
    ],
    current: [
      {
        id: "ELX-9938210",
        totalAmount: 17990000,
        status: "shipping",
        paymentStatus: "paid",
        createdAt: "2026-08-05T14:30:00Z",
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
    past: [
      {
        id: "ELX-7746192",
        totalAmount: 1890000,
        status: "completed",
        paymentStatus: "paid",
        createdAt: "2026-07-15T09:15:00Z",
        items: [
          {
            id: "item-3",
            quantity: 1,
            price: 1890000,
            variant: {
              sku: "ERC2020W",
              product: {
                name: "Nồi cơm điện Electrolux 1.8L ERC2020W",
                slug: "erc2020w",
                images: [
                  {
                    url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/rice-cooker/product-rice-cooker-1.png",
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
        const res = await fetch(`/api/account/orders?type=${activeTab}&search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.orders && data.orders.length > 0) {
            setOrders(data.orders);
          } else {
            // Fallback to sample data for visual match if DB is empty
            const samples = sampleOrders[activeTab] || [];
            if (searchQuery) {
              setOrders(
                samples.filter(
                  (o) =>
                    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.items.some((i) =>
                      i.variant.product.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                )
              );
            } else {
              setOrders(samples);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, searchQuery]);

  const sidebarItems = [
    {
      label: "Chi tiết tài khoản",
      href: "/account",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Lịch sử mua hàng",
      href: "/account/orders",
      active: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
    },
    {
      label: "Gói Đăng ký Định kỳ",
      href: "/account/subscriptions",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      ),
    },
    {
      label: "Sản phẩm đã đăng ký",
      href: "/account/registered-products",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      label: "Lịch sử dịch vụ",
      href: "/account/service-history",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      label: "Danh sách yêu thích",
      href: "/account/wishlist",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      ),
    },
    {
      label: "Danh sách nhắc nhở",
      href: "/account/reminders",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      ),
    },
  ];

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
          <aside className="account-sidebar">
            <div className="account-sidebar__user">
              <div className="account-sidebar__avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="account-sidebar__greeting">
                <span className="account-sidebar__welcome">Xin chào</span>
                <span className="account-sidebar__name">
                  {firstName} {lastName}
                </span>
              </div>
            </div>

            <nav className="account-sidebar__nav">
              {sidebarItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`account-sidebar__item ${item.active ? "account-sidebar__item--active" : ""}`}
                >
                  <span className="account-sidebar__icon">{item.icon}</span>
                  <span className="account-sidebar__label">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* ====== CONTENT AREA ====== */}
          <div className="orders-content">
            {/* ====== TABS ====== */}
            <div className="orders-tabs">
              <button
                className={`orders-tab ${activeTab === "preorder" ? "orders-tab--active" : ""}`}
                onClick={() => setActiveTab("preorder")}
              >
                Pre-order
              </button>
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
