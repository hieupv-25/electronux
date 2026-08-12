import { updateOrderStatus } from "@/app/admin/actions";
import { AdminPageHeader, EmptyBlock, StatusBadge } from "@/components/admin/AdminUi";
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
];

const paymentStatusOptions = ["unpaid", "paid", "refunded"];

async function getOrdersData() {
  return prisma.order.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 80,
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
  });
}

export default async function AdminOrdersPage() {
  const orders = await getOrdersData();

  return (
    <>
      <AdminPageHeader
        eyebrow="Sales"
        title="Quản lý đơn hàng"
        description="Theo dõi đơn mới, cập nhật trạng thái giao hàng, thanh toán và mã vận đơn."
      />

      <section className="admin-records">
        {orders.length === 0 ? (
          <EmptyBlock>Chưa có đơn hàng nào để xử lý.</EmptyBlock>
        ) : (
          orders.map((order) => {
            const itemCount = order.items.reduce(
              (total, item) => total + item.quantity,
              0
            );

            return (
              <article className="admin-record-card" key={order.id}>
                <div className="admin-record-card__header">
                  <div>
                    <p className="admin-eyebrow">
                      #{order.id.slice(0, 8).toUpperCase()} - {formatDate(order.createdAt)}
                    </p>
                    <h3>
                      {order.user.firstName} {order.user.lastName}
                    </h3>
                    <span>
                      {order.user.email} - {order.phone || order.user.phone || "Chưa có SĐT"}
                    </span>
                  </div>
                  <div className="admin-status-stack">
                    <StatusBadge value={order.status} labels={orderStatusLabels} />
                    <StatusBadge
                      value={order.paymentStatus}
                      labels={paymentStatusLabels}
                    />
                  </div>
                </div>

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
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {orderStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Thanh toán
                    <select name="paymentStatus" defaultValue={order.paymentStatus}>
                      {paymentStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {paymentStatusLabels[status]}
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
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
