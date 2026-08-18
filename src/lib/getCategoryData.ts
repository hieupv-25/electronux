import {
  hobCategory,
  fridgeCategory,
  dryerCategory,
  riceCookerCategory,
  washingMachineCategory,
  blenderCategory,
  airPurifierCategory,
  dehumidifierCategory,
  waterHeaterCategory,
  indirectWaterHeaterCategory,
  type CategoryPageData,
  type CategoryProduct,
} from "@/data/categories";

export const ALL_CATEGORIES: CategoryPageData[] = [
  washingMachineCategory,
  dryerCategory,
  fridgeCategory,
  hobCategory,
  airPurifierCategory,
  dehumidifierCategory,
  blenderCategory,
  riceCookerCategory,
  waterHeaterCategory,
  indirectWaterHeaterCategory,
];

export function getCategoryBySlug(slug: string): CategoryPageData | undefined {
  return ALL_CATEGORIES.find((c) => c.slug === slug);
}

export function getProductBySlug(
  categorySlug: string,
  productSlug: string
): { category: CategoryPageData; product: CategoryProduct } | null {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  const product = category.products.find((p) => p.slug === productSlug);
  if (!product) return null;
  return { category, product };
}

export function findProductByIdOrVariant(idOrVariantId: string): CategoryProduct | undefined {
  for (const cat of ALL_CATEGORIES) {
    const prod = cat.products.find(
      (p) => p.id === idOrVariantId || p.variantId === idOrVariantId || p.sku === idOrVariantId
    );
    if (prod) return prod;
  }
  return undefined;
}

export function decrementProductStock(idOrVariantId: string, quantity = 1): number {
  const prod = findProductByIdOrVariant(idOrVariantId);
  if (prod) {
    const current = prod.stockQuantity ?? 10;
    prod.stockQuantity = Math.max(0, current - quantity);
    return prod.stockQuantity;
  }
  return 0;
}

export function incrementProductStock(idOrVariantId: string, quantity = 1): number {
  const prod = findProductByIdOrVariant(idOrVariantId);
  if (prod) {
    const current = prod.stockQuantity ?? 10;
    prod.stockQuantity = current + quantity;
    return prod.stockQuantity;
  }
  return 0;
}

