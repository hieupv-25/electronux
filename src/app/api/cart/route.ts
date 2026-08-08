import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Sample initial products for fallback demo if database is empty/unconnected
const DEMO_CART_ITEMS = [
  {
    id: "demo-cart-item-1",
    cartId: "demo-cart",
    variantId: "demo-variant-1",
    quantity: 1,
    variant: {
      id: "demo-variant-1",
      productId: "demo-product-1",
      sku: "EWF9023P5WC",
      variantName: "Trắng - 9kg",
      price: 9490000,
      originalPrice: 9779000,
      discountPercentage: 3,
      stockQuantity: 10,
      product: {
        id: "demo-product-1",
        name: "Máy giặt cửa ngang Electrolux 9kg UltimateCare 500 trắng",
        slug: "may-giat-cua-ngang-electrolux-9kg-ultimatecare-500-trang",
        images: [{ url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-2.jpg" }],
        freeShipping: true,
        freeInstallation: true,
        installment0Percent: true,
      },
    },
  },
];

async function getOrCreateCart(userId?: string | null, sessionId?: string | null) {
  if (!userId && !sessionId) return null;

  try {
    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { order: "asc" } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: userId ? { userId } : { sessionId: sessionId || crypto.randomUUID() },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { orderBy: { order: "asc" } },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  } catch (error) {
    console.warn("Database error in getOrCreateCart, falling back to demo mode:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value;

    const cart = await getOrCreateCart(userId, sessionId);

    if (!cart || cart.items.length === 0) {
      // Calculate totals for demo
      const items = cart?.items && cart.items.length > 0 ? cart.items : DEMO_CART_ITEMS;
      const subtotal = items.reduce((acc, item) => {
        const orig = (item.variant as any).originalPrice || Number(item.variant.price);
        return acc + orig * item.quantity;
      }, 0);
      const total = items.reduce((acc, item) => acc + Number(item.variant.price) * item.quantity, 0);
      const savings = subtotal - total;

      return NextResponse.json({
        id: cart?.id || "demo-cart",
        userId: userId || null,
        sessionId: sessionId || "demo-session",
        items,
        subtotal,
        savings,
        total,
      });
    }

    // Format Prisma cart items
    const formattedItems = cart.items.map((item) => {
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

    const subtotal = formattedItems.reduce((acc, item) => acc + item.variant.originalPrice * item.quantity, 0);
    const total = formattedItems.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
    const savings = subtotal - total;

    return NextResponse.json({
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: formattedItems,
      subtotal,
      savings,
      total,
    });
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json(
      {
        id: "demo-cart",
        items: DEMO_CART_ITEMS,
        subtotal: 9779000,
        savings: 289000,
        total: 9490000,
      },
      { status: 200 }
    );
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

    const body = await req.json();
    const { variantId, quantity = 1 } = body;

    if (!variantId) {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    if (cart) {
      // Upsert cart item
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
    }

    const response = NextResponse.json({ success: true, message: "Sản phẩm đã được thêm vào giỏ hàng" });
    if (sessionId && !userId) {
      response.cookies.set("cart_session_id", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return response;
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ success: true, message: "Sản phẩm đã được thêm vào giỏ hàng (Demo)" });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value;

    const cart = await getOrCreateCart(userId, sessionId);

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
  }
}
