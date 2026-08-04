import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Vui lòng nhập email." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Always return success to avoid leaking whether email exists
    const successResponse = NextResponse.json({
      message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.",
    });

    // Check if user exists (and not soft-deleted)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.deletedAt) {
      return successResponse;
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Generate token — hash it before storing for security
    const rawToken = randomUUID();
    const hashedToken = await hash(rawToken, 10);

    // Store hashed token with 1 hour expiry
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Build reset URL with raw token (user clicks this)
    const resetUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // In development: log the reset link
    // In production: send via email service (Resend, SendGrid, etc.)
    if (process.env.NODE_ENV !== "production") {
      console.log("\n========================================");
      console.log("🔑 PASSWORD RESET LINK (DEV ONLY)");
      console.log("========================================");
      console.log(`Email: ${normalizedEmail}`);
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
