export const maintenanceGroups = [
  { value: "garment-care", label: "Chăm sóc trang phục", productTypes: ["Máy giặt", "Máy sấy", "Máy giặt sấy"] },
  { value: "kitchen-care", label: "Dụng cụ nhà bếp", productTypes: ["Bếp", "Lò nướng", "Máy hút mùi", "Máy rửa chén", "Tủ lạnh"] },
  { value: "home-care", label: "Chăm sóc nhà cửa", productTypes: ["Máy hút bụi", "Máy lọc không khí", "Máy hút ẩm", "Máy nước nóng"] },
] as const;

export function getMaintenanceGroup(value?: string | null) {
  return maintenanceGroups.find((group) => group.value === value);
}

export function maintenanceGroupFromSpecifications(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const specifications = value as Record<string, unknown>;
  const storedValue = typeof specifications.serviceGroupKey === "string" ? specifications.serviceGroupKey : null;
  if (storedValue && getMaintenanceGroup(storedValue)) return storedValue;
  if (specifications.serviceGroup === "Chăm sóc trang phục") return "garment-care";
  return null;
}
