import Image from "next/image";
import Link from "next/link";
import { categoryRoutes } from "@/data/categories";
import { footerSections as defaultFooterSections } from "@/data/siteData";

type FooterSection = {
  title: string;
  links: string[];
};

type FooterProps = {
  footerSections?: FooterSection[];
  sections?: FooterSection[];
};

export default function Footer({ footerSections, sections }: FooterProps) {
  const activeSections = footerSections ?? sections ?? defaultFooterSections ?? [];

  return (
    <footer className="footer">
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "50px 15px 30px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 30,
            marginBottom: 30,
          }}
        >
          {/* Logo + Social */}
          <div>
            <Image
              src="/electrolux_logo.svg"
              alt="Electrolux"
              width={120}
              height={30}
              style={{ filter: "brightness(0) invert(1)", marginBottom: 20 }}
            />
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: 15, lineHeight: 1.6 }}>
              Thương hiệu thiết bị gia dụng hàng đầu từ Thụy Điển
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {["Facebook", "YouTube", "Zalo"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
          {/* Footer Sections */}
          {activeSections.map((sec) => (
            <div key={sec.title}>
              <h4 className="footer__heading">{sec.title}</h4>
              {sec.links.map((link) => {
                const href = categoryRoutes[link] ?? "#";
                return (
                  <Link key={link} href={href} className="footer__link">
                    {link}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        {/* Hotline */}
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
            Hotline:{" "}
            <a href="tel:19006099" style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>
              1900 6099
            </a>
          </p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 2026 Electrolux Vietnam. All rights reserved.</p>
      </div>
    </footer>
  );
}
