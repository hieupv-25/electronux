import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const orderStatusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
};

const requestStatusLabels: Record<string, string> = {
  pending: "Chờ tiếp nhận",
  processing: "Đang xử lý",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;

function formatCurrency(value: unknown) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatDate(value: Date) {
  return dateFormatter.format(value);
}

async function getAdminDashboardData() {
  try {
    const [
      productCount,
      activeProductCount,
      orderCount,
      pendingOrderCount,
      customerCount,
      serviceRequestCount,
      pendingServiceRequestCount,
      revenueAggregate,
      recentOrders,
      lowStockVariants,
      recentServiceRequests,
      recentCustomers,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null, status: "pending" } }),
      prisma.user.count({ where: { deletedAt: null, role: "customer" } }),
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: "pending" } }),
      prisma.order.aggregate({
        where: { deletedAt: null, paymentStatus: "paid" },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            select: { quantity: true },
          },
        },
      }),
      prisma.productVariant.findMany({
        where: {
          isActive: true,
          stockQuantity: { lte: 5 },
        },
        orderBy: [{ stockQuantity: "asc" }, { sku: "asc" }],
        take: 6,
        select: {
          id: true,
          sku: true,
          variantName: true,
          stockQuantity: true,
          price: true,
          product: {
            select: { name: true },
          },
        },
      }),
      prisma.serviceRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          status: true,
          notes: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { deletedAt: null, role: "customer" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      metrics: {
        productCount,
        activeProductCount,
        orderCount,
        pendingOrderCount,
        customerCount,
        serviceRequestCount,
        pendingServiceRequestCount,
        paidRevenue: revenueAggregate._sum.totalAmount,
      },
      recentOrders,
      lowStockVariants,
      recentServiceRequests,
      recentCustomers,
      hasDatabaseError: false,
    };
  } catch (error) {
    console.error("Failed to load admin dashboard", error);
    return {
      metrics: {
        productCount: 0,
        activeProductCount: 0,
        orderCount: 0,
        pendingOrderCount: 0,
        customerCount: 0,
        serviceRequestCount: 0,
        pendingServiceRequestCount: 0,
        paidRevenue: 0,
      },
      recentOrders: [],
      lowStockVariants: [],
      recentServiceRequests: [],
      recentCustomers: [],
      hasDatabaseError: true,
    };
  }
}

function StatusBadge({
  value,
  labels,
}: {
  value: string;
  labels: Record<string, string>;
}) {
  return (
    <span className={`admin-status admin-status--${value}`}>
      {labels[value] ?? value}
    </span>
  );
}

function EmptyTable({ columns, label }: { columns: number; label: string }) {
  return (
    <tr>
      <td className="admin-empty" colSpan={columns}>
        {label}
      </td>
    </tr>
  );
}

function MetricCards({ data }: { data: AdminDashboardData["metrics"] }) {
  const metrics = [
    {
      label: "Doanh thu đã thanh toán",
      value: formatCurrency(data.paidRevenue),
      note: "Tổng giá trị đơn hàng paid",
      accent: "revenue",
    },
    {
      label: "Đơn hàng",
      value: data.orderCount.toLocaleString("vi-VN"),
      note: `${data.pendingOrderCount} đơn chờ xử lý`,
      accent: "orders",
    },
    {
      label: "Sản phẩm đang bán",
      value: data.activeProductCount.toLocaleString("vi-VN"),
      note: `${data.productCount} sản phẩm trong hệ thống`,
      accent: "products",
    },
    {
      label: "Khách hàng",
      value: data.customerCount.toLocaleString("vi-VN"),
      note: "Tài khoản customer đang hoạt động",
      accent: "customers",
    },
    {
      label: "Yêu cầu dịch vụ",
      value: data.serviceRequestCount.toLocaleString("vi-VN"),
      note: `${data.pendingServiceRequestCount} yêu cầu mới`,
      accent: "services",
    },
  ];

  return (
    <section className="admin-metrics" aria-label="Tong quan he thong">
      {metrics.map((metric) => (
        <article
          className={`admin-metric admin-metric--${metric.accent}`}
          key={metric.label}
        >
          <span className="admin-metric__label">{metric.label}</span>
          <strong className="admin-metric__value">{metric.value}</strong>
          <span className="admin-metric__note">{metric.note}</span>
        </article>
      ))}
    </section>
  );
}

function OrdersPanel({ orders }: { orders: AdminDashboardData["recentOrders"] }) {
  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__header">
        <div>
          <p className="admin-eyebrow">Bán hàng</p>
          <h2>Đơn hàng mới</h2>
        </div>
        <Link className="admin-panel__link" href="#">
          Xem tất cả
        </Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>SL</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <EmptyTable columns={7} label="Chưa có đơn hàng nào." />
            ) : (
              orders.map((order) => {
                const itemCount = order.items.reduce(
                  (total, item) => total + item.quantity,
                  0
                );

                return (
                  <tr key={order.id}>
                    <td className="admin-table__strong">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <span className="admin-table__primary">
                        {order.user.firstName} {order.user.lastName}
                      </span>
                      <span className="admin-table__secondary">
                        {order.user.email}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{itemCount}</td>
                    <td>
                      <StatusBadge
                        value={order.paymentStatus}
                        labels={paymentStatusLabels}
                      />
                    </td>
                    <td>
                      <StatusBadge
                        value={order.status}
                        labels={orderStatusLabels}
                      />
                    </td>
                    <td className="admin-table__strong">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InventoryPanel({
  variants,
}: {
  variants: AdminDashboardData["lowStockVariants"];
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <p className="admin-eyebrow">Kho hàng</p>
          <h2>Cần bổ sung</h2>
        </div>
        <Link className="admin-panel__link" href="#">
          Quản lý kho
        </Link>
      </div>
      <div className="admin-list">
        {variants.length === 0 ? (
          <p className="admin-empty admin-empty--block">
            Không có sản phẩm sắp hết hàng.
          </p>
        ) : (
          variants.map((variant) => (
            <article className="admin-list-item" key={variant.id}>
              <div>
                <h3>{variant.product.name}</h3>
                <p>
                  {variant.sku} - {variant.variantName}
                </p>
              </div>
              <div className="admin-list-item__meta">
                <strong>{variant.stockQuantity}</strong>
                <span>{formatCurrency(variant.price)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ServicePanel({
  requests,
}: {
  requests: AdminDashboardData["recentServiceRequests"];
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <p className="admin-eyebrow">Chăm sóc</p>
          <h2>Yêu cầu dịch vụ</h2>
        </div>
        <Link className="admin-panel__link" href="#">
          Điều phối
        </Link>
      </div>
      <div className="admin-list">
        {requests.length === 0 ? (
          <p className="admin-empty admin-empty--block">
            Chưa có yêu cầu dịch vụ.
          </p>
        ) : (
          requests.map((request) => (
            <article className="admin-list-item" key={request.id}>
              <div>
                <h3>{request.service.name}</h3>
                <p>
                  {request.user.firstName} {request.user.lastName}
                  {request.user.phone ? ` - ${request.user.phone}` : ""}
                </p>
              </div>
              <div className="admin-list-item__meta">
                <StatusBadge
                  value={request.status}
                  labels={requestStatusLabels}
                />
                <span>{formatDate(request.createdAt)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function CustomersPanel({
  customers,
}: {
  customers: AdminDashboardData["recentCustomers"];
}) {
  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__header">
        <div>
          <p className="admin-eyebrow">CRM</p>
          <h2>Khách hàng mới</h2>
        </div>
        <Link className="admin-panel__link" href="#">
          Mở danh sách
        </Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <EmptyTable columns={4} label="Chưa có khách hàng mới." />
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="admin-table__strong">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone ?? "Chưa cập nhật"}</td>
                  <td>{formatDate(customer.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/?authRequired=true");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const data = await getAdminDashboardData();
  const adminName = `${session.user.firstName} ${session.user.lastName}`.trim();

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <Link className="admin-brand" href="/">
          <span className="admin-brand__mark">E</span>
          <span>
            <strong>Electrolux</strong>
            <small>Admin Center</small>
          </span>
        </Link>
        <nav className="admin-nav">
          {[
            "Dashboard",
            "Sản phẩm",
            "Đơn hàng",
            "Khách hàng",
            "Khuyến mãi",
            "Bảo hành",
            "Nội dung",
            "Cài đặt",
          ].map((item, index) => (
            <Link
              className={index === 0 ? "admin-nav__item admin-nav__item--active" : "admin-nav__item"}
              href="#"
              key={item}
            >
              <span>{item}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <span>Đăng nhập với vai trò</span>
          <strong>{session.user.role}</strong>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Quản trị hệ thống</p>
            <h1>Dashboard vận hành</h1>
          </div>
          <div className="admin-user-pill">
            <span>{adminName || "Admin"}</span>
            <strong>{session.user.email}</strong>
          </div>
        </header>

        {data.hasDatabaseError && (
          <div className="admin-alert">
            Không thể đọc dữ liệu database hiện tại. Dashboard đang hiển thị ở
            trạng thái rỗng.
          </div>
        )}

        <MetricCards data={data.metrics} />

        <section className="admin-actions" aria-label="Thao tac nhanh">
          {[
            "Thêm sản phẩm",
            "Tạo khuyến mãi",
            "Xử lý đơn hàng",
            "Tiếp nhận bảo hành",
          ].map((action) => (
            <Link href="#" className="admin-action" key={action}>
              <span>{action}</span>
              <strong>+</strong>
            </Link>
          ))}
        </section>

        <div className="admin-grid">
          <OrdersPanel orders={data.recentOrders} />
          <InventoryPanel variants={data.lowStockVariants} />
          <ServicePanel requests={data.recentServiceRequests} />
          <CustomersPanel customers={data.recentCustomers} />
        </div>
      </section>
    </main>
  );
}
