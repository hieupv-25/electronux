import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MaintenanceServiceActions from "@/components/services/MaintenanceServiceActions";
import { getMaintenanceGroup, maintenanceGroupFromSpecifications } from "@/data/maintenanceCatalog";
import { maintenanceServiceFallback, type MaintenanceServiceItem } from "@/data/maintenanceServices";
import { footerSections, navItems } from "@/data/siteData";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
}

async function getMaintenanceService(slug: string): Promise<MaintenanceServiceItem | null> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug,
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

    const variant = product?.variants[0];
    if (!product || !variant) return maintenanceServiceFallback.find((item) => item.slug === slug) || null;

    const groupKey = maintenanceGroupFromSpecifications(product.specifications) || "garment-care";
    const group = getMaintenanceGroup(groupKey) || getMaintenanceGroup("garment-care")!;
    const specifications =
      product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)
        ? (product.specifications as Record<string, unknown>)
        : {};

    return {
      variantId: variant.id,
      sku: variant.sku,
      name: product.name,
      slug: product.slug,
      price: Number(variant.price),
      imageUrl: product.images[0]?.url || "/dichvubaoduong.jpg",
      group: group.value,
      groupLabel: group.label,
      productType: typeof specifications.productType === "string" ? specifications.productType : "Thiết bị bảo dưỡng",
      description: product.description,
    };
  } catch (error) {
    console.error("Failed to load maintenance service detail", error);
    return maintenanceServiceFallback.find((item) => item.slug === slug) || null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getMaintenanceService(slug);
  if (!service) return { title: "Dịch vụ không tồn tại | Electrolux" };

  return {
    title: `${service.name} | Electrolux`,
    description: service.description || `Dịch vụ bảo dưỡng ${service.productType} tại nhà.`,
  };
}

export default async function MaintenanceServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getMaintenanceService(slug);

  if (!service) notFound();

  return (
    <>
      <Header navItems={navItems} />
      <main className="maintenance-detail">
        <nav className="maintenance-detail__breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/services/maintenance">Dịch vụ bảo dưỡng</Link>
          <span>/</span>
          <strong>{service.name}</strong>
        </nav>

        <section className="maintenance-detail__hero">
          <div className="maintenance-detail__gallery">
            <button className="maintenance-detail__arrow" aria-label="Ảnh trước">
              ‹
            </button>
            <div className="maintenance-detail__image">
              <Image src={service.imageUrl} alt={service.name} width={620} height={410} priority />
            </div>
            <button className="maintenance-detail__arrow" aria-label="Ảnh tiếp theo">
              ›
            </button>
          </div>

          <article className="maintenance-detail__info">
            <div className="maintenance-detail__title-row">
              <h1>{service.name}</h1>
              <button className="maintenance-detail__heart" aria-label="Lưu dịch vụ yêu thích">
                ♡
              </button>
            </div>
            <p className="maintenance-detail__sku">{service.sku}</p>
            <p className="maintenance-detail__meta">
              {service.groupLabel} · {service.productType}
            </p>
            {service.description && <p className="maintenance-detail__description">{service.description}</p>}

            <ul className="maintenance-detail__bullets">
              <li>Kỹ thuật viên của chúng tôi đến tận nơi để chăm sóc thiết bị của bạn.</li>
              <li>Chăm sóc thiết bị theo đúng quy chuẩn cần thiết, và tư vấn các phương pháp để bạn có thể tự chăm sóc sản phẩm tại nhà.</li>
              <li>Làm sạch và bảo dưỡng thiết bị cho hiệu suất vận hành bền lâu.</li>
            </ul>

            <h2>Không bao gồm:</h2>
            <ul className="maintenance-detail__bullets">
              <li>Giá dịch vụ không bao gồm chi phí hoặc công thay thế linh-phụ kiện.</li>
            </ul>

            <h2>Điều kiện áp dụng:</h2>
            <ul className="maintenance-detail__bullets">
              <li>Dịch vụ áp dụng cho dòng {service.productType}.</li>
              <li>
                Dịch vụ được hỗ trợ tại các khu vực:
                <ul className="maintenance-detail__sub-bullets">
                  <li><strong>Hà Nội</strong> (Q. Hoàng Mai, H. Thanh Trì, Q. Thanh Xuân, Q. Đống Đa, Q. Cầu Giấy, H. Chương Mỹ, H. Quốc Oai, H. Thanh Oai, H. Ứng Hòa, Q. Hà Đông, Q. Nam Từ Liêm)</li>
                  <li><strong>Hồ Chí Minh</strong> (Tất cả; trừ H. Củ Chi và H. Cần Giờ)</li>
                </ul>
              </li>
              <li>Các khu vực khác vui lòng liên hệ Tổng đài CSKH để được hỗ trợ.</li>
            </ul>

            <strong className="maintenance-detail__price">{formatPrice(service.price)}</strong>
            <MaintenanceServiceActions variantId={service.variantId} serviceName={service.name} />
          </article>
        </section>
      </main>
      <Footer footerSections={footerSections} />

      <style>{`
        .maintenance-detail {
          background: #fff;
          color: #011e41;
        }
        .maintenance-detail__breadcrumb {
          max-width: 1180px;
          margin: auto;
          padding: 18px 24px;
          display: flex;
          gap: 10px;
          align-items: center;
          color: #526174;
          font-size: .9rem;
        }
        .maintenance-detail__breadcrumb a {
          color: #011e41;
          font-weight: 700;
        }
        .maintenance-detail__breadcrumb strong {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .maintenance-detail__hero {
          max-width: 1180px;
          margin: auto;
          padding: 42px 24px 78px;
          display: grid;
          grid-template-columns: minmax(0, .9fr) minmax(390px, 1fr);
          gap: 58px;
          align-items: start;
        }
        .maintenance-detail__gallery {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr) 44px;
          gap: 18px;
          align-items: center;
          padding-top: 54px;
        }
        .maintenance-detail__image {
          border: 1px solid #dce2e8;
          border-radius: 8px;
          background: #f4f6f8;
          overflow: hidden;
          box-shadow: 0 14px 34px rgba(1, 30, 65, .08);
        }
        .maintenance-detail__image img {
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }
        .maintenance-detail__arrow {
          width: 44px;
          height: 44px;
          border: 0;
          background: transparent;
          color: #011e41;
          font-size: 2.35rem;
          line-height: 1;
          cursor: pointer;
        }
        .maintenance-detail__info {
          min-width: 0;
        }
        .maintenance-detail__title-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
        }
        .maintenance-detail__title-row h1 {
          font-size: clamp(2rem, 3.4vw, 3rem);
          line-height: 1.15;
          margin: 0;
          color: #011e41;
        }
        .maintenance-detail__heart {
          border: 0;
          background: transparent;
          color: #7a8a9c;
          font-size: 2rem;
          cursor: pointer;
        }
        .maintenance-detail__sku {
          margin: 12px 0 18px;
          color: #011e41;
          font-weight: 700;
        }
        .maintenance-detail__meta,
        .maintenance-detail__description,
        .maintenance-detail__bullets {
          color: #334b64;
        }
        .maintenance-detail__description {
          line-height: 1.7;
          white-space: pre-line;
          margin: 0 0 18px;
        }
        .maintenance-detail__bullets {
          padding-left: 18px;
          list-style: disc outside;
          line-height: 1.65;
          margin: 10px 0;
        }
        .maintenance-detail__bullets li {
          display: list-item;
          margin-bottom: 6px;
        }
        .maintenance-detail__sub-bullets {
          padding-left: 20px;
          list-style: circle outside;
          margin: 3px 0 0;
        }
        .maintenance-detail__sub-bullets li {
          margin-bottom: 2px;
        }
        .maintenance-detail__sub-bullets strong {
          color: #011e41;
        }
        .maintenance-detail__info h2 {
          font-size: .95rem;
          margin: 14px 0 6px;
          color: #011e41;
        }
        .maintenance-detail__price {
          display: block;
          margin: 26px 0 16px;
          color: #011e41;
          font-size: clamp(2rem, 3vw, 2.6rem);
          line-height: 1;
        }
        .maintenance-detail__add {
          min-width: 260px;
          border: 0;
          border-radius: 4px;
          background: #011e41;
          color: white;
          padding: 15px 24px;
          font: inherit;
          font-weight: 800;
          text-transform: uppercase;
          cursor: pointer;
        }
        .maintenance-detail__add:hover {
          background: #0a3567;
        }
        .maintenance-detail__add:disabled {
          opacity: .65;
          cursor: wait;
        }
        @media (max-width: 900px) {
          .maintenance-detail__hero {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .maintenance-detail__gallery {
            padding-top: 0;
          }
        }
        @media (max-width: 620px) {
          .maintenance-detail__breadcrumb {
            overflow: auto;
            white-space: nowrap;
          }
          .maintenance-detail__hero {
            padding: 26px 16px 54px;
          }
          .maintenance-detail__gallery {
            grid-template-columns: 1fr;
          }
          .maintenance-detail__arrow {
            display: none;
          }
          .maintenance-detail__add {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
