"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./Toast";

export type WishlistProduct = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  oldPrice: number;
  categorySlug?: string;
  url?: string;
};

type WishlistContextType = {
  items: WishlistProduct[];
  count: number;
  loading: boolean;
  togglingId: string | null;
  isSaved: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function parseJsonResponse(response: Response) {
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!text) {
      throw new Error("Empty response from server");
    }

    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(text);
      } catch (error) {
        throw new Error(`Invalid JSON response: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    throw new Error(`Unexpected response type: ${contentType} - ${text}`);
  }

  const refreshWishlist = useCallback(async () => {
    if (!session?.user?.id) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) {
        throw new Error("Wishlist request failed");
      }
      const data = await parseJsonResponse(res);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshWishlist();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshWishlist]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!session?.user?.id) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("open-auth-modal", { detail: { view: "login" } })
          );
        }
        showToast("Vui lòng đăng nhập để lưu sản phẩm yêu thích.", "info");
        return;
      }

      setTogglingId(productId);

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        const data = await parseJsonResponse(res);
        if (!res.ok) {
          throw new Error(data?.message || "Không thể cập nhật wishlist");
        }

        showToast(data.message || "Đã cập nhật danh sách yêu thích.", "success");
        await refreshWishlist();
      } catch (error) {
        console.error("Toggle wishlist failed:", error);
        showToast(error instanceof Error ? error.message : "Lỗi cập nhật wishlist.", "error");
      } finally {
        setTogglingId(null);
      }
    },
    [session?.user?.id, refreshWishlist, showToast]
  );

  const isSaved = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  );

  const value = useMemo<WishlistContextType>(
    () => ({
      items,
      count: items.length,
      loading,
      togglingId,
      isSaved,
      refreshWishlist,
      toggleWishlist,
    }),
    [items, loading, togglingId, isSaved, refreshWishlist, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
