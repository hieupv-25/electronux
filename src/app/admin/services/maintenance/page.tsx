import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminUi";
import MaintenanceServiceForm from "@/components/admin/MaintenanceServiceForm";
import MaintenanceServiceManager, {
  type ManagedMaintenanceService,
} from "@/components/admin/MaintenanceServiceManager";
import { maintenanceGroupFromSpecifications } from "@/data/maintenanceCatalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getMaintenanceServices(): Promise<ManagedMaintenanceService[]> {
  const services = await prisma.product.findMany({
    where: {
      kind: "service",
      deletedAt: null,
      category: { slug: "dich-vu-bao-duong" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      specifications: true,
      images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
      variants: {
        orderBy: { sku: "asc" },
        take: 1,
        select: { id: true, sku: true, price: true },
      },
    },
  });

  return services.flatMap((service) => {
    const variant = service.variants[0];
    if (!variant) return [];

    const specifications =
      service.specifications && typeof service.specifications === "object" && !Array.isArray(service.specifications)
        ? (service.specifications as Record<string, unknown>)
        : {};

    return [
      {
        id: service.id,
        variantId: variant.id,
        name: service.name,
        slug: service.slug,
        description: service.description || "",
        sku: variant.sku,
        price: Number(variant.price),
        group: maintenanceGroupFromSpecifications(specifications) || "garment-care",
        productType: typeof specifications.productType === "string" ? specifications.productType : "Máy giặt",
        imageUrl: service.images[0]?.url || "",
      },
    ];
  });
}

export default async function AdminMaintenanceServicesPage() {
  const services = await getMaintenanceServices();

  return (
    <>
      <AdminPageHeader
        eyebrow="Bảo dưỡng"
        title="Quản lý dịch vụ bảo dưỡng"
        description="Thêm, sửa và xóa các gói bảo dưỡng hiển thị ở trang khách hàng."
        actions={
          <Link className="admin-secondary-button" href="/admin/services">
            Về trang dịch vụ
          </Link>
        }
      />

      <section className="admin-maintenance-layout">
        <MaintenanceServiceForm />
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Danh mục bảo dưỡng</p>
              <h2>{services.length} dịch vụ</h2>
            </div>
          </div>
          <MaintenanceServiceManager services={services} />
        </section>
      </section>
    </>
  );
}
