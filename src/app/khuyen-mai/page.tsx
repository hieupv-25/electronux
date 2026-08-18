import KhuyenMaiClient, { type StorefrontPromotion } from "./KhuyenMaiClient";
import { promotionsData } from "@/data/promotions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function jsonToStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function period(startDate: Date, endDate: Date) {
  return `Thời gian áp dụng: ${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
}

function fallbackPromotions(): StorefrontPromotion[] {
  return promotionsData.map((promo) => ({
    ...promo,
    image: promo.image,
    linkUrl: "/thiet-bi/may-giat",
    discountPercentage: 0,
  }));
}

async function getPromotions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: today },
    },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      discountPercentage: true,
      description: true,
      highlights: true,
      terms: true,
      startDate: true,
      endDate: true,
      bannerImageUrl: true,
      linkUrl: true,
    },
  });

  if (promotions.length === 0) return fallbackPromotions();

  return promotions.map((promo): StorefrontPromotion => ({
    id: promo.id,
    slug: promo.slug,
    title: promo.title,
    period: period(promo.startDate, promo.endDate),
    startDate: promo.startDate.toISOString(),
    endDate: promo.endDate.toISOString(),
    image: promo.bannerImageUrl || "/promotions/banner_clean.png",
    description: promo.description || "Thông tin chi tiết sẽ được cập nhật trong thời gian sớm nhất.",
    highlights: jsonToStringArray(promo.highlights),
    terms: jsonToStringArray(promo.terms),
    linkUrl: promo.linkUrl || "/thiet-bi/may-giat",
    discountPercentage: promo.discountPercentage,
  }));
}

export default async function KhuyenMaiPage() {
  const promotions = await getPromotions();

  return <KhuyenMaiClient promotions={promotions} />;
}
