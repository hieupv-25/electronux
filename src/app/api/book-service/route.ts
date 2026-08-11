import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
        const { name, phone, email, address, city, model, serial, issue, preferDate, preferTime } = body;

        if (!email || !name || !phone) {
            return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
        }

        const bookingId = `SVC-${Date.now().toString(36).toUpperCase()}`;

        const formattedDate = preferDate
            ? new Date(preferDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
            : "—";

        const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Xác nhận đặt lịch bảo hành</title>
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
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">Đặt lịch bảo hành thành công</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="color:#1a3a5c;font-size:16px;font-weight:600;margin:0 0 8px;">Xin chào, ${name}!</p>
              <p style="color:#4a5a72;font-size:14px;line-height:1.7;margin:0;">
                Chúng tôi đã nhận được yêu cầu đặt lịch hẹn của bạn. Tổng đài viên sẽ liên hệ để xác nhận thời gian phù hợp trong vòng <strong>24 giờ làm việc</strong>.
              </p>
            </td>
          </tr>

          <!-- Booking ID Banner -->
          <tr>
            <td style="padding:24px 40px;">
              <div style="background:#eef4fb;border-left:4px solid #1a3a5c;border-radius:6px;padding:16px 20px;">
                <p style="margin:0 0 4px;font-size:11px;color:#7a8a9c;text-transform:uppercase;letter-spacing:1px;">Mã đặt lịch</p>
                <p style="margin:0;font-size:20px;font-weight:700;color:#1a3a5c;letter-spacing:2px;">${bookingId}</p>
              </div>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f0f5fa;">
                  <td colspan="2" style="padding:14px 20px;font-size:13px;font-weight:700;color:#1a3a5c;text-transform:uppercase;letter-spacing:0.5px;">
                    👤 Thông tin liên hệ
                  </td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;width:140px;">Họ và tên</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${name}</td>
                </tr>
                <tr style="background:#fafbfc;border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Điện thoại</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${phone}</td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Địa chỉ</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${address || "—"}${city ? ", " + city : ""}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Product Info -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f0f5fa;">
                  <td colspan="2" style="padding:14px 20px;font-size:13px;font-weight:700;color:#1a3a5c;text-transform:uppercase;letter-spacing:0.5px;">
                    🔧 Thông tin sản phẩm & sự cố
                  </td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;width:140px;">Số Model</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${model || "—"}</td>
                </tr>
                <tr style="background:#fafbfc;border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Số Serial</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${serial || "—"}</td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Mô tả sự cố</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${issue || "—"}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Preferred Time -->
          ${preferDate || preferTime ? `
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background:#f0f5fa;">
                  <td colspan="2" style="padding:14px 20px;font-size:13px;font-weight:700;color:#1a3a5c;text-transform:uppercase;letter-spacing:0.5px;">
                    📅 Thời gian mong muốn
                  </td>
                </tr>
                <tr style="border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;width:140px;">Ngày</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${formattedDate}</td>
                </tr>
                <tr style="background:#fafbfc;border-top:1px solid #e0e8f0;">
                  <td style="padding:12px 20px;font-size:13px;color:#7a8a9c;">Khung giờ</td>
                  <td style="padding:12px 20px;font-size:13px;color:#1a3a5c;font-weight:600;">${preferTime || "—"}</td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e;">📌 Lưu ý</p>
                <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;">
                  Tổng đài viên sẽ liên hệ qua số <strong>${phone}</strong> để xác nhận lịch hẹn. 
                  Lưu mã đặt lịch <strong>${bookingId}</strong> để tra cứu khi cần thiết.
                  Nếu cần thay đổi, vui lòng gọi <strong>1800 588 899</strong> (miễn phí).
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0f5fa;padding:24px 40px;text-align:center;border-top:1px solid #e0e8f0;">
              <p style="margin:0 0 8px;font-size:13px;color:#7a8a9c;">Cần hỗ trợ? Liên hệ:</p>
              <p style="margin:0;font-size:13px;color:#1a3a5c;font-weight:600;">📧 support@electrolux.vn &nbsp;|&nbsp; 📞 1800 588 899 (miễn phí)</p>
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
            subject: `[Electrolux] Xác nhận đặt lịch bảo hành – ${bookingId}`,
            html,
        });

        return NextResponse.json({ success: true, bookingId });
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        return NextResponse.json({ error: "Không thể gửi email. Vui lòng thử lại." }, { status: 500 });
    }
}
