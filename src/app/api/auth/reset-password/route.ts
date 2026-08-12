import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token : "";
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!token || !email) {
      return NextResponse.json(
        { message: "Link đặt lại mật khẩu không hợp lệ." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
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

    const resetTokens = await prisma.passwordResetToken.findMany({
      where: { email },
    });

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    let validToken: (typeof resetTokens)[number] | null = null;
    for (const resetToken of resetTokens) {
      const isMatch = await compare(token, resetToken.token);
      if (isMatch) {
        validToken = resetToken;
        break;
      }
    }

    if (!validToken) {
      return NextResponse.json(
        { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    if (new Date() > validToken.expiresAt) {
      await prisma.passwordResetToken.delete({
        where: { id: validToken.id },
      });

      return NextResponse.json(
        { message: "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.deleteMany({
      where: { email },
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
