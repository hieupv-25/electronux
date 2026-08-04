"use client";
import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

/* ─── Device categories ─── */
const deviceCategories = [
    { icon: "/icon-washing-machine.svg", label: "Máy giặt" },
    { icon: "/icon-dryer.svg", label: "Máy sấy" },
    { icon: "/icon-fridge.svg", label: "Tủ lạnh" },
    { icon: "/icon-hob.svg", label: "Bếp nấu" },
    { icon: "/icon-air-purifier.svg", label: "Máy lọc không khí" },
    { icon: "/icon-dishwasher.svg", label: "Máy rửa bát" },
    { icon: "/icon-oven.svg", label: "Lò nướng" },
    { icon: "/icon-hood.svg", label: "Máy hút mùi" },
];

/* ─── Quick links ─── */
const quickLinks = [
    { icon: "❓", label: "Xử lý sự cố và câu hỏi thường gặp" },
    { icon: "🛒", label: "Câu hỏi thường gặp về đơn hàng trực tuyến" },
    { icon: "📋", label: "Đăng kí bảo hành điện tử" },
    { icon: "🛡️", label: "Điều khoản và điều kiện bảo hành sản phẩm" },
    { icon: "🔧", label: "Đặt hẹn dịch vụ" },
    { icon: "♻️", label: "Điểm tiếp nhận sản phẩm thải bỏ" },
];

/* ─── FAQ data (answer as JSX node) ─── */
const faqs: { q: string; a: React.ReactNode }[] = [
    {
        q: "Làm sao để tôi đăng ký bảo hành sản phẩm mới?",
        a: (
            <span>
                Đăng ký bảo hành sản phẩm để nhận những lời khuyên hữu ích về cách sử dụng thiết bị đúng cách.
                Chỉ cần đến phần &quot;
                <a href="#" style={{ color: "var(--elx-navy)", fontWeight: 600, textDecoration: "underline" }}>
                    Đăng ký bảo hành điện tử
                </a>
                &quot; và điền đầy đủ thông tin vào biểu mẫu đăng ký.
                <br /><br />
                <em>*Chú ý: Đăng ký bảo hành sản phẩm chỉ áp dụng qua đăng ký Online</em>
            </span>
        ),
    },
    {
        q: "Tôi có thể tải Hướng dẫn sử dụng ở đâu?",
        a: (
            <span>
                Có 3 cách để bạn xem được Hướng dẫn sử dụng: bạn có thể xem tại trang sản phẩm cụ thể, hoặc tìm kiếm
                tại thanh tìm kiếm, hoặc{" "}
                <a href="#" style={{ color: "var(--elx-navy)", fontWeight: 600, textDecoration: "underline" }}>
                    nhấp vào đây
                </a>
                .
            </span>
        ),
    },
    {
        q: "Khi thiết bị của tôi không hoạt động, tôi cần xử lý như thế nào?",
        a: (
            <span>
                Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn thông qua số hotline{" "}
                <strong>1800 588899</strong> và hòm thư{" "}
                <a href="mailto:vncare@electrolux.com" style={{ color: "var(--elx-navy)", fontWeight: 600, textDecoration: "underline" }}>
                    vncare@electrolux.com
                </a>
                . Hoặc bạn có thể{" "}
                <a href="#" style={{ color: "var(--elx-navy)", fontWeight: 600, textDecoration: "underline" }}>
                    Đặt hẹn dịch vụ bảo hành của Electrolux tại đây
                </a>
                .
            </span>
        ),
    },
    {
        q: "Tôi có thể tham khảo thông tin bảo hành ở đâu?",
        a: (
            <span>
                Hãy gọi cho chúng tôi qua số <strong>1800 588899</strong> hoặc qua email{" "}
                <a href="mailto:vncare@electrolux.com" style={{ color: "var(--elx-navy)", fontWeight: 600, textDecoration: "underline" }}>
                    vncare@electrolux.com
                </a>{" "}
                — chúng tôi rất hân hạnh được phục vụ quý khách.
                <br /><br />
                Để biết thêm thông tin về bảo hành, tham khảo{" "}
                <a href="#" style={{ color: "var(--elx-navy)", fontWeight: 600, textDecoration: "underline" }}>
                    điều kiện bảo hành Electrolux tại đây
                </a>
                .
            </span>
        ),
    },
    {
        q: "Thiết bị của tôi hiển thị mã lỗi?",
        a: (
            <span>
                Hãy tham khảo thông tin trong sách hướng dẫn sử dụng về chi tiết mã lỗi hoặc liên lạc với chúng tôi
                qua số <strong>1800 5888899</strong>, chúng tôi sẽ rất hân hạnh giúp quý khách biết thông tin về lỗi
                hiện tại.
            </span>
        ),
    },
    {
        q: "Tôi muốn gọi đến số tổng đài Electrolux chính hãng",
        a: (
            <span>
                Electrolux chỉ có duy nhất 1 số tổng đài chính hãng để hỗ trợ và chăm sóc khách hàng. Bạn vui lòng
                gọi đến số hotline Electrolux{" "}
                <strong>1800 588 899</strong> (miễn phí cước gọi), phục vụ từ 8h&nbsp;–&nbsp;18h từ thứ hai đến thứ bảy.
                <br /><br />
                Hiện nay, có nhiều bên thứ ba cung cấp các số điện thoại bảo hành không chính hãng, vậy nên quý khách
                hàng lưu ý gọi đúng tổng đài Electrolux của chúng tôi để được hỗ trợ và bảo hành chính hãng tốt nhất.
            </span>
        ),
    },
];

/* ─── Support channels ─── */
const supportChannels = [
    {
        icon: (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="M8 3v4M16 3v4M2 9h20" />
                <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        title: "Mạng xã hội",
        desc: "Kết nối với chúng tôi trong hôm nay để cập nhật thông tin mới nhất",
        links: [
            { label: "FACEBOOK", href: "#" },
            { label: "ZALO", href: "#" },
            { label: "INSTAGRAM", href: "#" },
            { label: "TIKTOK", href: "#" },
        ],
    },
    {
        icon: (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 4l10 9 10-9" />
            </svg>
        ),
        title: "Email",
        desc: "Chia sẻ thắc mắc của bạn bất cứ lúc nào",
        links: [{ label: "GỬI EMAIL NGAY", href: "mailto:vncare@electrolux.com" }],
    },
    {
        icon: (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 17h.01" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 6h6M9 10h6M9 14h4" strokeLinecap="round" />
            </svg>
        ),
        title: "Gọi tổng đài Electrolux",
        desc: "Số điện thoại bảo hành và tư vấn chính hãng duy nhất của Electrolux\nThứ hai đến thứ sáu: 8:00 – 18:00\nThứ bảy: 8:00 – 17:00",
        links: [{ label: "1800 588 899", href: "tel:1800588899" }],
    },
    {
        icon: (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
        title: "Đặt lịch hẹn bảo hành",
        desc: "Yêu cầu bảo hành hoặc hỗ trợ các dịch vụ khác",
        links: [{ label: "ĐẶT HẸN NGAY", href: "#" }],
    },
    {
        icon: (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
                <rect x="13" y="13" width="5" height="5" rx="0.5" />
            </svg>
        ),
        title: "Trung tâm bảo hành Electrolux",
        desc: "Danh sách trung tâm bảo hành và chăm sóc khách hàng Electrolux toàn quốc",
        links: [{ label: "TÌM KIẾM NGAY", href: "#" }],
    },
];

/* ─── Component ─── */
export default function SupportPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [modelQuery, setModelQuery] = useState("");

    return (
        <>
            <Header navItems={navItems} />

            {/* ── Page Title ── */}
            <section style={{ textAlign: "center", padding: "48px 20px 32px", borderBottom: "1px solid var(--elx-border)" }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--elx-navy)", margin: 0 }}>
                    Hỗ trợ sản phẩm
                </h1>
            </section>

            {/* ── Model Search Banner ── */}
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "48px 20px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 40 }}>
                    {/* Left */}
                    <div>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.35, marginBottom: 20 }}>
                            Tìm kiếm hỗ trợ cho model<br />sản phẩm của bạn
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 4, overflow: "hidden", border: "1px solid #ccc" }}>
                            <input
                                type="text"
                                placeholder="Nhập vào số model. Eg ER123456"
                                value={modelQuery}
                                onChange={(e) => setModelQuery(e.target.value)}
                                style={{ flex: 1, border: "none", outline: "none", padding: "12px 16px", fontSize: "1rem", color: "#333", background: "transparent" }}
                            />
                            <button style={{ background: "none", border: "none", cursor: "pointer", padding: "0 16px", color: "#555" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                                </svg>
                            </button>
                        </div>
                        <a href="#" style={{ display: "inline-block", marginTop: 10, fontSize: "0.9rem", color: "#ccd6e8", textDecoration: "underline" }}>
                            Tôi tìm số model sản phẩm của mình bằng cách nào?
                        </a>
                    </div>
                    {/* Divider */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#a0b4cc" }}>
                        <div style={{ width: 1, height: 80, background: "#3a5a7c" }} />
                        <span style={{ fontSize: "0.9rem" }}>Hoặc</span>
                        <div style={{ width: 1, height: 80, background: "#3a5a7c" }} />
                    </div>
                    {/* Right: QR */}
                    <div>
                        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" style={{ marginBottom: 16 }}>
                            <rect x="2" y="2" width="40" height="40" rx="4" stroke="#fff" strokeWidth="4" fill="none" />
                            <rect x="14" y="14" width="16" height="16" fill="#fff" />
                            <rect x="58" y="2" width="40" height="40" rx="4" stroke="#fff" strokeWidth="4" fill="none" />
                            <rect x="70" y="14" width="16" height="16" fill="#fff" />
                            <rect x="2" y="58" width="40" height="40" rx="4" stroke="#fff" strokeWidth="4" fill="none" />
                            <rect x="14" y="70" width="16" height="16" fill="#fff" />
                            <rect x="58" y="58" width="10" height="10" fill="#fff" /><rect x="74" y="58" width="10" height="10" fill="#fff" />
                            <rect x="58" y="74" width="10" height="10" fill="#fff" /><rect x="74" y="74" width="10" height="10" fill="#fff" />
                            <rect x="90" y="74" width="10" height="10" fill="#fff" /><rect x="90" y="58" width="10" height="10" fill="#fff" />
                        </svg>
                        <p style={{ fontSize: "1rem", lineHeight: 1.5, fontWeight: 500, marginBottom: 10 }}>
                            Quét mã QR bằng điện thoại để tìm kiếm thông tin hỗ trợ
                        </p>
                        <a href="#" style={{ fontSize: "0.9rem", color: "#ccd6e8", textDecoration: "underline" }}>
                            Tôi tìm mã QR trên sản phẩm của mình bằng cách nào?
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Device Category Picker ── */}
            <section style={{ padding: "56px 20px", textAlign: "center" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 40 }}>
                        Bạn cần trợ giúp cho thiết bị nào?
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                        {deviceCategories.map((d, i) => (
                            <a
                                key={i} href="#"
                                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 16px", border: "1px solid var(--elx-border)", borderRadius: 8, color: "var(--elx-navy)", fontWeight: 600, fontSize: "1rem", textDecoration: "none", transition: "all 0.2s" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--elx-navy)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,44,91,0.12)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--elx-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                            >
                                <Image src={d.icon} alt={d.label} width={56} height={56} style={{ objectFit: "contain" }} />
                                <span>{d.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Quick Links ── */}
            <section style={{ padding: "56px 20px", background: "#f7f9fb", borderTop: "1px solid var(--elx-border)", borderBottom: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 36, textAlign: "center" }}>
                        Liên kết nhanh
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 48px" }}>
                        {quickLinks.map((link, i) => (
                            <a key={i} href="#"
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", borderBottom: "1px solid var(--elx-border)", color: "var(--elx-navy)", textDecoration: "none", fontWeight: 500, fontSize: "1rem", gap: 12 }}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <span style={{ fontSize: "1.3rem" }}>{link.icon}</span>
                                    {link.label}
                                </span>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 8l4 4-4 4M8 12h8" />
                                </svg>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section style={{ padding: "56px 20px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 36, textAlign: "center" }}>
                        Câu hỏi thường gặp về sản phẩm Electrolux
                    </h2>

                    {faqs.map((faq, i) => (
                        <div key={i} style={{ borderBottom: "1px solid var(--elx-border)" }}>
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                style={{
                                    width: "100%", background: "none", border: "none",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "20px 0", cursor: "pointer", textAlign: "left",
                                    color: "var(--elx-navy)",
                                    fontSize: openFaq === i ? "1.15rem" : "1.1rem",
                                    fontWeight: openFaq === i ? 700 : 500,
                                    gap: 16,
                                }}
                            >
                                <span>{faq.q}</span>
                                <span style={{ fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 }}>
                                    {openFaq === i ? "−" : "+"}
                                </span>
                            </button>
                            {openFaq === i && (
                                <div style={{ padding: "0 0 24px", color: "#444", fontSize: "0.97rem", lineHeight: 1.75 }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}

                    <div style={{ textAlign: "center", marginTop: 36 }}>
                        <a href="#" style={{ color: "var(--elx-navy)", fontWeight: 600, fontSize: "1rem", textDecoration: "underline" }}>
                            Xem thêm
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Chúng tôi sẵn sàng hỗ trợ bạn ── */}
            <section style={{ background: "#eef2f7", padding: "0 0 0" }}>
                {/* Header band */}
                <div style={{ textAlign: "center", padding: "40px 20px 32px" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", margin: "0 0 8px" }}>
                        Chúng tôi sẵn sàng hỗ trợ bạn
                    </h2>
                    <p style={{ fontSize: "1rem", color: "var(--elx-navy)", margin: 0 }}>Liên hệ với chúng tôi</p>
                </div>
                {/* Divider */}
                <div style={{ height: 1, background: "var(--elx-border)", maxWidth: 1100, margin: "0 auto" }} />
                {/* Cards */}
                <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0 }}>
                    {supportChannels.map((ch, i) => (
                        <div
                            key={i}
                            style={{
                                padding: "36px 28px",
                                borderRight: i < supportChannels.length - 1 ? "1px solid var(--elx-border)" : "none",
                                display: "flex", flexDirection: "column", gap: 12,
                            }}
                        >
                            <div style={{ marginBottom: 4 }}>{ch.icon}</div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--elx-navy)", margin: 0 }}>{ch.title}</h3>
                            <p style={{ fontSize: "0.88rem", color: "#4a5a72", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line", flex: 1 }}>{ch.desc}</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                                {ch.links.map((lk, j) => (
                                    <a
                                        key={j}
                                        href={lk.href}
                                        style={{
                                            display: "inline-flex", alignItems: "center", gap: 6,
                                            color: "var(--elx-navy)", fontWeight: 700, fontSize: "0.85rem",
                                            textDecoration: "none", letterSpacing: 0.3,
                                        }}
                                    >
                                        {lk.label}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" /><path d="M12 8l4 4-4 4M8 12h8" />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Floating Help Button ── */}
            <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 100 }}>
                <button style={{ background: "#fff", border: "1px solid var(--elx-border)", borderRadius: 24, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", cursor: "pointer", color: "var(--elx-navy)", fontWeight: 600, fontSize: "0.95rem" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Cần trợ giúp?
                </button>
            </div>

            {/* ── Feedback Tab ── */}
            <div style={{ position: "fixed", right: 0, top: "50%", transform: "translateY(-50%) rotate(180deg)", zIndex: 100 }}>
                <a href="#" style={{ display: "block", background: "var(--elx-navy)", color: "#fff", padding: "10px 14px", fontSize: "0.82rem", fontWeight: 600, writingMode: "vertical-rl", textDecoration: "none", letterSpacing: 1 }}>
                    Góp ý cho chúng tôi
                </a>
            </div>

            <Footer footerSections={footerSections} />
        </>
    );
}
