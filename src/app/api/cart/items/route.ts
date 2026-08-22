import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function authRequiredResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Vui lòng đăng nhập để quản lý giỏ hàng.",
      authRequired: true,
    },
    { status: 401 }
  );
}

function cartItemLookup(cartId: string, itemId: string) {
  return {
    cartId,
    OR: [
      { id: itemId },
      { variantId: itemId },
      { variant: { id: itemId } },
      { variant: { sku: itemId } },
      { variant: { productId: itemId } },
    ],
  };
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return authRequiredResponse();

    const body = await req.json();
    const itemId = String(body.itemId || "");
    const qty = Math.max(0, Number(body.quantity) || 0);

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "Thiếu mã sản phẩm trong giỏ hàng." },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy giỏ hàng." },
        { status: 404 }
      );
    }

    const item = await prisma.cartItem.findFirst({
      where: cartItemLookup(cart.id, itemId),
      include: {
        variant: {
          select: {
            stockQuantity: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng." },
        { status: 404 }
      );
    }

    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
    }

    if (item.variant.stockQuantity <= 0 || qty > item.variant.stockQuantity) {
      return NextResponse.json(
        {
          success: false,
          message:
            item.variant.stockQuantity <= 0
              ? `${item.variant.product.name} đang tạm hết hàng.`
              : `${item.variant.product.name} chỉ còn ${item.variant.stockQuantity} sản phẩm trong kho.`,
        },
        { status: 409 }
      );
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: qty },
    });

    return NextResponse.json({ success: true, message: "Cập nhật giỏ hàng thành công" });
  } catch (error) {
    console.error("PUT /api/cart/items error:", error);
    return NextResponse.json(
      { success: false, message: "Cập nhật giỏ hàng thất bại" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return authRequiredResponse();

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "Thiếu mã sản phẩm trong giỏ hàng." },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
    }

    await prisma.cartItem.deleteMany({
      where: cartItemLookup(cart.id, itemId),
    });

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("DELETE /api/cart/items error:", error);
    return NextResponse.json(
      { success: false, message: "Xóa sản phẩm thất bại" },
      { status: 500 }
    );
  }
}
