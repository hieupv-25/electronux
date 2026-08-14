"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { navItems, footerSections } from "@/data/siteData";

export default function RemindersClient() {
  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container">
        <h1 className="account-heading">Danh sách nhắc nhở</h1>

        <div className="account-layout">
          <AccountSidebar activeHref="/account/reminders" />

          <div className="account-content">
            <div
              style={{
                background: "#dbe5ec",
                padding: "24px 32px",
                borderRadius: "2px",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0b2545", margin: 0 }}>
                0 Sản phẩm
              </h2>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>
              * Bạn đã đăng ký nhận thông báo cho các sản phẩm này. Khi có hàng trở lại, chúng tôi sẽ cho bạn biết. Nếu bạn không muốn nhận thông báo cho một sản phẩm nữa, bạn có thể &quot;Hủy đăng ký&quot;
            </p>
          </div>
        </div>
      </main>

      <Footer sections={footerSections} />
    </>
  );
}
