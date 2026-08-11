"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

/* ─── Warranty extension benefits ─── */
const coverageItems = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
        ),
        title: "Chi phí sửa chữa",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3h-8l-2 4h12z" />
            </svg>
        ),
        title: "Phụ tùng chính hãng của nhà sản xuất",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
        ),
        title: "Công lao động dịch vụ",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 5 20 16 16 13 16 8" />
            </svg>
        ),
        title: "Phí giao nhận",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
        ),
        title: "Hỗ trợ chăm sóc khách hàng tận tâm",
    },
];

/* ─── Steps ─── */
const steps = [
    { num: "01", title: "Nhập thông tin mẫu máy", desc: "Nhập mã số sản phẩm (model number) của thiết bị bạn muốn gia hạn bảo hành." },
    { num: "02", title: "Nhập thông tin mua sản phẩm", desc: "Cung cấp thông tin ngày mua, nơi mua và hóa đơn mua hàng." },
    { num: "03", title: "Chọn tùy chọn Gia Hạn Bảo Hành", desc: "Chọn gói gia hạn bảo hành phù hợp với nhu cầu của bạn và hoàn tất thanh toán." },
];

export default function WarrantyExtensionPage() {
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
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 10px" }}>Gia Hạn Bảo Hành của Electrolux</h1>
                    <p style={{ fontSize: "1rem", color: "#ccd6e8", margin: 0, maxWidth: 640 }}>
                        Chỉ áp dụng cho sản phẩm mua tại Việt Nam còn trong thời gian bảo hành của nhà sản xuất.
                    </p>
                </div>
            </section>

            {/* Coverage items */}
            <section style={{ padding: "56px 30px", borderBottom: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 40 }}>
                        Quyền lợi khi gia hạn bảo hành
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24 }}>
                        {coverageItems.map((item, i) => (
                            <div key={i} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--elx-navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {item.icon}
                                </div>
                                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--elx-navy)", margin: 0, lineHeight: 1.4 }}>{item.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section style={{ padding: "56px 30px", background: "#f7f9fb" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 12 }}>
                        Cách mua gia hạn bảo hành
                    </h2>
                    <p style={{ textAlign: "center", color: "#4a5a72", fontSize: "0.95rem", marginBottom: 48 }}>
                        Chỉ 3 bước đơn giản để gia hạn bảo hành cho thiết bị của bạn
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
                        {steps.map((s, i) => (
                            <div key={i} style={{ textAlign: "center", padding: "24px 16px" }}>
                                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--elx-navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, margin: "0 auto 16px" }}>
                                    {s.num}
                                </div>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 8 }}>{s.title}</h3>
                                <p style={{ fontSize: "0.93rem", color: "#4a5a72", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registration check */}
            <section style={{ padding: "48px 30px", borderTop: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <div style={{ background: "#eef4fb", border: "1px solid #c5d8ef", borderRadius: 12, padding: "36px 32px" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                        </svg>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 12 }}>
                            Bạn đã đăng ký bảo hành cho thiết bị của mình chưa?
                        </h3>
                        <p style={{ color: "#4a5a72", fontSize: "0.95rem", marginBottom: 24, lineHeight: 1.6 }}>
                            Hãy đăng ký bảo hành điện tử trước khi mua gia hạn bảo hành để đảm bảo quyền lợi của bạn.
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                            <a href="/support/warranty-registration" style={{
                                background: "var(--elx-navy)", color: "#fff", padding: "12px 28px",
                                borderRadius: 4, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none",
                            }}>
                                Đăng ký bảo hành điện tử
                            </a>
                            <a href="/support/warranty-policy" style={{
                                background: "#fff", color: "var(--elx-navy)", padding: "12px 28px", border: "2px solid var(--elx-navy)",
                                borderRadius: 4, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none",
                            }}>
                                Xem chính sách bảo hành
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Emergency CTA */}
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "32px 30px", textAlign: "center" }}>
                <p style={{ fontSize: "1rem", marginBottom: 12 }}>Cần tư vấn thêm về gia hạn bảo hành? Gọi trực tiếp cho chúng tôi</p>
                <a href="tel:1800588899" style={{ background: "#fff", color: "var(--elx-navy)", padding: "10px 28px", borderRadius: 4, fontWeight: 800, textDecoration: "none", fontSize: "1.1rem" }}>
                    1800 588 899
                </a>
                <p style={{ fontSize: "0.85rem", color: "#a0c0e0", margin: "10px 0 0" }}>Thứ Hai – Thứ Sáu: 8:00 – 18:00 | Thứ Bảy: 8:00 – 17:00</p>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
