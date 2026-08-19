import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateCouponCode } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = (await req.json()) as {
      code?: string;
      subtotal?: number | string;
    };

    const result = await validateCouponCode({
      code: body.code,
      subtotal: Number(body.subtotal ?? 0),
      userId: session?.user?.id,
    });

    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json(
      { valid: false, message: "Không thể kiểm tra mã giảm giá lúc này." },
      { status: 500 }
    );
  }
}
