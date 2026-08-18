"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./Toast";

/* ── Types ── */
export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  images: { url: string }[];
  freeShipping: boolean;
  freeInstallation: boolean;
  installment0Percent: boolean;
};

export type CartVariant = {
  id: string;
  sku: string;
  variantName: string | null;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stockQuantity: number;
  product: CartProduct;
};

export type CartItem = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: CartVariant;
};

export type CartData = {
  id: string;
  items: CartItem[];
  subtotal: number;
  savings: number;
  total: number;
};

type CartContextType = {
  cart: CartData | null;
  count: number;
  isOpen: boolean;
  loading: boolean;
  adding: string | null;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (e) {
      console.error("Failed to fetch cart:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshCart();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [session?.user?.id, refreshCart]);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setAdding(variantId);
      setIsOpen(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, quantity }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(data.message || "Đã thêm vào giỏ hàng ✓", "success");
          await refreshCart();
        } else {
          showToast(data.message || "Không thể thêm sản phẩm", "error");
        }
      } catch {
        showToast("Lỗi kết nối", "error");
      } finally {
        setAdding(null);
      }
    },
    [showToast, refreshCart]
  );

  const updateQty = useCallback(
    async (itemId: string, quantity: number) => {
      // Optimistically update React state immediately
      setCart((prev) => {
        if (!prev) return null;
        const newItems = prev.items
          .map((i) => {
            if (i.id === itemId || i.variantId === itemId) {
              return { ...i, quantity };
            }
            return i;
          })
          .filter((i) => i.quantity > 0);

        const subtotal = newItems.reduce(
          (acc, i) => acc + (i.variant.originalPrice || i.variant.price) * i.quantity,
          0
        );
        const total = newItems.reduce((acc, i) => acc + i.variant.price * i.quantity, 0);
        const savings = Math.max(0, subtotal - total);

        return { ...prev, items: newItems, subtotal, total, savings };
      });

      try {
        await fetch("/api/cart/items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, quantity }),
        });
        await refreshCart();
      } catch {
        showToast("Không thể cập nhật số lượng", "error");
        refreshCart();
      }
    },
    [showToast, refreshCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      // Optimistically update React state immediately
      setCart((prev) => {
        if (!prev) return null;
        const newItems = prev.items.filter(
          (i) => i.id !== itemId && i.variantId !== itemId
        );
        const subtotal = newItems.reduce(
          (acc, i) => acc + (i.variant.originalPrice || i.variant.price) * i.quantity,
          0
        );
        const total = newItems.reduce((acc, i) => acc + i.variant.price * i.quantity, 0);
        const savings = Math.max(0, subtotal - total);

        return { ...prev, items: newItems, subtotal, total, savings };
      });

      try {
        await fetch(`/api/cart/items?id=${itemId}`, { method: "DELETE" });
        await refreshCart();
        showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info");
      } catch {
        showToast("Không thể xóa sản phẩm", "error");
        refreshCart();
      }
    },
    [showToast, refreshCart]
  );

  const clearCart = useCallback(async () => {
    // Optimistically update React state immediately
    setCart((prev) => (prev ? { ...prev, items: [], subtotal: 0, total: 0, savings: 0 } : null));

    try {
      await fetch("/api/cart", { method: "DELETE" });
      await refreshCart();
    } catch {
      showToast("Lỗi xóa giỏ hàng", "error");
      refreshCart();
    }
  }, [showToast, refreshCart]);

  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        isOpen,
        loading,
        adding,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
