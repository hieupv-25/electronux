import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  cleanText,
  createReferenceCode,
  escapeHtml,
  getClientIp,
  getMailConfig,
  isRateLimited,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  parseDate,
} from "@/lib/support";

export async function POST(req: NextRequest) {
  if (isRateLimited(`warranty-appointment:${getClientIp(req)}`)) {
    return NextResponse.json(
      { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    if (cleanText(body.website, 100)) {
      return NextResponse.json({ success: true, appointmentCode: createReferenceCode("ELX") });
    }

    const data = {
      firstName: cleanText(body.firstName, 80),
      lastName: cleanText(body.lastName, 80),
      phone: cleanText(body.phone, 30),
      email: normalizeEmail(body.email),
      city: cleanText(body.city, 100),
      district: cleanText(body.district, 100),
      ward: cleanText(body.ward, 100),
      address: cleanText(body.address, 250),
      model: cleanText(body.model, 100),
      issue: cleanText(body.issue, 2000),
      preferredDate: parseDate(body.preferredDate),
      preferredTime: cleanText(body.preferredTime, 100),
      privacyConsent: body.privacyConsent === true,
      marketingCall: body.marketingCall === true,
      marketingSms: body.marketingSms === true,
      marketingEmail: body.marketingEmail === true,
    };

    if (
      !data.firstName || !data.lastName || !data.phone || !data.email ||
      !data.city || !data.district || !data.ward || !data.address ||
      !data.model || !data.issue || !data.preferredDate
    ) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ các trường bắt buộc." }, { status: 400 });
    }
    if (!data.privacyConsent) {
      return NextResponse.json({ error: "Bạn cần đồng ý với chính sách quyền riêng tư." }, { status: 400 });
    }
    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: "Địa chỉ email không hợp lệ." }, { status: 400 });
    }
    if (!isValidPhone(data.phone)) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ." }, { status: 400 });
    }
    if (data.preferredDate < new Date(new Date().toISOString().slice(0, 10))) {
      return NextResponse.json({ error: "Ngày hẹn không thể nằm trong quá khứ." }, { status: 400 });
    }

    const session = await auth();
    const appointmentCode = createReferenceCode("ELX-SVC");
    await prisma.warrantyAppointment.create({
      data: {
        requestCode: appointmentCode,
        userId: session?.user?.id || null,
        customerName: `${data.lastName} ${data.firstName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        city: data.city,
        district: data.district,
        ward: data.ward,
        address: data.address,
        model: data.model,
        issue: data.issue,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime || null,
        privacyConsent: data.privacyConsent,
        marketingCall: data.marketingCall,
        marketingSms: data.marketingSms,
        marketingEmail: data.marketingEmail,
      },
    });

    let emailSent = false;
    const mailConfig = getMailConfig();
    if (mailConfig) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: mailConfig.user, pass: mailConfig.pass },
      });
      const fullName = `${data.lastName} ${data.firstName}`;
      const date = data.preferredDate.toLocaleDateString("vi-VN", { timeZone: "UTC" });
      const [customerResult] = await Promise.allSettled([
        transporter.sendMail({
          from: `"Electrolux Việt Nam" <${mailConfig.user}>`,
          to: data.email,
          subject: `[Electrolux] Đã tiếp nhận lịch hẹn ${appointmentCode}`,
          html: `<h2>Đã tiếp nhận yêu cầu đặt lịch</h2><p>Xin chào <strong>${escapeHtml(fullName)}</strong>, mã tiếp nhận của bạn là <strong>${appointmentCode}</strong>.</p><p><strong>Model:</strong> ${escapeHtml(data.model)}</p><p><strong>Thời gian mong muốn:</strong> ${date}${data.preferredTime ? `, ${escapeHtml(data.preferredTime)}` : ""}</p><p>Nhân viên hỗ trợ sẽ liên hệ để xác nhận lịch.</p>`,
        }),
        transporter.sendMail({
          from: `"Electrolux Website" <${mailConfig.user}>`,
          to: mailConfig.notificationEmail,
          subject: `[Lịch hẹn mới] ${appointmentCode} – ${data.model}`,
          html: `<h2>Lịch hẹn bảo hành mới</h2><p><strong>Khách hàng:</strong> ${escapeHtml(fullName)} – ${escapeHtml(data.phone)} – ${escapeHtml(data.email)}</p><p><strong>Địa chỉ:</strong> ${escapeHtml(data.address)}, ${escapeHtml(data.ward)}, ${escapeHtml(data.district)}, ${escapeHtml(data.city)}</p><p><strong>Model:</strong> ${escapeHtml(data.model)}</p><p><strong>Mô tả:</strong> ${escapeHtml(data.issue)}</p>`,
        }),
      ]);
      emailSent = customerResult.status === "fulfilled";
    }

    return NextResponse.json({ success: true, appointmentCode, emailSent }, { status: 201 });
  } catch (error) {
    console.error("POST /api/support/warranty-appointments error:", error);
    return NextResponse.json({ error: "Không thể tiếp nhận lịch hẹn lúc này. Vui lòng thử lại." }, { status: 500 });
  }
}
