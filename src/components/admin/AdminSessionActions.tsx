"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminSessionActions() {
  return (
    <>
      <Link className="admin-ghost-link" href="/?view=customer">
        Xem website
      </Link>
      <button
        type="button"
        className="admin-ghost-link admin-logout-button"
        onClick={() => signOut({ callbackUrl: "/?view=customer" })}
      >
        Đăng xuất
      </button>
    </>
  );
}
