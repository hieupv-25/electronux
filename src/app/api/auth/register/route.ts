import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, password, confirmPassword, phone } = body;

    // ── Validation ──
    const errors: Record<string, string> = {};

    if (!email || typeof email !== "string") {
      errors.email = "Email là bắt buộc.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email không hợp lệ.";
    }

    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 1) {
      errors.firstName = "Tên là bắt buộc.";
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim().length < 1) {
      errors.lastName = "Họ là bắt buộc.";
    }

    if (!password || typeof password !== "string") {
      errors.password = "Mật khẩu là bắt buộc.";
    } else if (password.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = "Mật khẩu phải có chữ hoa, chữ thường và số.";
    }

    if (!confirmPassword || confirmPassword !== password) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (phone && typeof phone === "string" && phone.trim().length > 0) {
      if (!/^[0-9+\-\s()]{8,15}$/.test(phone.trim())) {
        errors.phone = "Số điện thoại không hợp lệ.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // ── Check duplicate email ──
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { errors: { email: "Email này đã được đăng ký." } },
        { status: 409 }
      );
    }

    // ── Hash password & create user ──
    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        passwordHash,
        phone: phone?.trim() || null,
        role: "customer",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Đăng ký thành công!", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { errors: { _form: "Đã xảy ra lỗi. Vui lòng thử lại." } },
      { status: 500 }
    );
  }
}
