import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ServiceBanner from "@/components/ServiceBanner";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryHero from "@/components/CategoryHero";
import CategoryListing from "@/components/category/CategoryListing";
import Footer from "@/components/Footer";
import { getCategoryBySlug, ALL_CATEGORIES } from "@/lib/getCategoryData";
import { navItems, services, footerSections } from "@/data/siteData";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateStaticParams() {
  return ALL_CATEGORIES.map((cat) => ({
    categorySlug: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: "Danh mục không tồn tại | Electrolux Việt Nam" };
  return {
    title: `${category.title}`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <Header navItems={navItems} />
      <ServiceBanner services={services} />

      <div className="plp-page">
        <div className="plp-page__container">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: category.name },
            ]}
          />
        </div>

        <CategoryHero
          title={category.name}
          description={category.description}
          image={category.heroImage}
        />

        <CategoryListing data={category} />
      </div>

      <Footer footerSections={footerSections} />
    </>
  );
}
