import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MaintenanceCatalog from "@/components/services/MaintenanceCatalog";
import { footerSections, navItems } from "@/data/siteData";
import { maintenanceServiceFallback, type MaintenanceServiceItem } from "@/data/maintenanceServices";
import { prisma } from "@/lib/prisma";
import { getMaintenanceGroup, maintenanceGroupFromSpecifications } from "@/data/maintenanceCatalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dịch vụ bảo dưỡng | Electrolux",
  description: "Chọn và mua gói vệ sinh, bảo dưỡng thiết bị Electrolux tại nhà.",
};

async function getMaintenanceServices(): Promise<MaintenanceServiceItem[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        kind: "service",
        isActive: true,
        deletedAt: null,
        category: { slug: "dich-vu-bao-duong" },
      },
      select: {
        name: true,
        slug: true,
        description: true,
        specifications: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        variants: {
          where: { isActive: true },
          orderBy: { sku: "desc" },
          take: 1,
          select: { id: true, sku: true, price: true },
        },
      },
    });

    const items = products.flatMap((product) => {
      const variant = product.variants[0];
      if (!variant) return [];
      const groupKey = maintenanceGroupFromSpecifications(product.specifications) || "garment-care";
      const group = getMaintenanceGroup(groupKey) || getMaintenanceGroup("garment-care")!;
      const specifications = product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)
        ? product.specifications as Record<string, unknown>
        : {};
      return [{
        variantId: variant.id,
        sku: variant.sku,
        name: product.name,
        slug: product.slug,
        price: Number(variant.price),
        imageUrl: product.images[0]?.url || "/dichvubaoduong.jpg",
        group: group.value,
        groupLabel: group.label,
        productType: typeof specifications.productType === "string" ? specifications.productType : "Thiết bị chăm sóc trang phục",
        description: product.description,
      }];
    });

    return items.sort((a, b) => b.sku.localeCompare(a.sku));
  } catch (error) {
    console.error("Failed to load maintenance services", error);
    return maintenanceServiceFallback;
  }
}

export default async function MaintenancePage() {
  const services = await getMaintenanceServices();

  return <>
    <Header navItems={navItems} />
    <main>
      <div className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><Link href="/services">Dịch vụ</Link><span>/</span><strong>Dịch vụ bảo dưỡng</strong></div>
      <section className="hero"><div><p>DỊCH VỤ CHÍNH HÃNG</p><h1>Dịch vụ bảo dưỡng</h1><span>Chọn gói chăm sóc phù hợp và thêm trực tiếp vào giỏ hàng.</span></div></section>
      <MaintenanceCatalog services={services} />
      <section className="note"><div><h2>Lưu ý trước khi mua dịch vụ</h2><p>Giá dịch vụ đã bao gồm công lao động và hóa chất vệ sinh. Phụ kiện thay thế nếu phát sinh sẽ được kiểm tra và báo giá riêng. Sau khi đơn hàng được xác nhận, bộ phận chăm sóc khách hàng sẽ liên hệ để thống nhất thời gian thực hiện.</p><a href="tel:1800588899">Cần tư vấn? Gọi 1800 588 899</a></div></section>
    </main>
    <Footer footerSections={footerSections} />
    <style>{`
      .breadcrumb{max-width:1180px;margin:auto;padding:18px 24px;display:flex;gap:10px;color:#526174;font-size:.9rem}.breadcrumb a{color:#011e41;text-decoration:none}.hero{min-height:315px;background:linear-gradient(100deg,#e7ebef 0%,#f8f8f8 55%,#c9d5df 100%);display:flex;align-items:center;padding:30px}.hero>div{width:min(1180px,100%);margin:auto}.hero>div>*{max-width:520px}.hero p{letter-spacing:2px;color:#36536f;font-weight:700}.hero h1{background:rgba(1,30,65,.94);color:#fff;padding:35px 45px;font-size:clamp(2.1rem,5vw,3.3rem);margin:12px 0}.hero span{display:block;color:#35465a;font-size:1.05rem}.note{padding:55px 24px;background:#eef3f8}.note>div{max-width:850px;margin:auto;text-align:center}.note h2{color:#011e41}.note p{color:#526174;line-height:1.7}.note a{display:inline-block;margin-top:12px;color:#011e41;font-weight:750}@media(max-width:650px){.hero h1{padding:25px}.breadcrumb{overflow:auto;white-space:nowrap}}
    `}</style>
  </>;
}
