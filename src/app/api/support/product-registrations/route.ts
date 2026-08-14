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

export async function GET(req: NextRequest) {
  const query = cleanText(req.nextUrl.searchParams.get("model"), 100);
  if (query.length < 2) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { variants: { some: { sku: { contains: query, mode: "insensitive" }, isActive: true } } },
      ],
    },
    select: {
      id: true,
      name: true,
      variants: {
        where: { isActive: true },
        select: { sku: true, variantName: true },
        take: 5,
      },
    },
    take: 10,
  });

  return NextResponse.json({
    products: products.flatMap((product) =>
      product.variants.map((variant) => ({
        productId: product.id,
        productName: product.name,
        model: variant.sku,
        pnc: variant.sku,
        variantName: variant.variantName,
      })),
    ),
  });
}

export async function POST(req: NextRequest) {
  if (isRateLimited(`product-registration:${getClientIp(req)}`)) {
    return NextResponse.json({ error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." }, { status: 429 });
  }

  try {
    const body = await req.json();
    if (cleanText(body.website, 100)) {
      return NextResponse.json({ success: true, registrationCode: createReferenceCode("ELX") });
    }

    const data = {
      productId: cleanText(body.productId, 64),
      productName: cleanText(body.productName, 200),
      model: cleanText(body.model, 100),
      pnc: cleanText(body.pnc, 100),
      customerType: body.customerType === "business" ? "business" : "individual",
      salutation: cleanText(body.salutation, 30),
      firstName: cleanText(body.firstName, 80),
      lastName: cleanText(body.lastName, 80),
      dateOfBirth: body.dateOfBirth ? parseDate(body.dateOfBirth) : null,
      phone: cleanText(body.phone, 30),
      email: normalizeEmail(body.email),
      serialNumber: cleanText(body.serialNumber, 100),
      purchaseDate: parseDate(body.purchaseDate),
      retailer: cleanText(body.retailer, 200),
      invoiceUrl: cleanText(body.invoiceUrl, 1000),
      marketingCall: body.marketingCall === true,
      marketingSms: body.marketingSms === true,
      marketingEmail: body.marketingEmail === true,
      newsletterOptIn: body.newsletterOptIn === true,
      privacyConsent: body.privacyConsent === true,
      warrantyConsent: body.warrantyConsent === true,
    };

    if (!data.productId || !data.model || !data.productName || !data.firstName || !data.lastName || !data.phone || !data.email || !data.purchaseDate) {
      return NextResponse.json({ error: "Vui lòng chọn sản phẩm và điền đầy đủ các trường bắt buộc." }, { status: 400 });
    }
    if (!data.privacyConsent || !data.warrantyConsent) {
      return NextResponse.json({ error: "Bạn cần đồng ý với chính sách quyền riêng tư và điều khoản bảo hành." }, { status: 400 });
    }
    if (!isValidEmail(data.email)) return NextResponse.json({ error: "Địa chỉ email không hợp lệ." }, { status: 400 });
    if (!isValidPhone(data.phone)) return NextResponse.json({ error: "Số điện thoại không hợp lệ." }, { status: 400 });
    if (data.purchaseDate > new Date()) return NextResponse.json({ error: "Ngày mua không thể nằm trong tương lai." }, { status: 400 });

    const product = await prisma.product.findFirst({
      where: { id: data.productId, isActive: true, deletedAt: null, variants: { some: { sku: data.model, isActive: true } } },
      select: { id: true, name: true },
    });
    if (!product) return NextResponse.json({ error: "Sản phẩm đã chọn không còn hợp lệ. Vui lòng tìm và chọn lại model." }, { status: 400 });

    const session = await auth();
    const registrationCode = createReferenceCode("ELX-REG");
    await prisma.productRegistration.create({
      data: {
        registrationCode,
        userId: session?.user?.id || null,
        productId: product.id,
        productName: product.name,
        model: data.model,
        pnc: data.pnc || data.model,
        customerType: data.customerType,
        salutation: data.salutation || null,
        customerName: `${data.lastName} ${data.firstName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        email: data.email,
        serialNumber: data.serialNumber || null,
        purchaseDate: data.purchaseDate,
        retailer: data.retailer || null,
        invoiceUrl: data.invoiceUrl || null,
        marketingCall: data.marketingCall,
        marketingSms: data.marketingSms,
        marketingEmail: data.marketingEmail,
        newsletterOptIn: data.newsletterOptIn,
        privacyConsent: data.privacyConsent,
        warrantyConsent: data.warrantyConsent,
      },
    });

    let emailSent = false;
    const mailConfig = getMailConfig();
    if (mailConfig) {
      const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: mailConfig.user, pass: mailConfig.pass } });
      const fullName = `${data.lastName} ${data.firstName}`;
      const [customerResult] = await Promise.allSettled([
        transporter.sendMail({
          from: `"Electrolux Việt Nam" <${mailConfig.user}>`,
          to: data.email,
          subject: `[Electrolux] Đã tiếp nhận đăng ký ${registrationCode}`,
          html: `<h2>Đã tiếp nhận đăng ký sản phẩm</h2><p>Xin chào <strong>${escapeHtml(fullName)}</strong>, mã tiếp nhận của bạn là <strong>${registrationCode}</strong>.</p><p><strong>Sản phẩm:</strong> ${escapeHtml(product.name)}</p><p><strong>Model:</strong> ${escapeHtml(data.model)}</p>`,
        }),
        transporter.sendMail({
          from: `"Electrolux Website" <${mailConfig.user}>`,
          to: mailConfig.notificationEmail,
          subject: `[Đăng ký sản phẩm] ${registrationCode} – ${data.model}`,
          html: `<h2>Đăng ký sản phẩm mới</h2><p><strong>Khách hàng:</strong> ${escapeHtml(fullName)} – ${escapeHtml(data.phone)} – ${escapeHtml(data.email)}</p><p><strong>Sản phẩm:</strong> ${escapeHtml(product.name)} / ${escapeHtml(data.model)}</p>`,
        }),
      ]);
      emailSent = customerResult.status === "fulfilled";
    }

    return NextResponse.json({ success: true, registrationCode, emailSent }, { status: 201 });
  } catch (error) {
    console.error("POST /api/support/product-registrations error:", error);
    return NextResponse.json({ error: "Không thể tiếp nhận đăng ký lúc này. Vui lòng thử lại." }, { status: 500 });
  }
}
