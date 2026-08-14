"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

const categories = [
    {
        group: "Chăm sóc trang phục",
        items: ["Máy giặt", "Máy sấy quần áo", "Bàn ủi, bàn là", "Bàn ủi hơi nước"],
    },
    {
        group: "Sản phẩm nhà bếp",
        items: ["Tủ lạnh", "Bếp nấu", "Máy hút mùi", "Lò nướng", "Máy rửa bát", "Lò vi sóng", "Nồi cơm điện"],
    },
    {
        group: "Gia dụng nhỏ",
        items: ["Bếp nướng / Máy nướng bánh mì", "Bình đun siêu tốc", "Máy xay sinh tố", "Cây nước nóng lạnh & bộ lọc"],
    },
    {
        group: "Giải pháp không khí",
        items: ["Máy lọc không khí", "Máy hút ẩm"],
    },
    {
        group: "Thiết bị phòng tắm",
        items: ["Máy nước nóng trực tiếp", "Máy nước nóng gián tiếp"],
    },
    {
        group: "Chăm sóc nhà cửa",
        items: ["Máy hút bụi"],
    },
];

const faqs = [
    {
        q: "Máy giặt không vắt được?",
        a: "Vui lòng kiểm tra xem quần áo có bị mất cân bằng tải không. Phân bổ đều quần áo trong lồng giặt, tránh giặt một món đồ nặng đơn lẻ. Nếu vấn đề vẫn còn, hãy liên hệ tổng đài 1800 588 899.",
    },
    {
        q: "Tủ lạnh không làm lạnh được?",
        a: "Kiểm tra xem phích cắm điện có chắc chắn không, cửa tủ có đóng kín không. Đảm bảo khoảng cách giữa tủ và tường ít nhất 10 cm để lưu thông không khí. Nếu cần, gọi 1800 588 899.",
    },
    {
        q: "Máy rửa bát để lại vết trên bát đĩa?",
        a: "Hãy dùng đúng loại muối bảo vệ và nước làm bóng dành cho máy rửa bát. Vệ sinh bộ lọc định kỳ. Chọn chương trình rửa phù hợp với mức độ bẩn.",
    },
    {
        q: "Lò nướng không đạt đúng nhiệt độ?",
        a: "Cần hiệu chỉnh lại nhiệt kế lò. Đảm bảo khay nướng được đặt đúng vị trí. Tham khảo hướng dẫn sử dụng kèm theo sản phẩm hoặc gọi 1800 588 899.",
    },
    {
        q: "Máy hút mùi kêu to bất thường?",
        a: "Vệ sinh bộ lọc mỡ thường xuyên. Kiểm tra xem có vật lạ trong cánh quạt không. Nếu tiếng ồn vẫn còn sau khi vệ sinh, liên hệ dịch vụ bảo hành.",
    },
];

export default function TroubleshootingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

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
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 10px" }}>Xử lý sự cố</h1>
                    <p style={{ fontSize: "1rem", color: "#ccd6e8", margin: 0 }}>
                        Tìm hướng dẫn xử lý các lỗi thường gặp cho thiết bị Electrolux của bạn
                    </p>
                </div>
            </section>

            {/* Category picker */}
            <section style={{ padding: "56px 30px", borderBottom: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 32, textAlign: "center" }}>
                        Chọn thiết bị bạn cần hỗ trợ
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28 }}>
                        {categories.map((cat, ci) => (
                            <div key={ci} style={{ border: "1px solid var(--elx-border)", borderRadius: 8, overflow: "hidden" }}>
                                <div style={{ background: "var(--elx-navy)", color: "#fff", padding: "12px 20px", fontWeight: 700, fontSize: "0.95rem" }}>
                                    {cat.group}
                                </div>
                                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                                    {cat.items.map((item, ii) => (
                                        <li key={ii}>
                                            <a href="#common-issues" style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "12px 20px", color: "var(--elx-navy)", textDecoration: "none",
                                                fontSize: "0.95rem", borderBottom: "1px solid var(--elx-border)",
                                                transition: "background 0.2s",
                                            }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f7f9fb"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                            >
                                                {item}
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="common-issues" style={{ padding: "56px 30px", scrollMarginTop: 90 }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 32, textAlign: "center" }}>
                        Lỗi thường gặp
                    </h2>
                    {faqs.map((faq, i) => (
                        <div key={i} style={{ borderBottom: "1px solid var(--elx-border)" }}>
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                style={{ width: "100%", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", cursor: "pointer", textAlign: "left", color: "var(--elx-navy)", fontSize: "1.05rem", fontWeight: openFaq === i ? 700 : 500, gap: 16 }}
                            >
                                <span>{faq.q}</span>
                                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
                            </button>
                            {openFaq === i && (
                                <div style={{ padding: "0 0 20px", color: "#444", fontSize: "0.95rem", lineHeight: 1.75 }}>{faq.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA banner */}
            <section style={{ background: "#eef2f7", padding: "48px 30px", textAlign: "center" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 12 }}>
                    Vẫn cần hỗ trợ?
                </h2>
                <p style={{ color: "#4a5a72", marginBottom: 24 }}>
                    Đội ngũ chăm sóc khách hàng Electrolux luôn sẵn sàng giúp đỡ bạn
                </p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="tel:1800588899" style={{ background: "var(--elx-navy)", color: "#fff", padding: "12px 28px", borderRadius: 4, fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>
                        Gọi 1800 588 899
                    </a>
                    <a href="/support/warranty-appointment" style={{ border: "2px solid var(--elx-navy)", color: "var(--elx-navy)", padding: "12px 28px", borderRadius: 4, fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>
                        Đặt hẹn kỹ thuật viên
                    </a>
                </div>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
