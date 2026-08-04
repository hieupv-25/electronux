import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email, password, confirmPassword } = body;

    // ── Validation ──
    if (!token || !email) {
      return NextResponse.json(
        { message: "Link đặt lại mật khẩu không hợp lệ." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "Mật khẩu phải có ít nhất 8 ký tự." },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { message: "Mật khẩu phải có chữ hoa, chữ thường và số." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Mật khẩu xác nhận không khớp." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find all tokens for this email (there should be at most 1)
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: { email: normalizedEmail },
    });

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    // Find the matching token by comparing the raw token against stored hashes
    let validToken = null;
    for (const rt of resetTokens) {
      const isMatch = await compare(token, rt.token);
      if (isMatch) {
        validToken = rt;
        break;
      }
    }

    if (!validToken) {
      return NextResponse.json(
        { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > validToken.expiresAt) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: validToken.id },
      });
      return NextResponse.json(
        { message: "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại." },
        { status: 400 }
      );
    }

    // Hash new password and update user
    const passwordHash = await hash(password, 12);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });

    // Delete all reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    return NextResponse.json({
      message: "Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
