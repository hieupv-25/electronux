"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";

export default function WishlistClient() {
  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container">
        <h1 className="account-heading">Sản phẩm yêu thích</h1>

        <div className="account-layout">
          <AccountSidebar activeHref="/account/wishlist" />

          <div className="account-content">
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0b2545" }}>
                0 Sản phẩm
              </span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginBottom: "40px" }} />
          </div>
        </div>
      </main>

      <Footer sections={footerSections} />
    </>
  );
}
