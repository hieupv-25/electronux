import AdminProductsClient from "@/app/admin/products/AdminProductsClient";
import type { ProductWhereInput } from "@/generated/prisma/models/Product";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const productPageSize = 10;

type ProductSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type ProductFilters = {
  q: string;
  categoryId: string;
  status: string;
  stock: string;
  page: number;
};

function getParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalizePage(value: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function buildProductWhere(filters: ProductFilters): ProductWhereInput {
  const andFilters: ProductWhereInput[] = [{ deletedAt: null }];

  if (filters.q) {
    const stringFilter = {
      contains: filters.q,
      mode: "insensitive" as const,
    };

    andFilters.push({
      OR: [
        { name: stringFilter },
        { slug: stringFilter },
        { description: stringFilter },
        {
          category: {
            name: stringFilter,
          },
        },
        {
          brand: {
            name: stringFilter,
          },
        },
        {
          variants: {
            some: {
              OR: [
                { sku: stringFilter },
                {
                  variantName: stringFilter,
                },
              ],
            },
          },
        },
      ],
    });
  }

  if (filters.categoryId) {
    andFilters.push({ categoryId: filters.categoryId });
  }

  if (filters.status === "active") {
    andFilters.push({ isActive: true });
  }

  if (filters.status === "hidden") {
    andFilters.push({ isActive: false });
  }

  if (filters.stock === "low") {
    andFilters.push({
      variants: { some: { stockQuantity: { lte: 5 } } },
    });
  }

  if (filters.stock === "out") {
    andFilters.push({
      variants: { some: { stockQuantity: 0 } },
    });
  }

  return andFilters.length === 1 ? andFilters[0] : { AND: andFilters };
}

async function getProductsData(filters: ProductFilters) {
  const where = buildProductWhere(filters);
  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalProducts / productPageSize));
  const currentPage = Math.min(filters.page, totalPages);

  const [products, categories, brands, summary] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * productPageSize,
      take: productPageSize,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true },
        },
        variants: {
          orderBy: { sku: "asc" },
          select: {
            id: true,
            sku: true,
            variantName: true,
            price: true,
            discountPercentage: true,
            stockQuantity: true,
            isActive: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
          take: 1,
          select: { url: true },
        },
        _count: {
          select: { reviews: true, wishlistItems: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      prisma.product.count({ where: { deletedAt: null, isActive: false } }),
      prisma.product.count({
        where: {
          deletedAt: null,
          variants: { some: { stockQuantity: { lte: 5 } } },
        },
      }),
      prisma.product.count({
        where: {
          deletedAt: null,
          variants: { some: { stockQuantity: 0 } },
        },
      }),
    ]),
  ]);

  const serializedProducts = products.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
    })),
  }));

  return {
    products: serializedProducts,
    totalProducts,
    totalPages,
    currentPage,
    categories,
    brands,
    summary: {
      all: summary[0],
      active: summary[1],
      hidden: summary[2],
      lowStock: summary[3],
      outStock: summary[4],
    },
  };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: ProductSearchParams;
}) {
  const params = await searchParams;
  const filters: ProductFilters = {
    q: getParam(params, "q").trim(),
    categoryId: getParam(params, "categoryId"),
    status: getParam(params, "status"),
    stock: getParam(params, "stock"),
    page: normalizePage(getParam(params, "page")),
  };
  const {
    products,
    totalProducts,
    totalPages,
    currentPage,
    categories,
    brands,
    summary,
  } = await getProductsData(filters);
  const isFiltering =
    Boolean(filters.q) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.status) ||
    Boolean(filters.stock);

  return (
    <AdminProductsClient
      products={products}
      totalProducts={totalProducts}
      totalPages={totalPages}
      currentPage={currentPage}
      categories={categories}
      brands={brands}
      summary={summary}
      filters={filters}
      isFiltering={isFiltering}
    />
  );
}
