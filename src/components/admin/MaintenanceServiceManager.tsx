"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { deleteMaintenanceService, updateMaintenanceService } from "@/app/admin/actions";
import { getMaintenanceGroup, maintenanceGroups } from "@/data/maintenanceCatalog";

export type ManagedMaintenanceService = {
  id: string;
  variantId: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  group: string;
  productType: string;
  imageUrl: string;
};

function MaintenanceEditor({ service }: { service: ManagedMaintenanceService }) {
  const router = useRouter();
  const initialGroup = getMaintenanceGroup(service.group) || maintenanceGroups[0];
  const [group, setGroup] = useState<(typeof maintenanceGroups)[number]>(initialGroup);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const formData = new FormData(event.currentTarget);
      const image = formData.get("image");
      if (image instanceof File && image.size) {
        const uploadData = new FormData();
        uploadData.set("file", image);
        uploadData.set("bucket", "services");
        uploadData.set("folder", `Maintainance/${group.value}`);
        const response = await fetch("/api/upload", { method: "POST", body: uploadData });
        const result = await response.json() as { url?: string; error?: string };
        if (!response.ok || !result.url) throw new Error(result.error || "Không thể tải ảnh lên.");
        formData.set("imageUrl", result.url);
      }
      formData.delete("image");
      await updateMaintenanceService(formData);
      setMessage("Cập nhật dịch vụ thành công.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể cập nhật dịch vụ.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Xóa dịch vụ “${service.name}”?`)) return;
    setBusy(true);
    const formData = new FormData();
    formData.set("id", service.id);
    await deleteMaintenanceService(formData);
    router.refresh();
  }

  return <details className="admin-record-card admin-maintenance-editor">
    <summary className="admin-maintenance-editor__summary">
      <span className="admin-maintenance-editor__title">{service.name}</span>
      <span>{group.label} · {service.productType}</span>
      <strong>{service.price.toLocaleString("vi-VN")} ₫</strong>
    </summary>
    <form onSubmit={handleUpdate} className="admin-form-fields admin-form-fields--two admin-maintenance-editor__form">
      <input type="hidden" name="id" value={service.id} />
      <input type="hidden" name="variantId" value={service.variantId} />
      <label>Nhóm dịch vụ<select name="group" value={group.value} onChange={(event) => {
        const selected = maintenanceGroups.find((item) => item.value === event.target.value);
        if (selected) setGroup(selected);
      }}>{maintenanceGroups.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label>Loại sản phẩm<select name="productType" key={group.value} defaultValue={group.productTypes.includes(service.productType as never) ? service.productType : group.productTypes[0]}>{group.productTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      <label>Tên dịch vụ<input name="name" required defaultValue={service.name} /></label>
      <label>SKU<input name="sku" required defaultValue={service.sku} /></label>
      <label>Slug<input name="slug" required defaultValue={service.slug} /></label>
      <label>Giá dịch vụ<input name="price" required inputMode="numeric" pattern="[0-9]+" defaultValue={service.price} /></label>
      <label className="admin-field-span">Mô tả<textarea name="description" rows={3} defaultValue={service.description} /></label>
      <label className="admin-field-span">Thay ảnh (không chọn nếu giữ ảnh hiện tại)<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
      {message && <p className="admin-field-span" role="status">{message}</p>}
      <div className="admin-maintenance-editor__actions">
        <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Đang xử lý..." : "Lưu thay đổi"}</button>
        <button className="admin-secondary-button" type="button" disabled={busy} onClick={() => void handleDelete()}>Xóa dịch vụ</button>
      </div>
    </form>
  </details>;
}

export default function MaintenanceServiceManager({ services }: { services: ManagedMaintenanceService[] }) {
  if (!services.length) return <p className="admin-empty admin-empty--block">Chưa có dịch vụ bảo dưỡng.</p>;
  return <div className="admin-records">{services.map((service) => <MaintenanceEditor key={service.id} service={service} />)}</div>;
}
