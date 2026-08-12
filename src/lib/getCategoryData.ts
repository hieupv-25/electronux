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
