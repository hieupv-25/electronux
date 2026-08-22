import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import ServiceBanner from "@/components/ServiceBanner";
import PromoBentoGrid from "@/components/PromoBentoGrid";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getHomeCatalogData } from "@/lib/catalogDb";
import {
  heroSlides,
  services,
  navItems,
  footerSections,
} from "@/data/siteData";

/* ── Main Page ── */
type HomeProps = {
  searchParams?: Promise<{
    authRequired?: string;
    adminForbidden?: string;
    next?: string;
    view?: string;
  }>;
};

function chunkItems<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size)
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const [params, session, catalog] = await Promise.all([
    searchParams,
    auth(),
    getHomeCatalogData(),
  ]);
  const shouldShowCustomerPage =
    params?.authRequired === "true" ||
    params?.adminForbidden === "true" ||
    params?.view === "customer" ||
    Boolean(params?.next);

  if (!shouldShowCustomerPage && session?.user.role === "admin") {
    redirect("/admin");
  }
  const categoryPages = chunkItems(catalog.categories, 10);

  return (
    <>
      <Suspense fallback={null}>
        <Header navItems={navItems} />
      </Suspense>

      {/* ====== SERVICE BANNER ====== */}
      <ServiceBanner services={services} />

      {/* ====== HERO SLIDER ====== */}
      <HeroSlider slides={heroSlides} />

      {/* ====== BROWSE PRODUCTS ====== */}
      <section className="home-category-section">
        <h2 className="section-heading">Khám phá sản phẩm</h2>
        <div className="home-category-carousel" aria-label="Danh mục sản phẩm">
          {categoryPages.map((page, pageIndex) => (
            <div className="home-category-page" key={`category-page-${pageIndex}`}>
              {page.map((c) => (
                <Link key={c.href} href={c.href} className="category-tile">
                  <Image src={c.icon} alt={c.name} width={80} height={80} className="category-tile__icon" />
                  <span className="category-tile__name">{c.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ====== BEST SELLERS ====== */}
      <section className="home-best-sellers">
        <div className="home-section-inner">
          <h2 className="section-heading">Sản phẩm bán chạy</h2>
          <div className="home-best-sellers__grid">
            {catalog.bestSellerProducts.map(({ categorySlug, product }, i) => (
              <ProductCard
                key={`${categorySlug ?? "home"}-${product.id}-${i}`}
                product={product}
                categorySlug={categorySlug}
                hideFeatures
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURED PRODUCTS ====== */}
      {catalog.featuredProducts.length > 0 && (
        <section className="home-featured">
          <div className="home-section-inner">
            <h2 className="section-heading">Sản phẩm nổi bật</h2>
            <div className="home-featured__tabs" aria-label="Danh mục sản phẩm nổi bật">
              {Array.from(
                new Map(
                  catalog.featuredProducts
                    .filter(({ categorySlug, categoryName }) => categorySlug && categoryName)
                    .map(({ categorySlug, categoryName }) => [categorySlug, categoryName])
                )
              )
                .slice(0, 3)
                .map(([categorySlug, categoryName], index) => (
                  <Link
                    key={categorySlug}
                    href={`/thiet-bi/${categorySlug}`}
                    className={`home-featured__tab${index === 0 ? " home-featured__tab--active" : ""}`}
                  >
                    {categoryName}
                  </Link>
                ))}
            </div>
            <div className="home-featured__grid">
              {catalog.featuredProducts.map(({ categorySlug, product }, i) => (
                <ProductCard
                  key={`${categorySlug ?? "featured"}-${product.id}-${i}`}
                  product={product}
                  categorySlug={categorySlug}
                  hideFeatures
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== PROMO BENTO GRID (ảnh + thẻ nền tối + 2 ảnh + 1 ảnh full-width) ====== */}
      <PromoBentoGrid />

      {/* ====== NEWSLETTER ====== */}
      <Newsletter />

      {/* ====== FOOTER ====== */}
      <Footer footerSections={footerSections} />
    </>
  );
}
