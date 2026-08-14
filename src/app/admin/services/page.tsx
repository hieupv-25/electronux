import {
  createService,
  updateServiceRequestStatus,
} from "@/app/admin/actions";
import { AdminPageHeader, EmptyBlock, StatusBadge } from "@/components/admin/AdminUi";
import {
  formatDate,
  requestStatusLabels,
  serviceTypeLabels,
} from "@/lib/admin-format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const serviceTypeOptions = ["support", "paid", "warranty_extension"];
const requestStatusOptions = ["pending", "processing", "completed", "cancelled"];

async function getServicesData() {
  const [services, requests] = await Promise.all([
    prisma.service.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        _count: { select: { requests: true } },
      },
    }),
    prisma.serviceRequest.findMany({
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
        service: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    }),
  ]);

  return { services, requests };
}

export default async function AdminServicesPage() {
  const { services, requests } = await getServicesData();

  return (
    <>
      <AdminPageHeader
        eyebrow="Service"
        title="Quản lý dịch vụ và bảo hành"
        description="Tạo loại dịch vụ, tiếp nhận và cập nhật trạng thái yêu cầu từ khách hàng."
      />

      <section className="admin-form-grid admin-form-grid--compact">
        <form action={createService} className="admin-form-card">
          <div className="admin-form-card__header">
            <h3>Thêm dịch vụ</h3>
            <span>{services.length} loại</span>
          </div>
          <div className="admin-form-fields">
            <label>
              Tên dịch vụ
              <input name="name" required placeholder="Đặt lịch sửa chữa tại nhà" />
            </label>
            <label>
              Phân loại
              <select name="type" defaultValue="support">
                {serviceTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {serviceTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <button className="admin-primary-button" type="submit">
              Tạo dịch vụ
            </button>
          </div>
        </form>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Danh mục dịch vụ</p>
              <h2>Đang cung cấp</h2>
            </div>
          </div>
          <div className="admin-list">
            {services.length === 0 ? (
              <EmptyBlock>Chưa có loại dịch vụ nào.</EmptyBlock>
            ) : (
              services.map((service) => (
                <article className="admin-list-item" key={service.id}>
                  <div>
                    <h3>{service.name}</h3>
                    <p>{serviceTypeLabels[service.type]}</p>
                  </div>
                  <div className="admin-list-item__meta">
                    <strong>{service._count.requests}</strong>
                    <span>yêu cầu</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="admin-records">
        <div className="admin-panel__header admin-panel__header--loose">
          <div>
            <p className="admin-eyebrow">Yêu cầu</p>
            <h2>{requests.length} yêu cầu gần nhất</h2>
          </div>
        </div>
        {requests.length === 0 ? (
          <EmptyBlock>Chưa có yêu cầu dịch vụ nào.</EmptyBlock>
        ) : (
          requests.map((request) => {
            const serviceName = request.service?.name ?? "Dich vu";
            const serviceType = request.service?.type
              ? serviceTypeLabels[request.service.type]
              : "Chua phan loai";
            const customerName = request.user
              ? `${request.user.firstName} ${request.user.lastName}`.trim()
              : "Khach hang";
            const customerEmail = request.user?.email ?? "Chua co email";
            const customerPhone = request.user?.phone ?? "Chua cap nhat SDT";

            return (
            <article className="admin-record-card" key={request.id}>
              <div className="admin-record-card__header">
                <div>
                  <p className="admin-eyebrow">
                    {serviceName} - {serviceType}
                  </p>
                  <h3>
                    {customerName || "Khach hang"}
                  </h3>
                  <span>
                    {customerEmail} - {customerPhone} - {formatDate(request.createdAt)}
                  </span>
                </div>
                <StatusBadge value={request.status} labels={requestStatusLabels} />
              </div>

              <form action={updateServiceRequestStatus} className="admin-edit-grid">
                <input name="id" type="hidden" value={request.id} />
                <label>
                  Trạng thái
                  <select name="status" defaultValue={request.status}>
                    {requestStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {requestStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field-span">
                  Ghi chú xử lý
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={request.notes ?? ""}
                    placeholder="Kỹ thuật viên đã gọi xác nhận lịch..."
                  />
                </label>
                <button className="admin-primary-button" type="submit">
                  Cập nhật yêu cầu
                </button>
              </form>
            </article>
            );
          })
        )}
      </section>
    </>
  );
}
