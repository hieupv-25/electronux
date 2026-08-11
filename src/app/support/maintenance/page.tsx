"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

/* ─── Maintenance service packages ─── */
const packages = [
    { name: "Vệ sinh máy giặt sấy từ 10kg tại nhà", price: "930.000 ₫", category: "Máy giặt sấy" },
    { name: "Vệ sinh máy giặt sấy dưới 10kg tại nhà", price: "830.000 ₫", category: "Máy giặt sấy" },
    { name: "Vệ sinh máy giặt từ 10kg tại nhà", price: "740.000 ₫", category: "Máy giặt" },
    { name: "Vệ sinh máy giặt dưới 10kg tại nhà", price: "640.000 ₫", category: "Máy giặt" },
    { name: "Vệ sinh máy sấy bơm nhiệt tại nhà", price: "640.000 ₫", category: "Máy sấy" },
    { name: "Vệ sinh máy sấy ngưng tụ tại nhà", price: "540.000 ₫", category: "Máy sấy" },
    { name: "Vệ sinh máy sấy thông hơi tại nhà", price: "440.000 ₫", category: "Máy sấy" },
];

const benefits = [
    { icon: "🏠", title: "Tại nhà", desc: "Kỹ thuật viên của chúng tôi đến tận nơi để chăm sóc thiết bị của bạn." },
    { icon: "📋", title: "Đúng quy chuẩn", desc: "Chăm sóc thiết bị theo đúng quy chuẩn cần thiết, và tư vấn các phương pháp để bạn có thể tự chăm sóc sản phẩm tại nhà." },
    { icon: "⚡", title: "Hiệu suất bền lâu", desc: "Làm sạch và bảo dưỡng thiết bị cho hiệu suất vận hành bền lâu." },
];

export default function MaintenancePage() {
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
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 10px" }}>Dịch vụ bảo dưỡng</h1>
                    <p style={{ fontSize: "1rem", color: "#ccd6e8", margin: 0, maxWidth: 640 }}>
                        Bảo dưỡng, vệ sinh máy giặt máy sấy Electrolux tại nhà chính hãng — chuyên nghiệp, uy tín, chất lượng.
                    </p>
                </div>
            </section>

            {/* Benefits */}
            <section style={{ padding: "56px 30px", borderBottom: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 40 }}>
                        Tại sao chọn dịch vụ bảo dưỡng Electrolux?
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
                        {benefits.map((b, i) => (
                            <div key={i} style={{ textAlign: "center", padding: "24px 16px" }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--elx-navy)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        {i === 0 && <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
                                        {i === 1 && <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>}
                                        {i === 2 && <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>}
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 8 }}>{b.title}</h3>
                                <p style={{ fontSize: "0.93rem", color: "#4a5a72", lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Packages */}
            <section style={{ padding: "56px 30px", background: "#f7f9fb" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 12 }}>
                        Gói dịch vụ bảo dưỡng
                    </h2>
                    <p style={{ textAlign: "center", color: "#4a5a72", fontSize: "0.95rem", marginBottom: 40 }}>
                        Chọn gói phù hợp với thiết bị của bạn
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                        {packages.map((pkg, i) => (
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
                                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--elx-navy)", margin: 0, lineHeight: 1.4 }}>
                                    {pkg.name}
                                </h3>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
                                    <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--elx-navy)" }}>{pkg.price}</span>
                                    <a href="/support/book-service" style={{
                                        background: "var(--elx-navy)", color: "#fff", padding: "8px 20px",
                                        borderRadius: 4, fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                    }}>
                                        Đặt lịch
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Note */}
            <section style={{ padding: "40px 30px", borderTop: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <p style={{ color: "#4a5a72", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 20px" }}>
                        Lưu ý: Giá dịch vụ đã bao gồm công lao động và hóa chất vệ sinh. Phụ kiện thay thế (nếu cần) sẽ được báo giá riêng.
                        Dịch vụ được thực hiện bởi kỹ thuật viên Electrolux chính hãng.
                    </p>
                    <a href="/support/book-service" style={{
                        display: "inline-block", background: "var(--elx-navy)", color: "#fff",
                        padding: "14px 36px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", textDecoration: "none",
                    }}>
                        Đặt lịch bảo dưỡng ngay
                    </a>
                </div>
            </section>

            {/* Emergency CTA */}
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "32px 30px", textAlign: "center" }}>
                <p style={{ fontSize: "1rem", marginBottom: 12 }}>Cần tư vấn thêm? Gọi trực tiếp cho chúng tôi</p>
                <a href="tel:1800588899" style={{ background: "#fff", color: "var(--elx-navy)", padding: "10px 28px", borderRadius: 4, fontWeight: 800, textDecoration: "none", fontSize: "1.1rem" }}>
                    1800 588 899
                </a>
                <p style={{ fontSize: "0.85rem", color: "#a0c0e0", marginTop: 10, margin: "10px 0 0" }}>Thứ Hai – Thứ Sáu: 8:00 – 18:00 | Thứ Bảy: 8:00 – 17:00</p>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
