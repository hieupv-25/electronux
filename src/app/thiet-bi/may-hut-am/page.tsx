import type { Metadata } from "next";
import Header from "@/components/Header";
import ServiceBanner from "@/components/ServiceBanner";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryHero from "@/components/CategoryHero";
import CategoryListing from "@/components/category/CategoryListing";
import Footer from "@/components/Footer";
import { dehumidifierCategory } from "@/data/categories";
import { navItems, services, footerSections } from "@/data/siteData";

export const metadata: Metadata = {
  title: dehumidifierCategory.title,
  description: dehumidifierCategory.description,
};

export default function MayHutAmPage() {
  const category = dehumidifierCategory;

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
