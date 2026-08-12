import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { model, serial, purchaseDate, retailer, name, phone, email, city } = body;

        if (!email || !name || !model || !serial) {
            return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
        }

        const formattedDate = purchaseDate
            ? new Date(purchaseDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
            : "—";

        const registrationId = `ELX-${Date.now().toString(36).toUpperCase()}`;
        const escapedName = escapeHtml(name);
        const escapedModel = escapeHtml(model);
        const escapedSerial = escapeHtml(serial);
        const escapedRetailer = escapeHtml(retailer || "—");
        const escapedPhone = escapeHtml(phone || "—");
        const escapedEmail = escapeHtml(email);
        const escapedCity = escapeHtml(city || "—");
        const escapedRegistrationId = escapeHtml(registrationId);
        const escapedFormattedDate = escapeHtml(formattedDate);

        const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Xác nhận đăng ký bảo hành</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#1a3a5c;padding:32px 40px;text-align:center;">
              <p style="color:#a0c4e0;font-size:12px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;">Electrolux Việt Nam</p>
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">Đăng ký bảo hành thành công</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="color:#1a3a5c;font-size:16px;font-weight:600;margin:0 0 8px;">Xin chào, ${escapedName}!</p>
              <p style="color:#4a5a72;font-size:14px;line-height:1.7;margin:0;">
                Cảm ơn bạn đã đăng ký bảo hành sản phẩm Electrolux. Thông tin đăng ký của bạn đã được ghi nhận thành công.
              </p>
            </td>
          </tr>

          <!-- Registration ID Banner -->
          <tr>
            <td style="padding:24px 40px;">
              <div style="background:#eef4fb;border-left:4px solid #1a3a5c;border-radius:6px;padding:16px 20px;">
                <p style="margin:0 0 4px;font-size:11px;color:#7a8a9c;text-transform:uppercase;letter-spacing:1px;">Mã đăng ký bảo hành</p>
                <p style="margin:0;font-size:20px;font-weight:700;color:#1a3a5c;letter-spacing:2px;">${escapedRegistrationId}</p>
              </div>
            </td>
          </tr>

          <!-- Product Info -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f0f5fa;">
                  <td colspan="2" style="padding:14px 20px;font-size:13px;font-weight:700;color:#1a3a5c;text-transform:uppercase;letter-spacing:0.5px;">
                    📦 Thông tin sản phẩm
                  </td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;width:140px;">Số Model</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${escapedModel}</td>
                </tr>
                <tr style="background:#fafbfc;border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Serial Number</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${escapedSerial}</td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Ngày mua</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${escapedFormattedDate}</td>
                </tr>
                <tr style="background:#fafbfc;border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Nơi mua</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${escapedRetailer}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Personal Info -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f0f5fa;">
                  <td colspan="2" style="padding:14px 20px;font-size:13px;font-weight:700;color:#1a3a5c;text-transform:uppercase;letter-spacing:0.5px;">
                    👤 Thông tin khách hàng
                  </td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;width:140px;">Họ và tên</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${escapedName}</td>
                </tr>
                <tr style="background:#fafbfc;border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Điện thoại</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${escapedPhone}</td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Email</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${escapedEmail}</td>
                </tr>
                <tr style="background:#fafbfc;border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Tỉnh/Thành phố</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${escapedCity}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e;">📌 Lưu ý</p>
                <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;">
                  Vui lòng lưu giữ email này và mã đăng ký <strong>${escapedRegistrationId}</strong> để sử dụng khi cần liên hệ bảo hành.
                  Thời gian bảo hành tính từ ngày mua hàng ghi trên hoá đơn.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0f5fa;padding:24px 40px;text-align:center;border-top:1px solid #e0e8f0;">
              <p style="margin:0 0 8px;font-size:13px;color:#7a8a9c;">Cần hỗ trợ? Liên hệ:</p>
              <p style="margin:0;font-size:13px;color:#1a3a5c;font-weight:600;">📧 support@electrolux.vn &nbsp;|&nbsp; 📞 1800 1166 (miễn phí)</p>
              <p style="margin:16px 0 0;font-size:11px;color:#aab4c0;">© 2026 Electrolux Việt Nam. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        await transporter.sendMail({
            from: `"Electrolux Việt Nam" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `[Electrolux] Xác nhận đăng ký bảo hành – ${registrationId}`,
            html,
        });

        return NextResponse.json({ success: true, registrationId });
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        return NextResponse.json({ error: "Không thể gửi email. Vui lòng thử lại." }, { status: 500 });
    }
}
