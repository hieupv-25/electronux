import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const carts = await prisma.cart.count();
    const items = await prisma.cartItem.count();
    return NextResponse.json({ ok: true, carts, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
