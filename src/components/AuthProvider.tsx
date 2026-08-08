"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./Toast";
import { CartProvider } from "./CartContext";
import CartDrawer from "./CartDrawer";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
