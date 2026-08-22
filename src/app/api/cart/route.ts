import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { maintenanceServiceFallback } from "@/data/maintenanceServices";
import { ALL_CATEGORIES } from "@/lib/getCategoryData";

export type CartVariantSnapshot = {
  id: string;
  productId: string;
  sku: string;
  variantName: string | null;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stockQuantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: { id: string; url: string }[];
    freeShipping: boolean;
    freeInstallation: boolean;
    installment0Percent: boolean;
  };
};

export type MemoryCartItem = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: CartVariantSnapshot;
};

type MemoryCartStore = Record<string, MemoryCartItem[]>;
type MemoryCartGlobal = typeof globalThis & {
  __memoryCarts?: MemoryCartStore;
};

export const DEMO_PRODUCTS: Record<string, CartVariantSnapshot> = {
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
        {
          id: "img-1",
          url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-2.jpg",
        },
        {
          id: "img-2",
          url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-1.jpg",
        },
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
      images: [
        {
          id: "img-3",
          url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-1.jpg",
        },
      ],
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
      images: [
        {
          id: "img-4",
          url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-3.jpg",
        },
      ],
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
      images: [
        {
          id: "img-5",
          url: "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-4.jpg",
        },
      ],
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
  },
};

// ============================================================
// Maintenance service products
// ============================================================

for (const service of maintenanceServiceFallback) {
  DEMO_PRODUCTS[service.variantId] = {
    id: service.variantId,
    productId: `service-${service.sku}`,
    sku: service.sku,
    variantName: "Gói tiêu chuẩn",
    price: service.price,
    originalPrice: service.price,
    discountPercentage: 0,
    stockQuantity: 99999,
    product: {
      id: `service-${service.sku}`,
      name: service.name,
      slug: service.slug,
      images: [
        {
          id: `service-image-${service.sku}`,
          url: service.imageUrl,
        },
      ],
      freeShipping: false,
      freeInstallation: false,
      installment0Percent: false,
    },
  };
}

// ============================================================
// Load products from ALL_CATEGORIES
// ============================================================

for (const category of ALL_CATEGORIES) {
  for (const prod of category.products) {
    const priceNum = prod.price;
    const origPrice = prod.oldPrice || prod.price;

    const discount =
      origPrice > priceNum
        ? Math.round(((origPrice - priceNum) / origPrice) * 100)
        : 0;

    const snapshot: CartVariantSnapshot = {
      id: prod.variantId || prod.id,
      productId: prod.id,
      sku: prod.sku,
      variantName: prod.color ? `Màu ${prod.color}` : "Mặc định",
      price: priceNum,
      originalPrice: origPrice,
      discountPercentage: discount,
      stockQuantity: 100,

      product: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,

        images: [
          {
            id: `img-${prod.sku}`,
            url: prod.img,
          },
        ],

        freeShipping: prod.freeShipping ?? true,
        freeInstallation: prod.freeInstallation ?? false,
        installment0Percent: prod.installment0Percent ?? false,
      },
    };

    DEMO_PRODUCTS[prod.id] = snapshot;

    if (prod.variantId) {
      DEMO_PRODUCTS[prod.variantId] = snapshot;
    }
  }
}

// ============================================================
// Global in-memory cart store
// ============================================================

const memoryGlobal = globalThis as MemoryCartGlobal;

export const memoryCarts: MemoryCartStore =
  memoryGlobal.__memoryCarts ??
  (memoryGlobal.__memoryCarts = {});

// ============================================================
// Helpers
// ============================================================

function getSessionKey(
  userId?: string | null,
  sessionId?: string | null
): string {
  return userId || sessionId || "default-session";
}

function getMemoryCart(key: string): MemoryCartItem[] {
  if (memoryCarts[key] === undefined) {
    memoryCarts[key] = [];
  }

  return memoryCarts[key];
}

// ============================================================
// GET CART
// ============================================================

export async function GET() {
  try {
    const session = await auth();

    const userId = session?.user?.id;

    const cartKey = getSessionKey(userId, "guest-session");

    let items: MemoryCartItem[] = [];
    let dbFound = false;

    // ========================================================
    // Try DB first if logged in
    // ========================================================

    if (userId) {
      try {
        let dbCart = await prisma.cart.findFirst({
          where: { userId },

          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        images: {
                          orderBy: {
                            order: "asc",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Create cart if user doesn't have one
        if (!dbCart) {
          dbCart = await prisma.cart.create({
            data: {
              userId,
            },

            include: {
              items: {
                include: {
                  variant: {
                    include: {
                      product: {
                        include: {
                          images: {
                            orderBy: {
                              order: "asc",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        }

        if (dbCart) {
          dbFound = true;

          if (dbCart.items.length > 0) {
            items = dbCart.items.map((item) => {
              const priceNum = Number(item.variant.price);

              const discount =
                item.variant.discountPercentage || 0;

              const originalPrice =
                discount > 0
                  ? Math.round(
                      priceNum / (1 - discount / 100)
                    )
                  : priceNum;

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

                  stockQuantity:
                    item.variant.stockQuantity,

                  product: {
                    id: item.variant.product.id,
                    name: item.variant.product.name,
                    slug: item.variant.product.slug,

                    images:
                      item.variant.product.images.map(
                        (img) => ({
                          id: img.id,
                          url: img.url,
                        })
                      ),

                    freeShipping:
                      item.variant.product.freeShipping,

                    freeInstallation:
                      item.variant.product.freeInstallation,

                    installment0Percent:
                      item.variant.product
                        .installment0Percent,
                  },
                },
              };
            });
          }
        }
      } catch (e) {
        console.warn(
          "Prisma GET cart error, falling back to memory store:",
          e
        );
      }
    }

    // ========================================================
    // Fallback to memory cart
    // ========================================================

    if (!dbFound) {
      const memItems = getMemoryCart(cartKey);

      if (memItems && memItems.length > 0) {
        items = memItems;
      }
    }

    // ========================================================
    // Calculate totals
    // ========================================================

    const subtotal = items.reduce((acc, item) => {
      const orig =
        item.variant.originalPrice ||
        item.variant.price;

      return acc + orig * item.quantity;
    }, 0);

    const total = items.reduce((acc, item) => {
      return (
        acc +
        item.variant.price * item.quantity
      );
    }, 0);

    const savings = Math.max(
      0,
      subtotal - total
    );

    return NextResponse.json({
      id: "cart-" + cartKey,
      userId: userId || null,
      items,
      subtotal,
      savings,
      total,
    });
  } catch (error) {
    console.error(
      "GET /api/cart fatal error:",
      error
    );

    return NextResponse.json({
      id: "cart-empty",
      items: [],
      subtotal: 0,
      savings: 0,
      total: 0,
    });
  }
}

// ============================================================
// ADD TO CART
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
          authRequired: true,
        },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      variantId?: string;
      quantity?: number;
    };

    const {
      variantId,
      quantity = 1,
    } = body;

    if (!variantId) {
      return NextResponse.json(
        {
          error: "Missing variantId",
        },
        {
          status: 400,
        }
      );
    }

    const qtyNum = Math.max(1, Number(quantity) || 1);

    const variant = await prisma.productVariant.findFirst({
      where: {
        OR: [{ id: variantId }, { productId: variantId }, { sku: variantId }],
        isActive: true,
        product: {
          isActive: true,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        stockQuantity: true,
        product: { select: { name: true } },
      },
    });

    if (!variant) {
      return NextResponse.json(
        {
          success: false,
          message: "Sản phẩm này chưa thể thêm vào giỏ hàng.",
        },
        { status: 404 }
      );
    }

    let cart = await prisma.cart.findFirst({ where: { userId } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variant.id,
        },
      },
    });
    const nextQuantity = (existingItem?.quantity ?? 0) + qtyNum;

    if (variant.stockQuantity <= 0 || nextQuantity > variant.stockQuantity) {
      return NextResponse.json(
        {
          success: false,
          message:
            variant.stockQuantity <= 0
              ? `${variant.product.name} đang tạm hết hàng.`
              : `${variant.product.name} chỉ còn ${variant.stockQuantity} sản phẩm trong kho.`,
        },
        { status: 409 }
      );
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: variant.id,
          quantity: qtyNum,
        },
      });
    }

    return NextResponse.json({
      success: true,

      message:
        "Sản phẩm đã được thêm vào giỏ hàng",

      remainingStock: variant.stockQuantity - nextQuantity,
    });
  } catch (error) {
    console.error(
      "POST /api/cart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Lỗi server khi thêm vào giỏ hàng",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// CLEAR CART
// ============================================================

export async function DELETE() {
  try {
    const session = await auth();

    const userId = session?.user?.id;

    // ========================================================
    // Clear DB cart
    // ========================================================

    if (userId) {
      try {
        const cart =
          await prisma.cart.findFirst({
            where: {
              userId,
            },
          });

        if (cart) {
          await prisma.cartItem.deleteMany({
            where: {
              cartId: cart.id,
            },
          });
        }
      } catch (e) {
        console.warn(
          "DB clear cart error:",
          e
        );
      }
    }

    // ========================================================
    // Clear memory cart
    // ========================================================

    const cartKey = getSessionKey(userId, "guest-session");
    memoryCarts[cartKey] = [];

    return NextResponse.json({
      success: true,
      message:
        "Đã xóa toàn bộ giỏ hàng",
    });
  } catch (error) {
    console.error(
      "DELETE /api/cart error:",
      error
    );

    return NextResponse.json({
      success: false,
      message:
        "Đã xóa toàn bộ giỏ hàng",
    });
  }
}
