import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  try {
    // Map tab type to OrderStatus or PaymentStatus filters
    const whereClause: Prisma.OrderWhereInput = {
      userId: session.user.id,
      deletedAt: null,
      paymentStatus: "paid",
    };

    if (type === "current") {
      whereClause.status = { in: ["pending", "processing", "shipping"] };
    } else if (type === "past") {
      whereClause.status = { in: ["completed", "cancelled"] };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Client-side search filter if query string search is provided
    let filteredOrders = orders;
    if (search) {
      filteredOrders = orders.filter((order) => {
        const matchesId = order.id.toLowerCase().includes(search);
        const matchesItem = order.items.some((item) =>
          item.variant.product.name.toLowerCase().includes(search)
        );
        return matchesId || matchesItem;
      });
    }

    return NextResponse.json({ orders: filteredOrders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Lỗi tải lịch sử mua hàng" }, { status: 500 });
  }
}
