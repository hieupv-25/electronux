import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ServiceBanner from "@/components/ServiceBanner";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import { navItems, services, footerSections } from "@/data/siteData";
import { getProductBySlug, ALL_CATEGORIES } from "@/lib/getCategoryData";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

export async function generateStaticParams() {
  const params: { categorySlug: string; productSlug: string }[] = [];
  for (const cat of ALL_CATEGORIES) {
    for (const prod of cat.products) {
      params.push({ categorySlug: cat.slug, productSlug: prod.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  const result = getProductBySlug(categorySlug, productSlug);
  if (!result) return { title: "Sản phẩm không tồn tại" };
  const { product, category } = result;
  return {
    title: `${product.name} | Electrolux Việt Nam`,
    description: `Mua ${product.name} (${product.sku}) chính hãng tại Electrolux. ${category.description}`,
    openGraph: {
      title: product.name,
      description: category.description,
      images: [{ url: product.img }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { categorySlug, productSlug } = await params;
  const result = getProductBySlug(categorySlug, productSlug);

  if (!result) {
    notFound();
  }

  const { product, category } = result;

  return (
    <>
      <Header navItems={navItems} />
      <ServiceBanner services={services} />

      <div className="plp-page">
        <div className="plp-page__container">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              {
                label: category.name,
                href: `/thiet-bi/${category.slug}`,
              },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <ProductDetailClient product={product} category={category} />

      <Footer footerSections={footerSections} />
    </>
  );
}
