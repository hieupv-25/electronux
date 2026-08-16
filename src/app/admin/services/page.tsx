import Link from "next/link";
import {
  createService,
  updateProductRegistrationStatus,
  updateWarrantyAppointmentStatus,
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
  const [services, appointments, productRegistrations, maintenanceServiceCount] = await Promise.all([
    prisma.service.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        _count: { select: { appointments: true } },
      },
    }),
    prisma.warrantyAppointment.findMany({
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
    prisma.productRegistration.findMany({
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
      },
    }),
    prisma.product.count({
      where: {
        kind: "service",
        deletedAt: null,
        category: { slug: "dich-vu-bao-duong" },
      },
    }),
  ]);

  return { services, appointments, productRegistrations, maintenanceServiceCount };
}

export default async function AdminServicesPage() {
  const { services, appointments, productRegistrations, maintenanceServiceCount } = await getServicesData();

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
                    <strong>{service._count.appointments}</strong>
                    <span>yêu cầu</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="admin-panel" style={{ marginBottom: 18 }}>
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Bảo dưỡng</p>
            <h2>{maintenanceServiceCount} dịch vụ bảo dưỡng</h2>
          </div>
          <Link className="admin-primary-button" href="/admin/services/maintenance">
            Quản lý bảo dưỡng
          </Link>
        </div>
        <div className="admin-record-card__body">
          Thêm, sửa, xóa các gói bảo dưỡng và ảnh hiển thị ở trang khách hàng tại trang quản lý riêng.
        </div>
      </section>

      <section className="admin-records">
        <div className="admin-panel__header admin-panel__header--loose">
          <div>
            <p className="admin-eyebrow">Yêu cầu</p>
            <h2>{appointments.length} lịch hẹn gần nhất</h2>
          </div>
        </div>
        {appointments.length === 0 ? (
          <EmptyBlock>Chưa có yêu cầu dịch vụ nào.</EmptyBlock>
        ) : (
          appointments.map((request) => (
            <article className="admin-record-card" key={request.id}>
              <div className="admin-record-card__header">
                <div>
                  <p className="admin-eyebrow">
                    {request.service
                      ? `${request.service.name} - ${serviceTypeLabels[request.service.type]}`
                      : "Lịch hẹn bảo hành"}
                  </p>
                  <h3>
                    {request.customerName ||
                      (request.user ? `${request.user.firstName} ${request.user.lastName}` : "Khách vãng lai")}
                  </h3>
                  <span>
                    {request.requestCode || request.id} - {request.email || request.user?.email || "Chưa có email"} -{" "}
                    {request.phone || request.user?.phone || "Chưa có SĐT"} - {formatDate(request.createdAt)}
                  </span>
                </div>
                <StatusBadge value={request.status} labels={requestStatusLabels} />
              </div>

              <div className="admin-list-item" style={{ marginBottom: 16 }}>
                <div>
                  <p>
                    <strong>Thiết bị:</strong> {request.model || "—"} / {request.serialNumber || "—"}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong>{" "}
                    {[request.address, request.ward, request.district, request.city].filter(Boolean).join(", ") || "—"}
                  </p>
                  <p>
                    <strong>Sự cố:</strong> {request.issue || "—"}
                  </p>
                  <p>
                    <strong>Lịch mong muốn:</strong>{" "}
                    {request.preferredDate ? formatDate(request.preferredDate) : "—"} {request.preferredTime || ""}
                  </p>
                </div>
              </div>

              <form action={updateWarrantyAppointmentStatus} className="admin-edit-grid">
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
          ))
        )}
      </section>

      <section className="admin-records">
        <div className="admin-panel__header admin-panel__header--loose">
          <div>
            <p className="admin-eyebrow">Bảo hành điện tử</p>
            <h2>{productRegistrations.length} đăng ký gần nhất</h2>
          </div>
        </div>
        {productRegistrations.length === 0 ? (
          <EmptyBlock>Chưa có đăng ký bảo hành điện tử nào.</EmptyBlock>
        ) : (
          productRegistrations.map((registration) => (
            <article className="admin-record-card" key={registration.id}>
              <div className="admin-record-card__header">
                <div>
                  <p className="admin-eyebrow">{registration.registrationCode}</p>
                  <h3>{registration.customerName}</h3>
                  <span>
                    {registration.email} - {registration.phone} - {formatDate(registration.createdAt)}
                  </span>
                </div>
                <StatusBadge value={registration.status} labels={requestStatusLabels} />
              </div>

              <div className="admin-list-item" style={{ marginBottom: 16 }}>
                <div>
                  <p>
                    <strong>Sản phẩm:</strong> {registration.productName || "—"}
                  </p>
                  <p>
                    <strong>Model / Serial:</strong> {registration.model} / {registration.serialNumber || "—"}
                  </p>
                  <p>
                    <strong>Ngày mua:</strong> {formatDate(registration.purchaseDate)}
                  </p>
                  <p>
                    <strong>Nơi mua:</strong> {registration.retailer || "—"}
                  </p>
                  <p>
                    <strong>Hóa đơn:</strong>{" "}
                    {registration.invoiceUrl ? (
                      <a href={registration.invoiceUrl} target="_blank" rel="noreferrer">
                        Xem tệp
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>

              <form action={updateProductRegistrationStatus} className="admin-edit-grid">
                <input name="id" type="hidden" value={registration.id} />
                <label>
                  Trạng thái
                  <select name="status" defaultValue={registration.status}>
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
                    defaultValue={registration.notes ?? ""}
                    placeholder="Đã kiểm tra serial và hóa đơn..."
                  />
                </label>
                <button className="admin-primary-button" type="submit">
                  Cập nhật đăng ký
                </button>
              </form>
            </article>
          ))
        )}
      </section>
    </>
  );
}
