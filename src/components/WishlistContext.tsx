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
import { ALL_CATEGORIES } from "@/lib/getCategoryData";

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
  toggleWishlist: (productOrId: string | WishlistProduct) => Promise<void>;
  removeItem: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "electronux_wishlist_items";

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

  // Helper to resolve product details if only ID is provided
  const findProductById = (id: string): WishlistProduct | null => {
    for (const cat of ALL_CATEGORIES) {
      const p = cat.products.find((prod) => prod.id === id || prod.slug === id);
      if (p) {
        return {
          id: p.id,
          productId: p.id,
          name: p.name,
          slug: p.slug,
          image: p.img,
          price: p.price,
          oldPrice: p.oldPrice,
          categorySlug: cat.slug,
          url: `/thiet-bi/${cat.slug}/${p.slug}`,
        };
      }
    }
    return null;
  };

  // Load from local storage
  const loadLocalItems = (): WishlistProduct[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save to local storage
  const saveLocalItems = (newItems: WishlistProduct[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  };

  const refreshWishlist = useCallback(async () => {
    const local = loadLocalItems();

    if (!session?.user?.id) {
      setItems(local);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        const apiItems: WishlistProduct[] = Array.isArray(data.items) ? data.items : [];
        
        // Merge local items with API items if needed
        const combined = [...apiItems];
        for (const loc of local) {
          if (!combined.some((item) => item.productId === loc.productId || item.id === loc.id)) {
            combined.push(loc);
          }
        }
        setItems(combined);
        saveLocalItems(combined);
      } else {
        setItems(local);
      }
    } catch {
      setItems(local);
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
    async (productOrId: string | WishlistProduct) => {
      let targetProduct: WishlistProduct | null = null;
      let targetId = "";

      if (typeof productOrId === "string") {
        targetId = productOrId;
        targetProduct = findProductById(productOrId);
      } else {
        targetProduct = productOrId;
        targetId = productOrId.productId || productOrId.id;
      }

      setTogglingId(targetId);

      const currentlySaved = items.some(
        (item) => item.productId === targetId || item.id === targetId || item.slug === targetId
      );

      let newItems: WishlistProduct[];

      if (currentlySaved) {
        newItems = items.filter(
          (item) => item.productId !== targetId && item.id !== targetId && item.slug !== targetId
        );
        showToast("Đã xóa sản phẩm khỏi danh sách yêu thích.", "info");
      } else {
        const itemToAdd = targetProduct || {
          id: targetId,
          productId: targetId,
          name: "Sản phẩm Electrolux",
          slug: targetId,
          image: "/electrolux_logo.svg",
          price: 0,
          oldPrice: 0,
        };
        newItems = [itemToAdd, ...items];
        showToast("Đã thêm sản phẩm vào danh sách yêu thích!", "success");
      }

      setItems(newItems);
      saveLocalItems(newItems);

      // If user is logged in, sync with API in background
      if (session?.user?.id && targetId) {
        try {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: targetId }),
          });
        } catch (error) {
          console.warn("Background API wishlist sync failed:", error);
        }
      }

      setTogglingId(null);
    },
    [items, session?.user?.id, showToast]
  );

  const removeItem = useCallback(
    (productId: string) => {
      const updated = items.filter(
        (item) => item.productId !== productId && item.id !== productId && item.slug !== productId
      );
      setItems(updated);
      saveLocalItems(updated);
      showToast("Đã xóa sản phẩm khỏi danh sách yêu thích.", "info");

      if (session?.user?.id) {
        void fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
    },
    [items, session?.user?.id, showToast]
  );

  const isSaved = useCallback(
    (productId: string) =>
      items.some(
        (item) => item.productId === productId || item.id === productId || item.slug === productId
      ),
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
      removeItem,
    }),
    [items, loading, togglingId, isSaved, refreshWishlist, toggleWishlist, removeItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
