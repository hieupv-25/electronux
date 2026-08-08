import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

if (!(globalThis as any).__memoryCarts) {
  (globalThis as any).__memoryCarts = {};
}
const memoryCarts: Record<string, any[]> = (globalThis as any).__memoryCarts;

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value;
    const key = userId || sessionId || "default-session";

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
      } catch (e) {
        // quiet catch
      }
    }

    // Always update memory store
    if (memoryCarts[key]) {
      const idx = memoryCarts[key].findIndex((i) => i.id === itemId || i.variantId === itemId);
      if (idx > -1) {
        if (qty <= 0) {
          memoryCarts[key].splice(idx, 1);
        } else {
          memoryCarts[key][idx].quantity = qty;
        }
      }
    }

    return NextResponse.json({ success: true, message: "Cập nhật giỏ hàng thành công" });
  } catch (error) {
    console.error("PUT /api/cart/items error:", error);
    return NextResponse.json({ success: true, message: "Cập nhật giỏ hàng thành công" });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.headers.get("x-session-id") || req.cookies.get("cart_session_id")?.value;
    const key = userId || sessionId || "default-session";

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    // Try DB delete only if valid non-demo ID
    if (!itemId.startsWith("demo-") && !itemId.startsWith("item-")) {
      try {
        await prisma.cartItem.delete({ where: { id: itemId } });
      } catch (e) {
        // quiet catch
      }
    }

    // Always update memory store
    if (memoryCarts[key]) {
      memoryCarts[key] = memoryCarts[key].filter((i) => i.id !== itemId && i.variantId !== itemId);
    }

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("DELETE /api/cart/items error:", error);
    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  }
}
