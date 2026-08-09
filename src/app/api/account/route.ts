import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

// GET: Lấy thông tin user & danh sách địa chỉ
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      addresses: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// PUT: Cập nhật thông tin cá nhân (Tên, Họ, SĐT) hoặc Đổi mật khẩu
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Action: update-profile
    if (action === "update-profile") {
      const { firstName, lastName, phone } = body;

      if (!firstName || !lastName) {
        return NextResponse.json(
          { error: "Họ và Tên không được để trống" },
          { status: 400 }
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });

      return NextResponse.json({
        message: "Cập nhật thông tin thành công!",
        user: updatedUser,
      });
    }

    // 2. Action: change-password
    if (action === "change-password") {
      const { currentPassword, newPassword, confirmPassword } = body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: "Vui lòng nhập đầy đủ thông tin mật khẩu" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Mật khẩu mới phải có ít nhất 8 ký tự" },
          { status: 400 }
        );
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        return NextResponse.json(
          { error: "Mật khẩu mới phải bao gồm chữ hoa, chữ thường và số" },
          { status: 400 }
        );
      }

      if (currentPassword === newPassword) {
        return NextResponse.json(
          { error: "Mật khẩu mới không được trùng với mật khẩu hiện tại" },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "Mật khẩu mới và xác nhận mật khẩu không khớp" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
      }

      const isMatch = await compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại không chính xác" },
          { status: 400 }
        );
      }

      const newPasswordHash = await hash(newPassword, 12);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: newPasswordHash },
      });

      return NextResponse.json({ message: "Đổi mật khẩu thành công!" });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Account API error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ. Vui lòng thử lại sau." }, { status: 500 });
  }
}
