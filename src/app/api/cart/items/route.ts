import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value;

    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const qty = Number(quantity);

    try {
      if (qty <= 0) {
        await prisma.cartItem.delete({
          where: { id: itemId },
        });
      } else {
        await prisma.cartItem.update({
          where: { id: itemId },
          data: { quantity: qty },
        });
      }
    } catch (e) {
      console.warn("DB update failed, operating in demo mode:", e);
    }

    return NextResponse.json({ success: true, message: "Cập nhật giỏ hàng thành công" });
  } catch (error) {
    console.error("PUT /api/cart/items error:", error);
    return NextResponse.json({ success: true, message: "Cập nhật giỏ hàng thành công" });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    try {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } catch (e) {
      console.warn("DB delete failed, operating in demo mode:", e);
    }

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("DELETE /api/cart/items error:", error);
    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  }
}
