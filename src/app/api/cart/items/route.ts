import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { memoryCarts, DEMO_PRODUCTS } from "../route";
import { incrementProductStock, decrementProductStock } from "@/lib/getCategoryData";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const qty = Number(quantity);

    // 1. Memory store update across all session keys
    for (const k of Object.keys(memoryCarts)) {
      const list = memoryCarts[k];
      if (Array.isArray(list)) {
        const idx = list.findIndex(
          (i) =>
            i.id === itemId ||
            i.variantId === itemId ||
            i.variant?.id === itemId ||
            i.variant?.sku === itemId ||
            i.variant?.productId === itemId ||
            i.variant?.product?.id === itemId
        );
        if (idx > -1) {
          const item = list[idx];
          const oldQty = item.quantity;
          const variantId = item.variantId;
          const diff = qty - oldQty;

          if (qty <= 0) {
            incrementProductStock(variantId, oldQty);
            if (DEMO_PRODUCTS[variantId]) {
              DEMO_PRODUCTS[variantId].stockQuantity += oldQty;
            }
            try {
              await prisma.productVariant.updateMany({
                where: { OR: [{ id: variantId }, { productId: variantId }, { sku: variantId }] },
                data: { stockQuantity: { increment: oldQty } },
              }).catch(() => {});
            } catch {}
            list.splice(idx, 1);
          } else if (diff !== 0) {
            if (diff > 0) {
              decrementProductStock(variantId, diff);
              if (DEMO_PRODUCTS[variantId]) {
                DEMO_PRODUCTS[variantId].stockQuantity = Math.max(0, DEMO_PRODUCTS[variantId].stockQuantity - diff);
              }
              try {
                await prisma.productVariant.updateMany({
                  where: { OR: [{ id: variantId }, { productId: variantId }, { sku: variantId }] },
                  data: { stockQuantity: { decrement: diff } },
                }).catch(() => {});
              } catch {}
            } else {
              const restoreQty = Math.abs(diff);
              incrementProductStock(variantId, restoreQty);
              if (DEMO_PRODUCTS[variantId]) {
                DEMO_PRODUCTS[variantId].stockQuantity += restoreQty;
              }
              try {
                await prisma.productVariant.updateMany({
                  where: { OR: [{ id: variantId }, { productId: variantId }, { sku: variantId }] },
                  data: { stockQuantity: { increment: restoreQty } },
                }).catch(() => {});
              } catch {}
            }
            item.quantity = qty;
          }
        }
      }
    }

    // 2. DB update for logged in users
    if (userId) {
      try {
        const userCart = await prisma.cart.findFirst({ where: { userId } });
        if (userCart) {
          if (qty <= 0) {
            await prisma.cartItem.deleteMany({
              where: {
                cartId: userCart.id,
                OR: [
                  { id: itemId },
                  { variantId: itemId },
                  { variant: { id: itemId } },
                  { variant: { sku: itemId } },
                  { variant: { productId: itemId } },
                ],
              },
            });
          } else {
            const dbItem = await prisma.cartItem.findFirst({
              where: {
                cartId: userCart.id,
                OR: [
                  { id: itemId },
                  { variantId: itemId },
                  { variant: { id: itemId } },
                  { variant: { sku: itemId } },
                  { variant: { productId: itemId } },
                ],
              },
            });
            if (dbItem) {
              await prisma.cartItem.update({
                where: { id: dbItem.id },
                data: { quantity: qty },
              });
            }
          }
        }
      } catch (e) {
        console.warn("Prisma DB cartItem update error:", e);
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
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    // 1. Clear & restore in memoryCarts across all session keys
    for (const k of Object.keys(memoryCarts)) {
      const list = memoryCarts[k];
      if (Array.isArray(list)) {
        const item = list.find(
          (i) =>
            i.id === itemId ||
            i.variantId === itemId ||
            i.variant?.id === itemId ||
            i.variant?.sku === itemId ||
            i.variant?.productId === itemId ||
            i.variant?.product?.id === itemId
        );
        if (item) {
          const restoredQty = item.quantity || 1;
          const variantId = item.variantId;

          incrementProductStock(variantId, restoredQty);
          if (DEMO_PRODUCTS[variantId]) {
            DEMO_PRODUCTS[variantId].stockQuantity += restoredQty;
          }

          try {
            await prisma.productVariant.updateMany({
              where: { OR: [{ id: variantId }, { productId: variantId }, { sku: variantId }] },
              data: { stockQuantity: { increment: restoredQty } },
            }).catch(() => {});
          } catch {}

          memoryCarts[k] = list.filter(
            (i) =>
              i.id !== itemId &&
              i.variantId !== itemId &&
              i.variant?.id !== itemId &&
              i.variant?.sku !== itemId &&
              i.variant?.productId !== itemId &&
              i.variant?.product?.id !== itemId
          );
        }
      }
    }

    // 2. Clear in Prisma DB if user logged in
    if (userId) {
      try {
        const userCart = await prisma.cart.findFirst({ where: { userId } });
        if (userCart) {
          await prisma.cartItem.deleteMany({
            where: {
              cartId: userCart.id,
              OR: [
                { id: itemId },
                { variantId: itemId },
                { variant: { id: itemId } },
                { variant: { sku: itemId } },
                { variant: { productId: itemId } },
              ],
            },
          });
        }
      } catch (e) {
        console.warn("Prisma DB cartItem delete error:", e);
      }
    }

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("DELETE /api/cart/items error:", error);
    return NextResponse.json({ success: false, message: "Xóa sản phẩm thất bại" }, { status: 500 });
  }
}
