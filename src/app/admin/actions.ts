"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import {
  getFormBoolean,
  getFormDate,
  getFormDecimal,
  getFormNumber,
  getFormOptionalString,
  getFormString,
  slugify,
} from "@/lib/admin-format";
import type {
  OrderStatus,
  PaymentStatus,
  RequestStatus,
  Role,
  ServiceType,
} from "@/generated/prisma/enums";
import { getMaintenanceGroup } from "@/data/maintenanceCatalog";

const orderStatuses = [
  "pending",
  "processing",
  "shipping",
  "completed",
  "cancelled",
] as const satisfies readonly OrderStatus[];

const paymentStatuses = [
  "unpaid",
  "paid",
  "refunded",
] as const satisfies readonly PaymentStatus[];

const requestStatuses = [
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const satisfies readonly RequestStatus[];

const roles = ["customer", "admin"] as const satisfies readonly Role[];
const serviceTypes = [
  "paid",
  "warranty_extension",
  "support",
] as const satisfies readonly ServiceType[];

function getEnumValue<T extends readonly string[]>(
  values: T,
  value: string,
  fallback: T[number]
) {
  return values.includes(value) ? value : fallback;
}

function parseSpecifications(value: string) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function uniqueCategorySlug(
  name: string,
  requestedSlug: string,
  excludeId?: string
) {
  const baseSlug = slugify(requestedSlug || name) || `danh-muc-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingCategory || existingCategory.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function uniqueProductSlug(name: string, requestedSlug: string, excludeId?: string) {
  const baseSlug = slugify(requestedSlug || name) || `san-pham-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function uniquePromotionSlug(title: string, requestedSlug: string, excludeId?: string) {
  const baseSlug = slugify(requestedSlug || title) || `chien-dich-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.promotion.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function revalidateStorefrontCatalog(
  categorySlug?: string | null,
  productSlug?: string | null
) {
  revalidatePath("/");
  revalidatePath("/search");

  if (categorySlug) {
    revalidatePath(`/thiet-bi/${categorySlug}`);
  }

  if (categorySlug && productSlug) {
    revalidatePath(`/thiet-bi/${categorySlug}/${productSlug}`);
  }
}

export async function createCategory(formData: FormData) {
  await requireAdminSession();

  const name = getFormString(formData, "name");
  if (!name) return;
  const parentId = getFormString(formData, "parentId");

  const category = await prisma.category.create({
    data: {
      name,
      slug: await uniqueCategorySlug(name, getFormString(formData, "slug")),
      iconUrl: getFormOptionalString(formData, "iconUrl"),
      order: getFormNumber(formData, "order"),
      parentId: parentId || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(category.slug);
}

export async function updateCategory(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  const name = getFormString(formData, "name");
  if (!id || !name) return;

  const currentCategory = await prisma.category.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!currentCategory) return;

  const requestedSlug = getFormString(formData, "slug");
  const nextSlug = slugify(requestedSlug || name);
  const parentId = getFormString(formData, "parentId");

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug:
        nextSlug && nextSlug !== currentCategory.slug
          ? await uniqueCategorySlug(name, nextSlug, id)
          : currentCategory.slug,
      iconUrl: getFormOptionalString(formData, "iconUrl"),
      order: getFormNumber(formData, "order"),
      parentId: parentId && parentId !== id ? parentId : null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(currentCategory.slug);
  revalidateStorefrontCatalog(updatedCategory.slug);
}

export async function toggleCategoryDeleted(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;

  const restore = getFormString(formData, "mode") === "restore";
  const category = await prisma.category.findUnique({
    where: { id },
    select: { slug: true },
  });

  await prisma.category.update({
    where: { id },
    data: {
      deletedAt: restore ? null : new Date(),
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(category?.slug);
}

export async function createBrand(formData: FormData) {
  await requireAdminSession();

  const name = getFormString(formData, "name");
  if (!name) return;

  await prisma.brand.upsert({
    where: { name },
    update: {
      logoUrl: getFormOptionalString(formData, "logoUrl"),
    },
    create: {
      name,
      logoUrl: getFormOptionalString(formData, "logoUrl"),
    },
  });

  revalidatePath("/admin/products");
}

export async function createProduct(formData: FormData) {
  await requireAdminSession();

  const name = getFormString(formData, "name");
  const categoryId = getFormString(formData, "categoryId");
  if (!name || !categoryId) return;

  const brandId = getFormString(formData, "brandId");
  const sku = getFormString(formData, "sku");
  const imageUrl = getFormOptionalString(formData, "imageUrl");
  const specifications = parseSpecifications(
    getFormString(formData, "specifications")
  );

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slug: true },
  });

  const product = await prisma.product.create({
    data: {
      categoryId,
      brandId: brandId || null,
      name,
      slug: await uniqueProductSlug(name, getFormString(formData, "slug")),
      description: getFormOptionalString(formData, "description"),
      specifications,
      isFeatured: getFormBoolean(formData, "isFeatured"),
      isActive: getFormBoolean(formData, "isActive"),
      freeShipping: getFormBoolean(formData, "freeShipping"),
      freeInstallation: getFormBoolean(formData, "freeInstallation"),
      installment0Percent: getFormBoolean(formData, "installment0Percent"),
      variants: sku
        ? {
            create: {
              sku,
              variantName: getFormString(formData, "variantName") || "Tiêu chuẩn",
              price: getFormDecimal(formData, "price"),
              discountPercentage: getFormNumber(formData, "discountPercentage"),
              stockQuantity: getFormNumber(formData, "stockQuantity"),
              isActive: true,
            },
          }
        : undefined,
      images: imageUrl
        ? {
            create: {
              url: imageUrl,
              order: 0,
            },
          }
        : undefined,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(category?.slug, product.slug);
}

export async function updateProduct(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  const name = getFormString(formData, "name");
  if (!id || !name) return;

  const currentProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      slug: true,
      categoryId: true,
      category: { select: { slug: true } },
    },
  });
  if (!currentProduct) return;

  const categoryId = getFormString(formData, "categoryId") || currentProduct.categoryId;
  const brandId = getFormString(formData, "brandId");
  const requestedSlug = getFormString(formData, "slug");
  const nextSlug = slugify(requestedSlug || name);
  const rawSpecifications = getFormString(formData, "specifications");
  const parsedSpecifications = rawSpecifications
    ? parseSpecifications(rawSpecifications)
    : null;
  const imageUrl = getFormOptionalString(formData, "imageUrl");

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      categoryId,
      brandId: brandId || null,
      name,
      slug:
        nextSlug && nextSlug !== currentProduct.slug
          ? await uniqueProductSlug(name, nextSlug, id)
          : currentProduct.slug,
      description: getFormOptionalString(formData, "description"),
      ...(rawSpecifications && parsedSpecifications === undefined
        ? {}
        : { specifications: parsedSpecifications }),
      isFeatured: getFormBoolean(formData, "isFeatured"),
      isActive: getFormBoolean(formData, "isActive"),
      freeShipping: getFormBoolean(formData, "freeShipping"),
      freeInstallation: getFormBoolean(formData, "freeInstallation"),
      installment0Percent: getFormBoolean(formData, "installment0Percent"),
      images: imageUrl
        ? {
            deleteMany: {},
            create: {
              url: imageUrl,
              order: 0,
            },
          }
        : undefined,
    },
    include: {
      category: {
        select: { slug: true },
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(currentProduct.category.slug, currentProduct.slug);
  revalidateStorefrontCatalog(updatedProduct.category.slug, updatedProduct.slug);
}

export async function toggleProductActive(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;

  const currentValue = getFormString(formData, "currentValue") === "true";
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      slug: true,
      category: { select: { slug: true } },
    },
  });

  await prisma.product.update({
    where: { id },
    data: { isActive: !currentValue },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(product?.category.slug, product?.slug);
}

export async function softDeleteProduct(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      slug: true,
      category: { select: { slug: true } },
    },
  });

  await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(product?.category.slug, product?.slug);
}

export async function createVariant(formData: FormData) {
  await requireAdminSession();

  const productId = getFormString(formData, "productId");
  const sku = getFormString(formData, "sku");
  if (!productId || !sku) return;

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku,
      variantName: getFormString(formData, "variantName") || "Tiêu chuẩn",
      price: getFormDecimal(formData, "price"),
      discountPercentage: getFormNumber(formData, "discountPercentage"),
      stockQuantity: getFormNumber(formData, "stockQuantity"),
      isActive: true,
    },
    include: {
      product: {
        select: {
          slug: true,
          category: { select: { slug: true } },
        },
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(variant.product.category.slug, variant.product.slug);
}

export async function updateVariant(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;

  const variant = await prisma.productVariant.update({
    where: { id },
    data: {
      price: getFormDecimal(formData, "price"),
      discountPercentage: getFormNumber(formData, "discountPercentage"),
      stockQuantity: getFormNumber(formData, "stockQuantity"),
      isActive: getFormBoolean(formData, "isActive"),
    },
    include: {
      product: {
        select: {
          slug: true,
          category: { select: { slug: true } },
        },
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateStorefrontCatalog(variant.product.category.slug, variant.product.slug);
}

export async function updateOrderStatus(formData: FormData) {
  const session = await requireAdminSession();
  const id = getFormString(formData, "id");
  if (!id) return;

  const status = getEnumValue(
    orderStatuses,
    getFormString(formData, "status"),
    "pending"
  ) as OrderStatus;
  const paymentStatus = getEnumValue(
    paymentStatuses,
    getFormString(formData, "paymentStatus"),
    "unpaid"
  ) as PaymentStatus;
  const note = getFormOptionalString(formData, "note");
  const trackingNumber = getFormOptionalString(formData, "trackingNumber");

  await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existingOrder) return;

    await tx.order.update({
      where: { id },
      data: {
        status,
        paymentStatus,
        trackingNumber,
      },
    });

    if (existingOrder.status !== status || note) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note,
          changedBy: session.user.id,
        },
      });
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateCustomerRole(formData: FormData) {
  const session = await requireAdminSession();
  const id = getFormString(formData, "id");
  if (!id || id === session.user.id) return;

  const role = getEnumValue(roles, getFormString(formData, "role"), "customer") as Role;

  await prisma.user.update({
    where: { id },
    data: { role },
  });

  revalidatePath("/admin/customers");
  revalidatePath("/admin");
}

export async function toggleCustomerDeleted(formData: FormData) {
  const session = await requireAdminSession();
  const id = getFormString(formData, "id");
  if (!id || id === session.user.id) return;

  const restore = getFormString(formData, "mode") === "restore";

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: restore ? null : new Date(),
    },
  });

  revalidatePath("/admin/customers");
  revalidatePath("/admin");
}

export async function createService(formData: FormData) {
  await requireAdminSession();

  const name = getFormString(formData, "name");
  if (!name) return;

  const type = getEnumValue(
    serviceTypes,
    getFormString(formData, "type"),
    "support"
  ) as ServiceType;

  await prisma.service.create({
    data: { name, type },
  });

  revalidatePath("/admin/services");
}

export async function createMaintenanceService(formData: FormData) {
  await requireAdminSession();

  const name = getFormString(formData, "name");
  const sku = getFormString(formData, "sku");
  const groupKey = getFormString(formData, "group");
  const productType = getFormString(formData, "productType");
  const imageUrl = getFormString(formData, "imageUrl");
  const group = getMaintenanceGroup(groupKey);
  if (!name || !sku || !group || !productType || !imageUrl) {
    throw new Error("Thiếu thông tin bắt buộc của dịch vụ bảo dưỡng.");
  }
  if (!group.productTypes.some((type) => type === productType)) {
    throw new Error("Loại sản phẩm không thuộc nhóm bảo dưỡng đã chọn.");
  }

  const category = await prisma.category.findUnique({
    where: { slug: "dich-vu-bao-duong" },
    select: { id: true },
  });
  if (!category) throw new Error("Không tìm thấy danh mục dịch vụ bảo dưỡng.");

  await prisma.product.create({
    data: {
      categoryId: category.id,
      name,
      slug: await uniqueProductSlug(name, getFormString(formData, "slug")),
      kind: "service",
      description: getFormOptionalString(formData, "description"),
      specifications: {
        serviceType: "maintenance",
        serviceGroupKey: group.value,
        serviceGroup: group.label,
        productType,
      },
      isActive: true,
      freeShipping: false,
      variants: {
        create: {
          sku,
          variantName: "Gói tiêu chuẩn",
          price: getFormDecimal(formData, "price"),
          stockQuantity: 99999,
          isActive: true,
          attributes: { serviceType: "maintenance" },
        },
      },
      images: { create: { url: imageUrl, order: 0 } },
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/admin/services/maintenance");
  revalidatePath("/services/maintenance");
  revalidatePath("/admin");
}

export async function updateMaintenanceService(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  const variantId = getFormString(formData, "variantId");
  const name = getFormString(formData, "name");
  const sku = getFormString(formData, "sku");
  const group = getMaintenanceGroup(getFormString(formData, "group"));
  const productType = getFormString(formData, "productType");
  if (!id || !variantId || !name || !sku || !group || !productType) {
    throw new Error("Thiếu thông tin bắt buộc của dịch vụ bảo dưỡng.");
  }
  if (!group.productTypes.some((type) => type === productType)) {
    throw new Error("Loại sản phẩm không thuộc nhóm bảo dưỡng đã chọn.");
  }

  const current = await prisma.product.findFirst({
    where: { id, kind: "service", category: { slug: "dich-vu-bao-duong" } },
    select: { id: true },
  });
  if (!current) throw new Error("Không tìm thấy dịch vụ bảo dưỡng.");

  const imageUrl = getFormOptionalString(formData, "imageUrl");
  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug: await uniqueProductSlug(name, getFormString(formData, "slug"), id),
      description: getFormOptionalString(formData, "description"),
      specifications: {
        serviceType: "maintenance",
        serviceGroupKey: group.value,
        serviceGroup: group.label,
        productType,
      },
      variants: {
        update: {
          where: { id: variantId },
          data: { sku, price: getFormDecimal(formData, "price") },
        },
      },
      images: imageUrl ? { deleteMany: {}, create: { url: imageUrl, order: 0 } } : undefined,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/admin/services/maintenance");
  revalidatePath("/services/maintenance");
}

export async function deleteMaintenanceService(formData: FormData) {
  await requireAdminSession();
  const id = getFormString(formData, "id");
  if (!id) return;

  await prisma.product.updateMany({
    where: { id, kind: "service", category: { slug: "dich-vu-bao-duong" } },
    data: { isActive: false, deletedAt: new Date() },
  });

  revalidatePath("/admin/services");
  revalidatePath("/admin/services/maintenance");
  revalidatePath("/services/maintenance");
  revalidatePath("/admin");
}

export async function updateWarrantyAppointmentStatus(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;

  const status = getEnumValue(
    requestStatuses,
    getFormString(formData, "status"),
    "pending"
  ) as RequestStatus;

  await prisma.warrantyAppointment.update({
    where: { id },
    data: {
      status,
      notes: getFormOptionalString(formData, "notes"),
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/admin");
}

export async function updateProductRegistrationStatus(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;

  const status = getEnumValue(
    requestStatuses,
    getFormString(formData, "status"),
    "pending"
  ) as RequestStatus;

  await prisma.productRegistration.update({
    where: { id },
    data: {
      status,
      notes: getFormOptionalString(formData, "notes"),
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/admin");
}

export async function createCoupon(formData: FormData) {
  await requireAdminSession();

  const code = getFormString(formData, "code").toUpperCase();
  if (!code) return;

  const usageLimit = getFormNumber(formData, "usageLimit", -1);
  const maxDiscountAmount = getFormDecimal(formData, "maxDiscountAmount", "");
  const minOrderAmount = getFormDecimal(formData, "minOrderAmount", "");

  await prisma.coupon.create({
    data: {
      code,
      discountType: getFormString(formData, "discountType") || "percentage",
      discountValue: getFormDecimal(formData, "discountValue"),
      minOrderAmount: minOrderAmount || null,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit >= 0 ? usageLimit : null,
      usageLimitPerUser: getFormNumber(formData, "usageLimitPerUser", 1),
      startDate: getFormDate(formData, "startDate"),
      endDate: getFormDate(formData, "endDate"),
      isActive: getFormBoolean(formData, "isActive"),
    },
  });

  revalidatePath("/admin/promotions");
}

export async function toggleCouponActive(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;

  const currentValue = getFormString(formData, "currentValue") === "true";

  await prisma.coupon.update({
    where: { id },
    data: { isActive: !currentValue },
  });

  revalidatePath("/admin/promotions");
}

export async function createPromotion(formData: FormData) {
  await requireAdminSession();

  const title = getFormString(formData, "title");
  if (!title) return;

  await prisma.promotion.create({
    data: {
      slug: await uniquePromotionSlug(title, getFormString(formData, "slug")),
      title,
      discountPercentage: Math.min(
        Math.max(getFormNumber(formData, "discountPercentage"), 0),
        100
      ),
      description: getFormOptionalString(formData, "description"),
      highlights: parseLines(getFormString(formData, "highlights")),
      terms: parseLines(getFormString(formData, "terms")),
      startDate: getFormDate(formData, "startDate"),
      endDate: getFormDate(formData, "endDate"),
      bannerImageUrl: getFormOptionalString(formData, "bannerImageUrl"),
      linkUrl: getFormOptionalString(formData, "linkUrl"),
      isActive: getFormBoolean(formData, "isActive"),
    },
  });

  revalidatePath("/admin/promotions");
  revalidatePath("/khuyen-mai");
}

export async function updatePromotion(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  const title = getFormString(formData, "title");
  if (!id || !title) return;

  await prisma.promotion.update({
    where: { id },
    data: {
      slug: await uniquePromotionSlug(title, getFormString(formData, "slug"), id),
      title,
      discountPercentage: Math.min(
        Math.max(getFormNumber(formData, "discountPercentage"), 0),
        100
      ),
      description: getFormOptionalString(formData, "description"),
      highlights: parseLines(getFormString(formData, "highlights")),
      terms: parseLines(getFormString(formData, "terms")),
      startDate: getFormDate(formData, "startDate"),
      endDate: getFormDate(formData, "endDate"),
      bannerImageUrl: getFormOptionalString(formData, "bannerImageUrl"),
      linkUrl: getFormOptionalString(formData, "linkUrl"),
      isActive: getFormBoolean(formData, "isActive"),
    },
  });

  revalidatePath("/admin/promotions");
  revalidatePath("/khuyen-mai");
}

export async function togglePromotionActive(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;

  const currentValue = getFormString(formData, "currentValue") === "true";

  await prisma.promotion.update({
    where: { id },
    data: { isActive: !currentValue },
  });

  revalidatePath("/admin/promotions");
  revalidatePath("/khuyen-mai");
}

export async function deletePromotion(formData: FormData) {
  await requireAdminSession();

  const id = getFormString(formData, "id");
  if (!id) return;

  await prisma.promotion.delete({ where: { id } });

  revalidatePath("/admin/promotions");
  revalidatePath("/khuyen-mai");
}
