"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createMaintenanceService } from "@/app/admin/actions";
import { maintenanceGroups } from "@/data/maintenanceCatalog";

export default function MaintenanceServiceForm() {
  const router = useRouter();
  const [group, setGroup] = useState<(typeof maintenanceGroups)[number]>(maintenanceGroups[0]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const image = formData.get("image");
      if (!(image instanceof File) || !image.size) throw new Error("Vui lòng chọn ảnh dịch vụ.");

      const uploadData = new FormData();
      uploadData.set("file", image);
      uploadData.set("bucket", "services");
      uploadData.set("folder", `Maintainance/${group.value}`);
      const response = await fetch("/api/upload", { method: "POST", body: uploadData });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Không thể tải ảnh lên.");

      formData.delete("image");
      formData.set("imageUrl", result.url);
      await createMaintenanceService(formData);
      form.reset();
      setGroup(maintenanceGroups[0]);
      setMessage("Thêm dịch vụ thành công.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể thêm dịch vụ bảo dưỡng.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form-card admin-form-card--wide">
      <div className="admin-form-card__header">
        <h3>Thêm dịch vụ bảo dưỡng</h3>
      </div>
      <div className="admin-form-fields admin-form-fields--two">
        <label>
          Nhóm dịch vụ
          <select
            name="group"
            value={group.value}
            onChange={(event) => {
              const selected = maintenanceGroups.find((item) => item.value === event.target.value);
              if (selected) setGroup(selected);
            }}
          >
            {maintenanceGroups.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Loại sản phẩm
          <select name="productType" key={group.value} defaultValue={group.productTypes[0]}>
            {group.productTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>
          Tên dịch vụ
          <input name="name" required placeholder="Vệ sinh máy rửa chén tại nhà" />
        </label>
        <label>
          Mã SKU
          <input name="sku" required placeholder="DV-BD-001" />
        </label>
        <label>
          Slug
          <input name="slug" placeholder="Tự tạo nếu bỏ trống" />
        </label>
        <label>
          Giá dịch vụ
          <input name="price" required inputMode="numeric" pattern="[0-9]+" placeholder="650000" />
        </label>
        <label className="admin-field-span">
          Mô tả
          <textarea name="description" rows={3} placeholder="Nội dung gói vệ sinh và bảo dưỡng..." />
        </label>
        <label className="admin-field-span">
          Ảnh dịch vụ (JPG, PNG, WEBP; tối đa 5 MB)
          <input name="image" type="file" required accept="image/jpeg,image/png,image/webp,image/avif" />
        </label>
        {message && <p className="admin-field-span" role="status">{message}</p>}
        <div className="admin-maintenance-form__actions">
          <button className="admin-primary-button" type="submit" disabled={submitting}>
            {submitting ? "Đang tải ảnh và tạo..." : "Tạo dịch vụ bảo dưỡng"}
          </button>
        </div>
      </div>
    </form>
  );
}
