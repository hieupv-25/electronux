import { Suspense } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import ServiceBanner from "@/components/ServiceBanner";
import PromoBentoGrid from "@/components/PromoBentoGrid";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import {
  heroSlides,
  services,
  categories,
  products,
  navItems,
  footerSections,
} from "@/data/siteData";

/* ── Main Page ── */
export default function Home() {
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
      <section style={{ padding: "50px 15px", maxWidth: 1180, margin: "0 auto" }}>
        <h2 className="section-heading">Khám phá sản phẩm</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 24 }}>
          {categories.map((c, i) => (
            <a key={i} href="#" className="category-tile">
              <Image src={c.icon} alt={c.name} width={80} height={80} className="category-tile__icon" />
              <span className="category-tile__name">{c.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ====== BEST SELLERS ====== */}
      <section style={{ padding: "40px 15px 60px", background: "var(--elx-gray-light)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h2 className="section-heading">Sản phẩm bán chạy</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {products.map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== PROMO BENTO GRID (ảnh + thẻ nền tối + 2 ảnh + 1 ảnh full-width) ====== */}
      <PromoBentoGrid />

      {/* ====== NEWSLETTER ====== */}
      <Newsletter />

      {/* ====== FOOTER ====== */}
      <Footer footerSections={footerSections} />
    </>
  );
}
