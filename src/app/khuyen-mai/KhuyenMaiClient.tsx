"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceBanner from "@/components/ServiceBanner";
import Breadcrumb from "@/components/Breadcrumb";
import { navItems, footerSections, services } from "@/data/siteData";

export type StorefrontPromotion = {
  id: string;
  slug: string;
  title: string;
  period: string;
  startDate: string;
  endDate: string;
  image: string;
  description: string;
  highlights: string[];
  terms?: string[];
  linkUrl: string;
  discountPercentage: number;
};

export default function KhuyenMaiClient({ promotions }: { promotions: StorefrontPromotion[] }) {
  const [selectedPromo, setSelectedPromo] = useState<StorefrontPromotion | null>(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header navItems={navItems} />

      <div style={{ padding: "12px 15px", background: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Khuyến mại" },
            ]}
          />
        </div>
      </div>

      <ServiceBanner services={services} />

      <section
        style={{
          position: "relative",
          width: "100%",
          height: "250px",
          overflow: "hidden",
          background: "#011e41",
        }}
      >
        <Image
          src="/promotions/banner_clean.png"
          alt="Khuyến mại Electrolux"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 40px",
          }}
        >
          <div
            style={{
              background: "#011e41",
              color: "#ffffff",
              padding: "18px 45px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              display: "inline-block",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "1.85rem",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
              }}
            >
              Khuyến mại
            </h1>
          </div>
        </div>
      </section>

      <main style={{ flex: 1, padding: "50px 15px 70px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "40px 30px",
              maxWidth: "960px",
              margin: "0 auto",
            }}
          >
            {promotions.map((promo) => (
              <div
                key={promo.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#ffffff",
                  borderRadius: "4px",
                  overflow: "hidden",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    background: "#f0f2f5",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    padding: "20px 0 0 0",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--elx-navy, #011e41)",
                      lineHeight: "1.4",
                      marginBottom: "8px",
                      minHeight: "56px",
                    }}
                  >
                    {promo.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#6c757d",
                      margin: "0 0 20px 0",
                    }}
                  >
                    {promo.period}
                  </p>

                  <div style={{ marginTop: "auto" }}>
                    <button
                      onClick={() => setSelectedPromo(promo)}
                      style={{
                        background: "var(--elx-navy, #011e41)",
                        color: "#ffffff",
                        border: "none",
                        padding: "10px 22px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        transition: "background 0.2s ease, opacity 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      XEM CHI TIẾT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {selectedPromo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setSelectedPromo(null)}
        >
          <div
            style={{
              background: "#ffffff",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "8px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              padding: "0",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPromo(null)}
              style={{
                position: "absolute",
                top: "14px",
                right: "16px",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                fontSize: "1.2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              x
            </button>

            <div style={{ position: "relative", width: "100%", height: "240px" }}>
              <Image
                src={selectedPromo.image}
                alt={selectedPromo.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <div style={{ padding: "24px 28px" }}>
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "var(--elx-navy, #011e41)",
                  marginBottom: "8px",
                }}
              >
                {selectedPromo.title}
              </h2>

              <p style={{ fontSize: "0.9rem", color: "#e63946", fontWeight: 600, marginBottom: "16px" }}>
                {selectedPromo.period}
              </p>

              <p style={{ fontSize: "0.95rem", color: "#333", lineHeight: 1.6, marginBottom: "20px" }}>
                {selectedPromo.description}
              </p>

              {selectedPromo.highlights.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--elx-navy, #011e41)", marginBottom: "10px" }}>
                    Đặc quyền chương trình:
                  </h4>
                  <ul style={{ paddingLeft: "20px", margin: 0 }}>
                    {selectedPromo.highlights.map((item) => (
                      <li key={item} style={{ fontSize: "0.9rem", color: "#444", marginBottom: "6px" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPromo.terms && selectedPromo.terms.length > 0 && (
                <div style={{ marginBottom: "24px", background: "#f8f9fa", padding: "14px 18px", borderRadius: "6px" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#6c757d", marginBottom: "8px" }}>
                    Điều khoản & Điều kiện:
                  </h4>
                  <ul style={{ paddingLeft: "18px", margin: 0 }}>
                    {selectedPromo.terms.map((term) => (
                      <li key={term} style={{ fontSize: "0.85rem", color: "#6c757d", marginBottom: "4px" }}>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedPromo(null)}
                  style={{
                    padding: "10px 20px",
                    background: "#e9ecef",
                    color: "#495057",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Đóng
                </button>
                <Link
                  href={selectedPromo.linkUrl}
                  style={{
                    padding: "10px 24px",
                    background: "var(--elx-navy, #011e41)",
                    color: "#ffffff",
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    display: "inline-block",
                  }}
                  onClick={() => setSelectedPromo(null)}
                >
                  Mua sắm ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer footerSections={footerSections} />
    </div>
  );
}
