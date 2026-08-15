import { ALL_CATEGORIES } from "@/lib/getCategoryData";
import type { CategoryProduct } from "@/data/categories";

export type CatalogSearchResult = {
  categorySlug: string;
  categoryName: string;
  product: CategoryProduct;
};

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

export function searchCatalog(query: string, limit = 40): CatalogSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return ALL_CATEGORIES.flatMap((category) =>
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
