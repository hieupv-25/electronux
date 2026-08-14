import {
  toggleCustomerDeleted,
  updateCustomerRole,
} from "@/app/admin/actions";
import { AdminPageHeader, EmptyTable, StatusBadge } from "@/components/admin/AdminUi";
import { requireAdminSession } from "@/lib/admin";
import { formatCurrency, formatDate } from "@/lib/admin-format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCustomersData() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      deletedAt: true,
      orders: {
        where: { deletedAt: null },
        select: { totalAmount: true },
      },
      _count: {
        select: {
          orders: true,
          warrantyAppointments: true,
          productRegistrations: true,
          reviews: true,
        },
      },
    },
  });
}

export default async function AdminCustomersPage() {
  const session = await requireAdminSession();
  const customers = await getCustomersData();

  return (
    <>
      <AdminPageHeader
        eyebrow="CRM"
        title="Quản lý khách hàng"
        description="Theo dõi tài khoản, giá trị mua hàng, yêu cầu dịch vụ và phân quyền admin."
      />

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Hoạt động</th>
                <th>Doanh số</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <EmptyTable columns={7} label="Chưa có tài khoản nào." />
              ) : (
                customers.map((customer) => {
                  const revenue = customer.orders.reduce(
                    (total, order) => total + Number(order.totalAmount),
                    0
                  );
                  const isCurrentUser = customer.id === session.user.id;

                  return (
                    <tr key={customer.id}>
                      <td>
                        <span className="admin-table__primary">
                          {customer.firstName} {customer.lastName}
                        </span>
                        <span className="admin-table__secondary">
                          Tạo ngày {formatDate(customer.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span className="admin-table__primary">{customer.email}</span>
                        <span className="admin-table__secondary">
                          {customer.phone ?? "Chưa cập nhật SĐT"}
                        </span>
                      </td>
                      <td>
                        <form action={updateCustomerRole} className="admin-table-form">
                          <input name="id" type="hidden" value={customer.id} />
                          <select
                            name="role"
                            defaultValue={customer.role}
                            disabled={isCurrentUser}
                          >
                            <option value="customer">Khách hàng</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                          <button
                            className="admin-secondary-button"
                            type="submit"
                            disabled={isCurrentUser}
                          >
                            Lưu
                          </button>
                        </form>
                      </td>
                      <td>
                        <span className="admin-table__primary">
                          {customer._count.orders} đơn hàng
                        </span>
                        <span className="admin-table__secondary">
                          {customer._count.warrantyAppointments} lịch hẹn - {customer._count.productRegistrations} sản phẩm - {customer._count.reviews} đánh giá
                        </span>
                      </td>
                      <td className="admin-table__strong">
                        {formatCurrency(revenue)}
                      </td>
                      <td>
                        <StatusBadge
                          value={customer.deletedAt ? "cancelled" : "completed"}
                          labels={{
                            completed: "Đang hoạt động",
                            cancelled: "Đã khóa",
                          }}
                        />
                      </td>
                      <td>
                        <form action={toggleCustomerDeleted}>
                          <input name="id" type="hidden" value={customer.id} />
                          <input
                            name="mode"
                            type="hidden"
                            value={customer.deletedAt ? "restore" : "delete"}
                          />
                          <button
                            className={
                              customer.deletedAt
                                ? "admin-secondary-button"
                                : "admin-danger-button"
                            }
                            type="submit"
                            disabled={isCurrentUser}
                          >
                            {customer.deletedAt ? "Mở khóa" : "Khóa"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
