import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

function toWishlistItem(item: {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    category?: { slug: string } | null;
    images: { url: string }[];
    variants: { price: Prisma.Decimal | number | string; discountPercentage: number; isActive: boolean }[];
  };
}) {
  const product = item.product;
  const variant = product.variants.filter((v) => v.isActive).sort((a, b) => Number(a.price) - Number(b.price))[0];
  const priceValue = Number(variant?.price ?? 0);
  const discount = variant?.discountPercentage ?? 0;
  const originalPrice = discount > 0 ? Math.round(priceValue / (1 - discount / 100)) : priceValue;

  return {
    id: item.id,
    productId: item.productId,
    name: product.name,
    slug: product.slug,
    image: product.images[0]?.url || "",
    price: priceValue,
    oldPrice: originalPrice,
    categorySlug: product.category?.slug,
    url: product.category?.slug ? `/thiet-bi/${product.category.slug}/${product.slug}` : `/`,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
    include: {
      items: {
        orderBy: { addedAt: "desc" },
        include: {
          product: {
            include: {
              category: true,
              images: { orderBy: { order: "asc" } },
              variants: {
                where: { isActive: true },
                orderBy: { price: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    items: wishlist.items.map((item) => toWishlistItem(item)),
    count: wishlist.items.length,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Vui lòng đăng nhập để tiếp tục." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";

  if (!productId) {
    return NextResponse.json({ message: "Thiếu productId." }, { status: 400 });
  }

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  const productExists = await prisma.product.findFirst({
    where: {
      OR: [
        { id: productId },
        { slug: productId },
        { variants: { some: { id: productId } } },
      ],
    },
    select: { id: true },
  });

  if (!productExists) {
    return NextResponse.json(
      {
        success: false,
        message: "Sản phẩm không tồn tại hoặc chưa được đồng bộ với dữ liệu hệ thống.",
      },
      { status: 400 }
    );
  }

  const realProductId = productExists.id;

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId: realProductId,
      },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      added: false,
      message: "Đã xóa sản phẩm khỏi danh sách yêu thích.",
    });
  }

  try {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: realProductId,
      },
    });
  } catch (error) {
    console.error("Create wishlist item failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể lưu sản phẩm vào danh sách yêu thích.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    added: true,
    message: "Đã thêm sản phẩm vào danh sách yêu thích.",
  });
}
