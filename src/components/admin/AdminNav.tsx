"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Thống kê", href: "/admin/analytics" },
  { label: "Sản phẩm", href: "/admin/products" },
  { label: "Danh mục", href: "/admin/categories" },
  { label: "Đơn hàng", href: "/admin/orders" },
  { label: "Khách hàng", href: "/admin/customers" },
  { label: "Dịch vụ", href: "/admin/services" },
  { label: "Khuyến mãi", href: "/admin/promotions" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Điều hướng quản trị">
      {adminNavItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            className={
              isActive
                ? "admin-nav__item admin-nav__item--active"
                : "admin-nav__item"
            }
            href={item.href}
            key={item.href}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
