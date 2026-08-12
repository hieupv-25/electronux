"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./Toast";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
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
          <WishlistProvider>
            {children}
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
