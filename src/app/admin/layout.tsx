import Link from "next/link";
import type { ReactNode } from "react";
import AdminSessionActions from "@/components/admin/AdminSessionActions";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();
  const adminName = `${session.user.firstName} ${session.user.lastName}`.trim();

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <Link className="admin-brand" href="/admin">
          <span className="admin-brand__mark">E</span>
          <span>
            <strong>Electrolux</strong>
            <small>Admin Center</small>
          </span>
        </Link>
        <AdminNav />
        <div className="admin-sidebar__footer">
          <span>Đăng nhập với vai trò</span>
          <strong>{session.user.role}</strong>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Quản trị hệ thống</p>
            <h1>Electrolux Việt Nam</h1>
          </div>
          <div className="admin-topbar__actions">
            <AdminSessionActions />
            <div className="admin-user-pill">
              <span>{adminName || "Admin"}</span>
              <strong>{session.user.email}</strong>
            </div>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
