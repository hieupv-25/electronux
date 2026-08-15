import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hash } from "bcryptjs";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { escapeHtml, getMailConfig } from "@/lib/support";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resetTokenMaxAgeMs = 60 * 60 * 1000;

async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const mailConfig = getMailConfig();

  if (!mailConfig) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass,
    },
  });

  const safeResetUrl = escapeHtml(resetUrl);

  await transporter.sendMail({
    from: `"Electrolux Việt Nam" <${mailConfig.user}>`,
    to: email,
    subject: "[Electrolux] Đặt lại mật khẩu tài khoản",
    text: [
      "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Electrolux Việt Nam.",
      "",
      `Mở liên kết sau để đặt lại mật khẩu trong vòng 60 phút: ${resetUrl}`,
      "",
      "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="color:#041e42">Đặt lại mật khẩu</h2>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Electrolux Việt Nam.</p>
        <p>
          <a href="${safeResetUrl}" style="display:inline-block;background:#041e42;color:#fff;padding:12px 18px;text-decoration:none;border-radius:4px">
            Đặt lại mật khẩu
          </a>
        </p>
        <p>Liên kết này có hiệu lực trong 60 phút.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
      </div>
    `,
  });

  return true;
}

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
        expiresAt: new Date(Date.now() + resetTokenMaxAgeMs),
      },
    });

    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin;
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
    const emailSent = await sendPasswordResetEmail(email, resetUrl);

    if (!emailSent && process.env.NODE_ENV !== "production") {
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
