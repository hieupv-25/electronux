import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST: Thêm địa chỉ mới
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { recipientName, phone, addressLine, city, isDefault } = body;

    if (!recipientName || !phone || !addressLine || !city) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ các thông tin địa chỉ" },
        { status: 400 }
      );
    }

    // Nếu đặt là mặc định, bỏ mặc định của các địa chỉ cũ
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    // Kiểm tra xem đây có phải là địa chỉ đầu tiên không
    const existingCount = await prisma.address.count({
      where: { userId: session.user.id },
    });

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        isDefault: isDefault || existingCount === 0,
      },
    });

    return NextResponse.json({
      message: "Thêm địa chỉ mới thành công!",
      address: newAddress,
    }, { status: 201 });
  } catch (error) {
    console.error("Address create error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ. Vui lòng thử lại." }, { status: 500 });
  }
}

// DELETE: Xóa địa chỉ
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ error: "Thiếu ID địa chỉ" }, { status: 400 });
    }

    // Đảm bảo địa chỉ thuộc về người dùng hiện tại
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Địa chỉ không tồn tại hoặc không đủ quyền" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ message: "Xóa địa chỉ thành công!" });
  } catch (error) {
    console.error("Address delete error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ." }, { status: 500 });
  }
}
