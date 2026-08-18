import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const { paymentUrl } = await req.json();

    if (!paymentUrl || typeof paymentUrl !== "string") {
      return NextResponse.json(
        { success: false, message: "paymentUrl is required" },
        { status: 400 }
      );
    }

    const qrDataUrl = await QRCode.toDataURL(paymentUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: "#001e38",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });

    return NextResponse.json({ success: true, qrDataUrl });
  } catch (error) {
    console.error("VNPay QR generation error:", error);
    return NextResponse.json(
      { success: false, message: "Khong the tao ma QR" },
      { status: 500 }
    );
  }
}
