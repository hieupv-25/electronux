import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!email || !emailPattern.test(email)) {
      return NextResponse.json(
        { message: "Vui lòng nhập email hợp lệ." },
        { status: 400 }
      );
    }

    const successResponse = NextResponse.json({
      message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.",
    });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      return successResponse;
    }

    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    const rawToken = randomUUID();
    const hashedToken = await hash(rawToken, 10);

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin;
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    if (process.env.NODE_ENV !== "production") {
      console.log("\n========================================");
      console.log("PASSWORD RESET LINK (DEV ONLY)");
      console.log("========================================");
      console.log(`Email: ${email}`);
      console.log(`Link: ${resetUrl}`);
      console.log("========================================\n");
    }

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
