import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { memoryCarts } from "../route";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const qty = Number(quantity);

    // Try DB update only if valid non-demo ID
    if (!itemId.startsWith("demo-") && !itemId.startsWith("item-")) {
      try {
        if (qty <= 0) {
          await prisma.cartItem.delete({ where: { id: itemId } });
        } else {
          await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: qty },
          });
        }
      } catch {
        // quiet catch
      }
    }

    // Always update memory store
    if (memoryCarts[userId]) {
      const idx = memoryCarts[userId].findIndex((i) => i.id === itemId || i.variantId === itemId);
      if (idx > -1) {
        if (qty <= 0) {
          memoryCarts[userId].splice(idx, 1);
        } else {
          memoryCarts[userId][idx].quantity = qty;
        }
      }
    }

    return NextResponse.json({ success: true, message: "Cập nhật giỏ hàng thành công" });
  } catch (error) {
    console.error("PUT /api/cart/items error:", error);
    return NextResponse.json({ success: false, message: "Cập nhật giỏ hàng thất bại" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    // Try DB delete only if valid non-demo ID
    if (!itemId.startsWith("demo-") && !itemId.startsWith("item-")) {
      try {
        await prisma.cartItem.delete({ where: { id: itemId } });
      } catch {
        // quiet catch
      }
    }

    // Always update memory store
    if (memoryCarts[userId]) {
      memoryCarts[userId] = memoryCarts[userId].filter((i) => i.id !== itemId && i.variantId !== itemId);
    }

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("DELETE /api/cart/items error:", error);
    return NextResponse.json({ success: false, message: "Xóa sản phẩm thất bại" }, { status: 500 });
  }
}
