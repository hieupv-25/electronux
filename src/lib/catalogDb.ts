import { categories as staticHomeCategories, products as staticHomeProducts } from "@/data/siteData";
import type { CategoryPageData, CategoryProduct } from "@/data/categories";
import { ALL_CATEGORIES, getCategoryBySlug, getProductBySlug } from "@/lib/getCategoryData";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const fallbackProductImage =
  "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/items/product-2.jpg";
const fallbackCategoryImage =
  "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products/bep-nau/hero.png";

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      iconUrl: true,
      deletedAt: true,
    },
  },
  brand: {
    select: {
      id: true,
      name: true,
    },
  },
  variants: {
    where: { isActive: true },
    orderBy: { price: "asc" },
    select: {
      id: true,
      sku: true,
      variantName: true,
      price: true,
      discountPercentage: true,
      stockQuantity: true,
    },
  },
  images: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      url: true,
    },
  },
} satisfies Prisma.ProductInclude;

const categoryInclude = {
  products: {
    where: {
      deletedAt: null,
      isActive: true,
      kind: "physical",
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: productInclude,
  },
} satisfies Prisma.CategoryInclude;

type DbProductForCatalog = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

type DbCategoryForCatalog = Prisma.CategoryGetPayload<{
  include: typeof categoryInclude;
}>;

export type HomeCategoryTile = {
  icon: string;
  name: string;
  href: string;
};

export type HomeProductTile = {
  categorySlug?: string;
  categoryName?: string;
  product: CategoryProduct;
};

export type CatalogSearchResult = {
  categorySlug: string;
  categoryName: string;
  product: CategoryProduct;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSpecString(specifications: unknown, keys: string[]) {
  if (!isRecord(specifications)) return undefined;

  for (const key of keys) {
    const value = specifications[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return undefined;
}

function getSpecNumber(specifications: unknown, keys: string[]) {
  if (!isRecord(specifications)) return undefined;

  for (const key of keys) {
    const value = specifications[key];
    const numberValue =
      typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return undefined;
}

function getSpecStringList(specifications: unknown, keys: string[]) {
  if (!isRecord(specifications)) return [];

  for (const key of keys) {
    const value = specifications[key];
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  }

  return [];
}

function computeOriginalPrice(price: number, discountPercentage: number) {
  if (discountPercentage <= 0 || discountPercentage >= 100) return price;
  return Math.round(price / (1 - discountPercentage / 100));
}

function buildFiltersFromProduct(product: DbProductForCatalog, fallback?: CategoryProduct) {
  if (fallback?.filters?.length) return fallback.filters;
  return ["all", product.category.slug];
}

function mapDbProduct(
  product: DbProductForCatalog,
  fallback?: CategoryProduct
): CategoryProduct {
  const variant = product.variants[0];
  const price = variant ? Number(variant.price) : fallback?.price ?? 0;
  const discountPercentage = variant?.discountPercentage ?? 0;
  const specifications = product.specifications;
  const features =
    getSpecStringList(specifications, ["features", "highlights", "tinhNang"]) ??
    [];
  const normalizedFeatures =
    features.length > 0
      ? features
      : fallback?.features?.length
      ? fallback.features
      : product.description
      ? [product.description]
      : [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: variant?.sku ?? fallback?.sku ?? product.slug.toUpperCase(),
    img: product.images[0]?.url ?? fallback?.img ?? fallbackProductImage,
    price,
    oldPrice: computeOriginalPrice(price, discountPercentage),
    features: normalizedFeatures,
    filters: buildFiltersFromProduct(product, fallback),
    color:
      getSpecString(specifications, ["color", "mau", "mauSac"]) ??
      fallback?.color,
    capacity:
      getSpecNumber(specifications, ["capacity", "dungTich", "khoiLuong", "kg"]) ??
      fallback?.capacity,
    freeShipping: product.freeShipping,
    freeInstallation: product.freeInstallation,
    installment0Percent: product.installment0Percent,
    variantId: variant?.id ?? fallback?.variantId,
    stockQuantity: variant?.stockQuantity ?? fallback?.stockQuantity,
  };
}

function mapHomeProductTile(product: DbProductForCatalog): HomeProductTile {
  return {
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    product: mapDbProduct(
      product,
      getProductBySlug(product.category.slug, product.slug)?.product
    ),
  };
}

function mapStaticHomeProducts() {
  return staticHomeProducts.map((product) => ({ product }));
}

async function getBestSellerProductTiles(take: number): Promise<HomeProductTile[]> {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        deletedAt: null,
        paymentStatus: "paid",
      },
      variant: {
        isActive: true,
        product: {
          deletedAt: null,
          isActive: true,
          kind: "physical",
        },
      },
    },
    select: {
      quantity: true,
      variant: {
        select: {
          productId: true,
          product: {
            include: productInclude,
          },
        },
      },
    },
  });

  const totals = new Map<
    string,
    {
      sold: number;
      product: DbProductForCatalog;
    }
  >();

  for (const item of orderItems) {
    const current = totals.get(item.variant.productId);
    if (current) {
      current.sold += item.quantity;
    } else {
      totals.set(item.variant.productId, {
        sold: item.quantity,
        product: item.variant.product,
      });
    }
  }

  return Array.from(totals.values())
    .sort(
      (left, right) =>
        right.sold - left.sold ||
        left.product.name.localeCompare(right.product.name, "vi")
    )
    .slice(0, take)
    .map(({ product }) => mapHomeProductTile(product));
}

function withAllFilter(filters: CategoryPageData["quickFilters"], count: number) {
  const withoutAll = filters.filter((filter) => filter.id !== "all");
  return [{ id: "all", label: "Tất cả", count }, ...withoutAll];
}

function createBasicSidebarFilters(products: CategoryProduct[]) {
  return {
    type: [{ id: "all", label: "Tất cả", count: products.length }],
    features: [],
    colors: [],
    capacities: [],
  };
}

function mapDbCategory(
  category: DbCategoryForCatalog,
  fallback?: CategoryPageData
): CategoryPageData {
  const fallbackProductsBySlug = new Map(
    (fallback?.products ?? []).map((product) => [product.slug, product])
  );
  const dbProducts = category.products.map((product) =>
    mapDbProduct(product, fallbackProductsBySlug.get(product.slug))
  );
  const dbProductSlugs = new Set(dbProducts.map((product) => product.slug));
  const products = [
    ...dbProducts,
    ...(fallback?.products ?? []).filter((product) => !dbProductSlugs.has(product.slug)),
  ];
  const quickFilters = fallback
    ? withAllFilter(fallback.quickFilters, products.length)
    : [{ id: "all", label: "Tất cả", count: products.length }];

  return {
    slug: category.slug,
    name: category.name,
    title: fallback?.title ?? `Mua ${category.name} Electrolux chính hãng`,
    description:
      fallback?.description ??
      `Khám phá các sản phẩm ${category.name} Electrolux đang được kinh doanh.`,
    defaultFilter: fallback?.defaultFilter ?? "all",
    heroImage:
      category.iconUrl ??
      fallback?.heroImage ??
      products[0]?.img ??
      fallbackCategoryImage,
    heroImageMobile:
      category.iconUrl ??
      fallback?.heroImageMobile ??
      fallback?.heroImage ??
      products[0]?.img,
    quickFilters,
    sidebarFilters: fallback?.sidebarFilters ?? createBasicSidebarFilters(products),
    products,
  };
}

function mergeCatalogCategories(dbCategories: CategoryPageData[]) {
  const dbSlugs = new Set(dbCategories.map((category) => category.slug));
  return [
    ...dbCategories,
    ...ALL_CATEGORIES.filter((category) => !dbSlugs.has(category.slug)),
  ];
}

async function getDbCategories() {
  const dbCategories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: categoryInclude,
  });

  return dbCategories.map((category) =>
    mapDbCategory(category, getCategoryBySlug(category.slug))
  );
}

export async function getVisibleCatalogCategories() {
  try {
    return mergeCatalogCategories(await getDbCategories());
  } catch (error) {
    console.error("Unable to load catalog categories from database:", error);
    return ALL_CATEGORIES;
  }
}

export async function getCategoryPageData(slug: string) {
  try {
    const category = await prisma.category.findFirst({
      where: { slug, deletedAt: null },
      include: categoryInclude,
    });

    if (category) {
      return mapDbCategory(category, getCategoryBySlug(slug));
    }
  } catch (error) {
    console.error("Unable to load category from database:", error);
  }

  return getCategoryBySlug(slug);
}

export async function getProductPageData(categorySlug: string, productSlug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug: productSlug,
        deletedAt: null,
        isActive: true,
        kind: "physical",
        category: {
          slug: categorySlug,
          deletedAt: null,
        },
      },
      include: productInclude,
    });

    if (product) {
      const category = await getCategoryPageData(categorySlug);
      const fallback = getProductBySlug(categorySlug, productSlug)?.product;

      if (category) {
        return {
          category,
          product: mapDbProduct(product, fallback),
        };
      }
    }
  } catch (error) {
    console.error("Unable to load product from database:", error);
  }

  return getProductBySlug(categorySlug, productSlug);
}

export async function getHomeCatalogData(): Promise<{
  categories: HomeCategoryTile[];
  products: HomeProductTile[];
  bestSellerProducts: HomeProductTile[];
  featuredProducts: HomeProductTile[];
}> {
  try {
    const [categories, latestProducts, featuredProducts, bestSellerProducts] = await Promise.all([
      prisma.category.findMany({
        where: { deletedAt: null },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        take: 12,
        select: {
          id: true,
          name: true,
          slug: true,
          iconUrl: true,
        },
      }),
      prisma.product.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          kind: "physical",
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 8,
        include: productInclude,
      }),
      prisma.product.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          isFeatured: true,
          kind: "physical",
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: productInclude,
      }),
      getBestSellerProductTiles(8),
    ]);

    const staticCategoryByName = new Map(
      staticHomeCategories.map((category) => [category.name, category])
    );
    const mappedCategories = categories.map((category) => {
      const fallback = staticCategoryByName.get(category.name);
      return {
        icon: category.iconUrl ?? fallback?.icon ?? "/icon-hob.svg",
        name: category.name,
        href: `/thiet-bi/${category.slug}`,
      };
    });
    const dbCategoryHrefs = new Set(mappedCategories.map((category) => category.href));
    const mergedCategories = [
      ...mappedCategories,
      ...staticHomeCategories.filter((category) => !dbCategoryHrefs.has(category.href)),
    ].slice(0, 12);
    const latestProductTiles = latestProducts.map(mapHomeProductTile);
    const staticProductTiles = mapStaticHomeProducts();
    const bestSellerTiles =
      bestSellerProducts.length > 0 ? bestSellerProducts : latestProductTiles;
    const featuredTiles = featuredProducts.map(mapHomeProductTile);

    return {
      categories: mergedCategories.length > 0 ? mergedCategories : staticHomeCategories,
      products: bestSellerTiles.length > 0 ? bestSellerTiles : staticProductTiles,
      bestSellerProducts: bestSellerTiles.length > 0 ? bestSellerTiles : staticProductTiles,
      featuredProducts: featuredTiles.length > 0 ? featuredTiles : staticProductTiles.slice(0, 5),
    };
  } catch (error) {
    console.error("Unable to load home catalog from database:", error);
    const staticProductTiles = mapStaticHomeProducts();
    return {
      categories: staticHomeCategories,
      products: staticProductTiles,
      bestSellerProducts: staticProductTiles,
      featuredProducts: staticProductTiles.slice(0, 5),
    };
  }
}

export async function searchCatalogFromDatabase(query: string, limit = 40) {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const categories = await getVisibleCatalogCategories();

  return categories
    .flatMap((category) =>
      category.products.map((product) => {
        const normalizedName = normalizeSearchText(product.name);
        const normalizedSku = normalizeSearchText(product.sku);
        const normalizedCategory = normalizeSearchText(category.name);
        const searchableText = normalizeSearchText(
          [product.name, product.sku, category.name, ...product.features].join(" ")
        );

        if (!tokens.every((token) => searchableText.includes(token))) return null;

        let score = 5;
        if (normalizedSku === normalizedQuery) score = 0;
        else if (normalizedSku.startsWith(normalizedQuery)) score = 1;
        else if (normalizedName.startsWith(normalizedQuery)) score = 2;
        else if (normalizedName.includes(normalizedQuery)) score = 3;
        else if (normalizedCategory.includes(normalizedQuery)) score = 4;

        return { categorySlug: category.slug, categoryName: category.name, product, score };
      })
    )
    .filter((result): result is CatalogSearchResult & { score: number } => result !== null)
    .sort((left, right) => left.score - right.score || left.product.name.localeCompare(right.product.name, "vi"))
    .slice(0, Math.max(1, limit))
    .map((result) => ({
      categorySlug: result.categorySlug,
      categoryName: result.categoryName,
      product: result.product,
    }));
}
