export const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const orderStatusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export const paymentStatusLabels: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
};

export const requestStatusLabels: Record<string, string> = {
  pending: "Chờ tiếp nhận",
  processing: "Đang xử lý",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export const serviceTypeLabels: Record<string, string> = {
  paid: "Dịch vụ trả phí",
  warranty_extension: "Gia hạn bảo hành",
  support: "Hỗ trợ",
};

export const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  customer: "Khách hàng",
};

export function formatCurrency(value: unknown) {
  return currencyFormatter.format(Number(value ?? 0));
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "Chưa cập nhật";
  return dateFormatter.format(new Date(value));
}

export function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getFormOptionalString(formData: FormData, key: string) {
  const value = getFormString(formData, key);
  return value || null;
}

export function getFormNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(getFormString(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

export function getFormBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function getFormDate(formData: FormData, key: string) {
  const value = getFormString(formData, key);
  if (!value) return new Date();
  return new Date(`${value}T00:00:00`);
}

export function getFormDecimal(formData: FormData, key: string, fallback = "0") {
  const value = getFormString(formData, key).replace(/\s/g, "");
  if (!value) return fallback;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toString() : fallback;
}
