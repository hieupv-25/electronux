import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/actions";
import { AdminPageHeader, EmptyBlock, StatusBadge } from "@/components/admin/AdminUi";
import { Prisma } from "@/generated/prisma/client";
import {
  formatCurrency,
  formatDate,
  orderStatusLabels,
  paymentStatusLabels,
} from "@/lib/admin-format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const orderStatusOptions = [
  "pending",
  "processing",
  "shipping",
  "completed",
  "cancelled",
] as const;

const paymentStatusOptions = ["unpaid", "paid", "refunded"] as const;
const orderPageSize = 12;

type OrderStatusFilter = (typeof orderStatusOptions)[number] | "all";
type PaymentStatusFilter = (typeof paymentStatusOptions)[number] | "all";

type AdminOrdersPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    status?: string | string[];
    paymentStatus?: string | string[];
    page?: string | string[];
  }>;
};

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeOrderStatus(value?: string | string[]): OrderStatusFilter {
  const status = getFirstParam(value);
  return status && (orderStatusOptions as readonly string[]).includes(status)
    ? (status as OrderStatusFilter)
    : "all";
}

function normalizePaymentStatus(value?: string | string[]): PaymentStatusFilter {
  const status = getFirstParam(value);
  return status && (paymentStatusOptions as readonly string[]).includes(status)
    ? (status as PaymentStatusFilter)
    : "all";
}

function normalizePage(value?: string | string[]) {
  const page = Number(getFirstParam(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function buildOrderSearchWhere({
  searchQuery,
  status,
  paymentStatus,
}: {
  searchQuery: string;
  status: OrderStatusFilter;
  paymentStatus: PaymentStatusFilter;
}) {
  const filters: Prisma.OrderWhereInput[] = [{ deletedAt: null }];
  const query = searchQuery.trim();

  if (status !== "all") filters.push({ status });
  if (paymentStatus !== "all") filters.push({ paymentStatus });

  if (query) {
    const stringFilter = {
      contains: query,
      mode: "insensitive" as const,
    };

    filters.push({
      OR: [
        { id: stringFilter },
        { trackingNumber: stringFilter },
        { phone: stringFilter },
        { shippingAddress: stringFilter },
        {
          user: {
            OR: [
              { firstName: stringFilter },
              { lastName: stringFilter },
              { email: stringFilter },
              { phone: stringFilter },
            ],
          },
        },
        {
          items: {
            some: {
              variant: {
                OR: [
                  { sku: stringFilter },
                  { variantName: stringFilter },
                  {
                    product: {
                      name: stringFilter,
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    });
  }

  return { AND: filters } satisfies Prisma.OrderWhereInput;
}

function buildOrdersHref({
  searchQuery,
  status,
  paymentStatus,
  page,
}: {
  searchQuery: string;
  status: OrderStatusFilter;
  paymentStatus: PaymentStatusFilter;
  page: number;
}) {
  const params = new URLSearchParams();

  if (searchQuery) params.set("q", searchQuery);
  if (status !== "all") params.set("status", status);
  if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

async function getOrdersData({
  searchQuery,
  status,
  paymentStatus,
  page,
}: {
  searchQuery: string;
  status: OrderStatusFilter;
  paymentStatus: PaymentStatusFilter;
  page: number;
}) {
  const where = buildOrderSearchWhere({ searchQuery, status, paymentStatus });
  const totalCount = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / orderPageSize));
  const currentPage = Math.min(page, totalPages);

  const [orders, summary] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * orderPageSize,
      take: orderPageSize,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            variant: {
              select: {
                sku: true,
                variantName: true,
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
        coupon: {
          select: { code: true },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            status: true,
            note: true,
            changedBy: true,
            createdAt: true,
          },
        },
      },
    }),
    Promise.all([
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null, status: "pending" } }),
      prisma.order.count({ where: { deletedAt: null, status: "shipping" } }),
      prisma.order.count({ where: { deletedAt: null, paymentStatus: "paid" } }),
    ]),
  ]);

  return {
    orders,
    totalCount,
    totalPages,
    currentPage,
    summary: {
      all: summary[0],
      pending: summary[1],
      shipping: summary[2],
      paid: summary[3],
    },
  };
}

function OrderFilterBar({
  searchQuery,
  status,
  paymentStatus,
}: {
  searchQuery: string;
  status: OrderStatusFilter;
  paymentStatus: PaymentStatusFilter;
}) {
  return (
    <section className="admin-panel admin-order-controls">
      <form className="admin-filter-bar admin-order-filter" method="get">
        <label>
          Tìm kiếm đơn hàng
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder="Nhập mã vận đơn, mã đơn, SĐT, email..."
          />
        </label>
        <label>
          Trạng thái đơn
          <select name="status" defaultValue={status}>
            <option value="all">Tất cả trạng thái</option>
            {orderStatusOptions.map((option) => (
              <option value={option} key={option}>
                {orderStatusLabels[option]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Thanh toán
          <select name="paymentStatus" defaultValue={paymentStatus}>
            <option value="all">Tất cả thanh toán</option>
            {paymentStatusOptions.map((option) => (
              <option value={option} key={option}>
                {paymentStatusLabels[option]}
              </option>
            ))}
          </select>
        </label>
        <button className="admin-primary-button" type="submit">
          Tìm kiếm
        </button>
        <Link className="admin-secondary-button" href="/admin/orders">
          Đặt lại
        </Link>
      </form>
    </section>
  );
}

function OrdersSummary({
  totalCount,
  summary,
}: {
  totalCount: number;
  summary: Awaited<ReturnType<typeof getOrdersData>>["summary"];
}) {
  return (
    <section className="admin-order-summary" aria-label="Tóm tắt đơn hàng">
      <article>
        <span>Kết quả đang xem</span>
        <strong>{totalCount.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Tổng đơn</span>
        <strong>{summary.all.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Chờ xử lý</span>
        <strong>{summary.pending.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Đang giao</span>
        <strong>{summary.shipping.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Đã thanh toán</span>
        <strong>{summary.paid.toLocaleString("vi-VN")}</strong>
      </article>
    </section>
  );
}

function OrdersPagination({
  currentPage,
  totalPages,
  searchQuery,
  status,
  paymentStatus,
}: {
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  status: OrderStatusFilter;
  paymentStatus: PaymentStatusFilter;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="admin-pagination" aria-label="Phân trang đơn hàng">
      <Link
        className={currentPage <= 1 ? "admin-pagination__link admin-pagination__link--disabled" : "admin-pagination__link"}
        href={buildOrdersHref({
          searchQuery,
          status,
          paymentStatus,
          page: Math.max(1, currentPage - 1),
        })}
        aria-disabled={currentPage <= 1}
      >
        Trước
      </Link>
      <span>
        Trang {currentPage.toLocaleString("vi-VN")} / {totalPages.toLocaleString("vi-VN")}
      </span>
      <Link
        className={currentPage >= totalPages ? "admin-pagination__link admin-pagination__link--disabled" : "admin-pagination__link"}
        href={buildOrdersHref({
          searchQuery,
          status,
          paymentStatus,
          page: Math.min(totalPages, currentPage + 1),
        })}
        aria-disabled={currentPage >= totalPages}
      >
        Sau
      </Link>
    </nav>
  );
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const searchQuery = (getFirstParam(params?.q) ?? "").trim();
  const status = normalizeOrderStatus(params?.status);
  const paymentStatus = normalizePaymentStatus(params?.paymentStatus);
  const requestedPage = normalizePage(params?.page);
  const { orders, totalCount, totalPages, currentPage, summary } = await getOrdersData({
    searchQuery,
    status,
    paymentStatus,
    page: requestedPage,
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Sales"
        title="Quản lý đơn hàng"
        description="Theo dõi đơn mới, cập nhật trạng thái giao hàng, thanh toán và mã vận đơn."
      />

      <OrderFilterBar
        searchQuery={searchQuery}
        status={status}
        paymentStatus={paymentStatus}
      />
      <OrdersSummary totalCount={totalCount} summary={summary} />

      <section className="admin-records admin-order-list">
        {orders.length === 0 ? (
          <EmptyBlock>Không tìm thấy đơn hàng phù hợp.</EmptyBlock>
        ) : (
          orders.map((order, index) => {
            const itemCount = order.items.reduce(
              (total, item) => total + item.quantity,
              0
            );
            const customerName = `${order.user.firstName} ${order.user.lastName}`.trim();
            const orderCode = `#${order.id.slice(0, 8).toUpperCase()}`;

            return (
              <details className="admin-record-card admin-order-row" key={order.id} open={orders.length === 1 && index === 0}>
                <summary className="admin-order-row__summary">
                  <div className="admin-order-row__main">
                    <p className="admin-eyebrow">
                      {orderCode} - {formatDate(order.createdAt)}
                    </p>
                    <h3>{customerName || "Khách hàng"}</h3>
                    <span>
                      {order.user.email} - {order.phone || order.user.phone || "Chưa có SĐT"}
                    </span>
                  </div>
                  <div className="admin-order-row__meta">
                    <span>
                      <small>Tổng tiền</small>
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                    </span>
                    <span>
                      <small>SL</small>
                      <strong>{itemCount}</strong>
                    </span>
                    <span>
                      <small>Mã vận đơn</small>
                      <strong>{order.trackingNumber || "Chưa cập nhật"}</strong>
                    </span>
                  </div>
                  <div className="admin-status-stack">
                    <StatusBadge value={order.status} labels={orderStatusLabels} />
                    <StatusBadge
                      value={order.paymentStatus}
                      labels={paymentStatusLabels}
                    />
                    <span className="admin-order-row__hint">Chi tiết</span>
                  </div>
                </summary>

                <div className="admin-order-grid">
                  <div className="admin-order-box">
                    <span>Tổng tiền</span>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                    <p>
                      {itemCount} sản phẩm
                      {order.coupon ? ` - Coupon ${order.coupon.code}` : ""}
                    </p>
                  </div>
                  <div className="admin-order-box">
                    <span>Địa chỉ giao hàng</span>
                    <p>{order.shippingAddress}</p>
                  </div>
                  <div className="admin-order-box">
                    <span>Mã vận đơn</span>
                    <p>{order.trackingNumber || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="admin-order-items">
                  {order.items.map((item) => (
                    <div key={item.id}>
                      <strong>{item.variant.product.name}</strong>
                      <span>
                        {item.variant.sku} - {item.variant.variantName} - SL {item.quantity} - {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <form action={updateOrderStatus} className="admin-edit-grid">
                  <input name="id" type="hidden" value={order.id} />
                  <label>
                    Trạng thái đơn
                    <select name="status" defaultValue={order.status}>
                      {orderStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {orderStatusLabels[option]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Thanh toán
                    <select name="paymentStatus" defaultValue={order.paymentStatus}>
                      {paymentStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {paymentStatusLabels[option]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Mã vận đơn
                    <input
                      name="trackingNumber"
                      defaultValue={order.trackingNumber ?? ""}
                      placeholder="VNPOST123..."
                    />
                  </label>
                  <label>
                    Ghi chú lịch sử
                    <input name="note" placeholder="Đã bàn giao cho đơn vị vận chuyển" />
                  </label>
                  <button className="admin-primary-button" type="submit">
                    Cập nhật đơn hàng
                  </button>
                </form>

                <div className="admin-history">
                  <strong>Lịch sử gần nhất</strong>
                  {order.statusHistory.length === 0 ? (
                    <span>Chưa có lịch sử thay đổi.</span>
                  ) : (
                    order.statusHistory.map((history) => (
                      <span key={history.id}>
                        {formatDate(history.createdAt)} - {orderStatusLabels[history.status]}
                        {history.note ? ` - ${history.note}` : ""}
                      </span>
                    ))
                  )}
                </div>
              </details>
            );
          })
        )}
      </section>

      <OrdersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        searchQuery={searchQuery}
        status={status}
        paymentStatus={paymentStatus}
      />
    </>
  );
}
