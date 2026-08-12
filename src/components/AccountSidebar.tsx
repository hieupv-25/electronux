"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type AccountSidebarProps = {
  activeHref: string;
};

export default function AccountSidebar({ activeHref }: AccountSidebarProps) {
  const { data: session } = useSession();
  const [firstName, setFirstName] = useState(session?.user?.firstName || "viv");
  const [lastName, setLastName] = useState(session?.user?.lastName || "vietttihnl");

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setFirstName(data.user.firstName || "viv");
            setLastName(data.user.lastName || "vietttihnl");
          }
        }
      } catch (err) {
        // Fallback to session
      }
    };
    fetchAccount();
  }, []);

  const sidebarItems = [
    {
      label: "Chi tiết tài khoản",
      href: "/account",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Lịch sử mua hàng",
      href: "/account/orders",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
    },
    {
      label: "Gói Đăng ký Định kỳ",
      href: "/account/subscriptions",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      ),
    },
    {
      label: "Sản phẩm đã đăng ký",
      href: "/account/registered-products",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      label: "Lịch sử dịch vụ",
      href: "/account/service-history",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      label: "Danh sách yêu thích",
      href: "/account/wishlist",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      ),
    },
    {
      label: "Danh sách nhắc nhở",
      href: "/account/reminders",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="account-sidebar">
      <div className="account-sidebar__user">
        <div className="account-sidebar__avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="account-sidebar__greeting">
          <span className="account-sidebar__welcome">Xin chào</span>
          <span className="account-sidebar__name">
            {firstName} {lastName}
          </span>
        </div>
      </div>

      <nav className="account-sidebar__nav">
        {sidebarItems.map((item, index) => {
          const isActive = activeHref === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={`account-sidebar__item ${isActive ? "account-sidebar__item--active" : ""}`}
            >
              <span className="account-sidebar__icon">{item.icon}</span>
              <span className="account-sidebar__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
