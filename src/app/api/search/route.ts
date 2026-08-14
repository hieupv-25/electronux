import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalogSearch";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 6);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 12) : 6;

  if (query.length < 2) return NextResponse.json({ query, results: [] });

  const results = searchCatalog(query, limit).map(({ categorySlug, categoryName, product }) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    image: product.img,
    price: product.price,
    categoryName,
    href: `/thiet-bi/${categorySlug}/${product.slug}`,
  }));

  return NextResponse.json({ query, results });
}
