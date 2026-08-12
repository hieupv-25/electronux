"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";

export default function SubscriptionsClient() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container">
        <h1 className="account-heading">Gói Đăng ký Định kỳ</h1>

        <div className="account-layout">
          <AccountSidebar activeHref="/account/subscriptions" />

          <div className="account-content">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: "480px" }}>
                <input
                  type="text"
                  placeholder="Tìm kiếm mã đơn đặt hàng hoặc tên sản phẩm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 14px",
                    border: "1px solid #dcdfe6",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    outline: "none",
                    color: "#0b2545",
                  }}
                />
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0b2545"
                  strokeWidth="2"
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}
