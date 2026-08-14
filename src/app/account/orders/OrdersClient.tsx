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
