import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(0|\+84)[0-9\s.-]{8,13}$/;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = cleanText(body.email).toLowerCase();
    const firstName = cleanText(body.firstName);
    const lastName = cleanText(body.lastName);
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const phone = cleanText(body.phone);

    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "Email là bắt buộc.";
    } else if (!emailPattern.test(email)) {
      errors.email = "Email không hợp lệ.";
    }

    if (!firstName) {
      errors.firstName = "Tên là bắt buộc.";
    } else if (firstName.length > 50) {
      errors.firstName = "Tên không được vượt quá 50 ký tự.";
    }

    if (!lastName) {
      errors.lastName = "Họ là bắt buộc.";
    } else if (lastName.length > 50) {
      errors.lastName = "Họ không được vượt quá 50 ký tự.";
    }

    if (!password) {
      errors.password = "Mật khẩu là bắt buộc.";
    } else if (password.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = "Mật khẩu phải có chữ hoa, chữ thường và số.";
    }

    if (!confirmPassword || confirmPassword !== password) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (phone && !phonePattern.test(phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { errors: { email: "Email này đã được đăng ký." } },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        phone: phone || null,
        role: "customer",
        cart: { create: {} },
        wishlist: { create: {} },
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
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { errors: { email: "Email này đã được đăng ký." } },
        { status: 409 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { errors: { _form: "Đã xảy ra lỗi. Vui lòng thử lại." } },
      { status: 500 }
    );
  }
}
