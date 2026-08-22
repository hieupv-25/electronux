import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceBanner from "@/components/ServiceBanner";
import ProductCard from "@/components/ProductCard";
import { footerSections, navItems, services } from "@/data/siteData";
import { searchCatalogFromDatabase } from "@/lib/catalogDb";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata = {
  title: "Tìm kiếm sản phẩm | Electrolux Việt Nam",
  description: "Tìm sản phẩm Electrolux theo tên, model hoặc mã sản phẩm.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const results = await searchCatalogFromDatabase(query);

  return (
    <>
      <Header navItems={navItems} />
      <ServiceBanner services={services} />
      <main className="catalog-search-page">
        <section className="catalog-search-hero">
          <div>
            <p>Tìm kiếm sản phẩm</p>
            <h1>{query ? `Kết quả cho “${query}”` : "Bạn đang tìm sản phẩm nào?"}</h1>
            <form action="/search" className="catalog-search-form">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Nhập tên sản phẩm hoặc model, ví dụ EWF9023P5WC"
                aria-label="Từ khóa tìm kiếm"
              />
              <button type="submit">Tìm kiếm</button>
            </form>
          </div>
        </section>

        <section className="catalog-search-content">
          {query.length < 2 ? (
            <div className="catalog-search-empty">
              <h2>Nhập ít nhất 2 ký tự để tìm kiếm</h2>
              <p>Bạn có thể tìm theo tên thiết bị, dòng sản phẩm hoặc mã model.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="catalog-search-empty">
              <h2>Không tìm thấy sản phẩm phù hợp</h2>
              <p>Hãy kiểm tra lại từ khóa hoặc thử tên danh mục như “máy giặt”, “tủ lạnh”.</p>
            </div>
          ) : (
            <>
              <div className="catalog-search-summary">
                <h2>{results.length} sản phẩm phù hợp</h2>
                <p>Kết quả được tìm theo tên sản phẩm, model, danh mục và tính năng.</p>
              </div>
              <div className="catalog-search-grid">
                {results.map(({ categorySlug, product }) => (
                  <ProductCard key={`${categorySlug}-${product.id}`} product={product} categorySlug={categorySlug} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer footerSections={footerSections} />
    </>
  );
}
