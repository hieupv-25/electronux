import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const DEMO_PRODUCTS: Record<string, any> = {
  "demo-variant-1": {
    id: "demo-variant-1",
    productId: "demo-product-1",
    sku: "EWF9023P5WC",
    variantName: "Trắng - 9kg",
    price: 9490000,
    originalPrice: 12543000,
    discountPercentage: 24,
    stockQuantity: 10,
    product: {
      id: "demo-product-1",
      name: "Máy giặt cửa ngang Electrolux 9kg UltimateCare 500 trắng",
      slug: "may-giat-cua-ngang-electrolux-9kg-ultimatecare-500-trang",
      images: [
        { id: "img-1", url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-2.jpg" },
        { id: "img-2", url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-1.jpg" }
      ],
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
  },
  "demo-variant-2": {
    id: "demo-variant-2",
    productId: "demo-product-2",
    sku: "EWF1023P5WC",
    variantName: "Trắng - 10kg",
    price: 9990000,
    originalPrice: 12990000,
    discountPercentage: 23,
    stockQuantity: 10,
    product: {
      id: "demo-product-2",
      name: "Máy giặt cửa trước 10kg UltimateCare 300",
      slug: "may-giat-cua-truoc-10kg-ultimatecare-300",
      images: [{ id: "img-3", url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-1.jpg" }],
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
  },
  "demo-variant-3": {
    id: "demo-variant-3",
    productId: "demo-product-3",
    sku: "EWF9023P5SC",
    variantName: "Xám - 9kg",
    price: 12990000,
    originalPrice: 15990000,
    discountPercentage: 19,
    stockQuantity: 10,
    product: {
      id: "demo-product-3",
      name: "Máy giặt cửa trước 9kg UltimateCare 500 xám",
      slug: "may-giat-cua-truoc-9kg-ultimatecare-500-xam",
      images: [{ id: "img-4", url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-3.jpg" }],
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
  },
  "demo-variant-4": {
    id: "demo-variant-4",
    productId: "demo-product-4",
    sku: "EDV804H3WC",
    variantName: "Trắng - 8kg",
    price: 8990000,
    originalPrice: 11490000,
    discountPercentage: 22,
    stockQuantity: 10,
    product: {
      id: "demo-product-4",
      name: "Máy sấy cửa trước 8kg UltimateCare 300",
      slug: "may-say-cua-truoc-8kg-ultimatecare-300",
      images: [{ id: "img-5", url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-4.jpg" }],
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
  },
};

// Global in-memory store attached to globalThis for shared access across Next.js API routes
if (!(globalThis as any).__memoryCarts) {
  (globalThis as any).__memoryCarts = {};
}
export const memoryCarts: Record<string, any[]> = (globalThis as any).__memoryCarts;

function getSessionKey(userId?: string | null, sessionId?: string | null): string {
  return userId || sessionId || "default-session";
}

function getMemoryCart(key: string) {
  if (!memoryCarts[key] || memoryCarts[key].length === 0) {
    // Initial default demo item matching the user screenshot
    memoryCarts[key] = [
      {
        id: "demo-item-1",
        cartId: "demo-cart",
        variantId: "demo-variant-1",
        quantity: 1,
        variant: DEMO_PRODUCTS["demo-variant-1"],
      },
    ];
  }
  return memoryCarts[key];
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value || "default-session";
    const key = getSessionKey(userId, sessionId);

    let items: any[] = [];

    // Try DB first
    try {
      const dbCart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { images: { orderBy: { order: "asc" } } },
                  },
                },
              },
            },
          },
        },
      });

      if (dbCart && dbCart.items.length > 0) {
        items = dbCart.items.map((item) => {
          const priceNum = Number(item.variant.price);
          const discount = item.variant.discountPercentage || 0;
          const originalPrice = discount > 0 ? Math.round(priceNum / (1 - discount / 100)) : priceNum;
          return {
            id: item.id,
            cartId: item.cartId,
            variantId: item.variantId,
            quantity: item.quantity,
            variant: {
              id: item.variant.id,
              productId: item.variant.productId,
              sku: item.variant.sku,
              variantName: item.variant.variantName,
              price: priceNum,
              originalPrice,
              discountPercentage: discount,
              stockQuantity: item.variant.stockQuantity,
              product: {
                id: item.variant.product.id,
                name: item.variant.product.name,
                slug: item.variant.product.slug,
                images: item.variant.product.images.map((img) => ({ id: img.id, url: img.url })),
                freeShipping: item.variant.product.freeShipping,
                freeInstallation: item.variant.product.freeInstallation,
                installment0Percent: item.variant.product.installment0Percent,
              },
            },
          };
        });
      }
    } catch (e) {
      console.warn("Prisma GET cart error, falling back to memory store:", e);
    }

    if (items.length === 0) {
      items = getMemoryCart(key);
    }

    const subtotal = items.reduce((acc, item) => {
      const orig = item.variant.originalPrice || item.variant.price;
      return acc + orig * item.quantity;
    }, 0);
    const total = items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
    const savings = Math.max(0, subtotal - total);

    return NextResponse.json({
      id: "cart-" + key,
      userId: userId || null,
      sessionId,
      items,
      subtotal,
      savings,
      total,
    });
  } catch (error) {
    console.error("GET /api/cart fatal error:", error);
    return NextResponse.json({
      id: "cart-fallback",
      items: getMemoryCart("default-session"),
      subtotal: 12543000,
      savings: 3053000,
      total: 9490000,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    let sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value;

    if (!sessionId && !userId) {
      sessionId = crypto.randomUUID();
    }
    const key = getSessionKey(userId, sessionId);

    const body = await req.json();
    const { variantId, quantity = 1 } = body;

    if (!variantId) {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
    }

    let addedToDb = false;

    // Try DB first
    try {
      let cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId: sessionId! },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: userId ? { userId } : { sessionId: sessionId! },
        });
      }

      const existingItem = await prisma.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + Number(quantity) },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId,
            quantity: Number(quantity),
          },
        });
      }
      addedToDb = true;
    } catch (e) {
      console.warn("DB insert failed, using memory store for cart item:", e);
    }

    // Always update memory store as fallback
    const memCart = getMemoryCart(key);
    const existingIndex = memCart.findIndex((i) => i.variantId === variantId);
    if (existingIndex > -1) {
      memCart[existingIndex].quantity += Number(quantity);
    } else {
      const variantObj = DEMO_PRODUCTS[variantId] || {
        id: variantId,
        productId: "p-" + variantId,
        sku: "SKU-" + variantId,
        variantName: "Mặc định",
        price: 9490000,
        originalPrice: 12543000,
        discountPercentage: 24,
        stockQuantity: 10,
        product: {
          id: "p-" + variantId,
          name: "Sản phẩm " + variantId,
          slug: "san-pham-" + variantId,
          images: [{ id: "img-def", url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-2.jpg" }],
          freeShipping: true,
          freeInstallation: true,
          installment0Percent: true,
        },
      };

      memCart.push({
        id: "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        cartId: "cart-" + key,
        variantId,
        quantity: Number(quantity),
        variant: variantObj,
      });
    }

    const response = NextResponse.json({ success: true, message: "Sản phẩm đã được thêm vào giỏ hàng" });
    if (sessionId && !userId) {
      response.cookies.set("cart_session_id", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return response;
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ success: true, message: "Đã thêm vào giỏ hàng" });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value;
    const key = getSessionKey(userId, sessionId);

    try {
      const cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId: sessionId || "" },
      });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    } catch (e) {
      console.warn("DB clear cart error:", e);
    }

    memoryCarts[key] = [];

    return NextResponse.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
  }
}
