"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

/* ─── Fixed-price repair packages ─── */
const repairPackages = [
    { name: "Dịch vụ sửa tủ lạnh ngăn đá trên, ngăn đá dưới và tủ lạnh 3 cánh (dưới 300L)", category: "Tủ lạnh" },
    { name: "Dịch vụ sửa tủ lạnh ngăn đá trên, ngăn đá dưới và tủ lạnh 3 cánh (trên 300L)", category: "Tủ lạnh" },
    { name: "Dịch vụ sửa tủ lạnh mini", category: "Tủ lạnh" },
    { name: "Dịch vụ sửa máy giặt cửa ngang", category: "Máy giặt và máy giặt sấy" },
    { name: "Dịch vụ sửa máy giặt cửa trên", category: "Máy giặt và máy giặt sấy" },
    { name: "Dịch vụ sửa máy giặt sấy", category: "Máy giặt và máy giặt sấy" },
    { name: "Dịch vụ sửa máy sấy ngưng tụ và máy sấy bơm nhiệt", category: "Máy sấy" },
    { name: "Dịch vụ sửa máy sấy thông hơi", category: "Máy sấy" },
    { name: "Dịch vụ sửa bếp từ âm", category: "Bếp từ, bếp ga" },
    { name: "Dịch vụ sửa bếp ga âm", category: "Bếp từ, bếp ga" },
    { name: "Dịch vụ sửa máy hút mùi âm và máy hút mùi dạng kéo", category: "Máy hút mùi" },
    { name: "Kiểm tra tại nhà cho tất cả các thiết bị", category: "Tất cả thiết bị" },
];

const advantages = [
    {
        title: "Một mức phí cố định",
        desc: "Chỉ một (01) mức phí cố định áp dụng xuyên suốt quá trình sửa chữa.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
        ),
    },
    {
        title: "Phạm vi sửa chữa tối đa",
        desc: "Hỗ trợ phạm vi sửa chữa tối đa có giá trị gấp đôi giá gói dịch vụ.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    },
    {
        title: "Ưu đãi mua máy mới",
        desc: "Được hỗ trợ ưu đãi mua máy mới khi việc sửa chữa không khả thi.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
            </svg>
        ),
    },
];

export default function FixedPriceRepairPage() {
    return (
        <>
            <Header navItems={navItems} />

            {/* Hero */}
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "48px 30px 40px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <a href="/support" style={{ color: "#a0c0e0", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, textDecoration: "none" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Hỗ trợ sản phẩm
                    </a>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 10px" }}>Gói sửa chữa giá cố định</h1>
                    <p style={{ fontSize: "1rem", color: "#ccd6e8", margin: 0, maxWidth: 640 }}>
                        Dịch vụ sửa chữa đồ điện gia dụng Electrolux tại nhà với mức phí trả trước cố định và phụ tùng thay thế chính hãng, mang đến sự an tâm cho bạn.
                    </p>
                </div>
            </section>

            {/* Advantages */}
            <section style={{ padding: "56px 30px", borderBottom: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 40 }}>
                        Ưu điểm của gói sửa chữa giá cố định
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
                        {advantages.map((adv, i) => (
                            <div key={i} style={{ textAlign: "center", padding: "24px 16px" }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--elx-navy)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                    {adv.icon}
                                </div>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 8 }}>{adv.title}</h3>
                                <p style={{ fontSize: "0.93rem", color: "#4a5a72", lineHeight: 1.6, margin: 0 }}>{adv.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Repair Packages */}
            <section style={{ padding: "56px 30px", background: "#f7f9fb" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 12 }}>
                        Danh sách gói sửa chữa
                    </h2>
                    <p style={{ textAlign: "center", color: "#4a5a72", fontSize: "0.95rem", marginBottom: 40 }}>
                        Chọn gói phù hợp với thiết bị của bạn
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                        {repairPackages.map((pkg, i) => (
                            <div key={i} style={{
                                background: "#fff", border: "1px solid var(--elx-border)", borderRadius: 8,
                                padding: "28px 24px", display: "flex", flexDirection: "column", gap: 12,
                                transition: "box-shadow 0.2s, border-color 0.2s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--elx-navy)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,44,91,0.1)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--elx-border)"; e.currentTarget.style.boxShadow = "none"; }}
                            >
                                <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1, color: "#7a8a9c", fontWeight: 600 }}>
                                    {pkg.category}
                                </span>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--elx-navy)", margin: 0, lineHeight: 1.4, flex: 1 }}>
                                    {pkg.name}
                                </h3>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 8 }}>
                                    <a href="/support/warranty-appointment" style={{
                                        background: "var(--elx-navy)", color: "#fff", padding: "8px 20px",
                                        borderRadius: 4, fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                    }}>
                                        Khám phá ngay
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: "48px 30px", textAlign: "center", borderTop: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 12 }}>
                        Bạn cần sửa chữa thiết bị?
                    </h2>
                    <p style={{ color: "#4a5a72", fontSize: "0.95rem", marginBottom: 24 }}>
                        Đặt lịch hẹn ngay hôm nay để kỹ thuật viên Electrolux đến sửa chữa tại nhà với giá cố định, không phát sinh chi phí.
                    </p>
                    <a href="/support/warranty-appointment" style={{
                        display: "inline-block", background: "var(--elx-navy)", color: "#fff",
                        padding: "14px 36px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", textDecoration: "none",
                    }}>
                        Đặt lịch sửa chữa ngay
                    </a>
                </div>
            </section>

            {/* Emergency CTA */}
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "32px 30px", textAlign: "center" }}>
                <p style={{ fontSize: "1rem", marginBottom: 12 }}>Cần tư vấn thêm? Gọi trực tiếp cho chúng tôi</p>
                <a href="tel:1800588899" style={{ background: "#fff", color: "var(--elx-navy)", padding: "10px 28px", borderRadius: 4, fontWeight: 800, textDecoration: "none", fontSize: "1.1rem" }}>
                    1800 588 899
                </a>
                <p style={{ fontSize: "0.85rem", color: "#a0c0e0", margin: "10px 0 0" }}>Thứ Hai – Thứ Sáu: 8:00 – 18:00 | Thứ Bảy: 8:00 – 17:00</p>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
