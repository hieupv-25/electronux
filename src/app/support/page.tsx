"use client";
import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useMemo, type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { footerSections, navItems } from "@/data/siteData";

function QuickIcon({ type }: { type: "tool" | "bag" | "doc" | "shield" | "calendar" | "recycle" }) {
    const paths: Record<string, ReactNode> = {
        tool: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.8-3.8a6 6 0 01-8 8l-6.9 6.9a2.1 2.1 0 01-3-3l6.9-6.9a6 6 0 018-8z" />,
        bag: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 01-8 0" /></>,
        doc: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M12 12v6M9 15h6" /></>,
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
        calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" /></>,
        recycle: <><path d="M7.5 7.5L12 2l4.5 5.5M16.5 7.5L21 16h-5M16 16l-4 6-4-6M8 16H3l4.5-8.5" /></>,
    };
    return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

const quickLinks = [
    { type: "tool" as const, label: "Xử lý sự cố và câu hỏi thường gặp", href: "/support/troubleshooting" },
    { type: "bag" as const, label: "Câu hỏi về đơn hàng trực tuyến", href: "/support/online-order-faq" },
    { type: "doc" as const, label: "Đăng ký bảo hành điện tử", href: "/support/product-registration" },
    { type: "shield" as const, label: "Điều khoản và điều kiện bảo hành", href: "/support/warranty-policy" },
    { type: "calendar" as const, label: "Đặt lịch hẹn bảo hành", href: "/support/warranty-appointment" },
    { type: "recycle" as const, label: "Điểm tiếp nhận sản phẩm thải bỏ", href: "/support/recycling-points" },
];

/* ─── FAQ data ─── */
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

const channels = [
    { title: "Mạng xã hội", desc: "Kết nối với chúng tôi để cập nhật thông tin mới nhất", links: [["FACEBOOK", "https://www.facebook.com/electroluxvietnam/"], ["ZALO", "https://zalo.me/3940082846017430673"], ["INSTAGRAM", "https://www.instagram.com/electroluxvn/"], ["TIKTOK", "https://www.tiktok.com/@electrolux.vietnam"]] },
    { title: "Email", desc: "Chia sẻ thắc mắc của bạn bất cứ lúc nào", links: [["GỬI EMAIL NGAY", "mailto:vncare@electrolux.com"]] },
    { title: "Gọi tổng đài Electrolux", desc: "Số điện thoại bảo hành và tư vấn chính hãng\nThứ hai đến thứ sáu: 8:00 – 18:00\nThứ bảy: 8:00 – 17:00", links: [["1800 588 899", "tel:1800588899"]] },
    { title: "Đặt lịch hẹn bảo hành", desc: "Yêu cầu bảo hành và hỗ trợ kỹ thuật cho thiết bị", links: [["ĐẶT HẸN NGAY", "/support/warranty-appointment"]] },
    { title: "Dịch vụ Electrolux", desc: "Bảo dưỡng, sửa chữa giá cố định và gia hạn bảo hành", links: [["XEM DỊCH VỤ", "/services"]] },
];

/* ─── Main Support Page Component ─── */
export default function SupportPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [modelQuery, setModelQuery] = useState("");

    // Build real products list from DB
    const supportProductsData = useMemo(() => buildSupportProducts(), []);

    // Navigation & View States: 'categories' | 'products' | 'product_detail' | 'register' | 'registered_success'
    const [viewState, setViewState] = useState<"categories" | "products" | "product_detail" | "register" | "registered_success">("categories");
    const [selectedCategory, setSelectedCategory] = useState<string>("Bình nước nóng trực tiếp");
    const [selectedProduct, setSelectedProduct] = useState<SupportProduct | null>(supportProductsData[1] || supportProductsData[0]);

    // Registration Form State
    const [formData, setFormData] = useState({
        email: "",
        customerType: "ca-nhan", // "ca-nhan" | "doanh-nghiep"
        salutation: "Ông",
        firstName: "",
        lastName: "",
        dob: "",
        phone: "",
        serialNumber: "",
        purchaseDate: "",
        invoiceFile: null as File | null,
        optCall: false,
        optSms: false,
        optEmail: false,
        optPromotions: false,
        optPrivacyPolicy: false,
        optWarrantyTerms: false,
        recaptchaChecked: false,
    });
    const [registrationId, setRegistrationId] = useState("");
    const [formError, setFormError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter products based on active category or search query
    const getFilteredProducts = () => {
        if (modelQuery.trim() !== "") {
            const q = modelQuery.trim().toLowerCase();
            return supportProductsData.filter(
                (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
            );
        }
        return supportProductsData.filter((p) => p.category === selectedCategory);
    };

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (modelQuery.trim() !== "") {
            const matches = getFilteredProducts();
            if (matches.length === 1) {
                setSelectedProduct(matches[0]);
                setViewState("product_detail");
            } else {
                setViewState("products");
            }
        }
    };

    const handleSelectCategory = (catLabel: string) => {
        setSelectedCategory(catLabel);
        setModelQuery("");
        setViewState("products");
        window.scrollTo({ top: 400, behavior: "smooth" });
    };

    const handleSelectProduct = (product: SupportProduct) => {
        setSelectedProduct(product);
        setViewState("product_detail");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleResetForm = () => {
        setFormData({
            email: "",
            customerType: "ca-nhan",
            salutation: "Ông",
            firstName: "",
            lastName: "",
            dob: "",
            phone: "",
            serialNumber: "",
            purchaseDate: "",
            invoiceFile: null,
            optCall: false,
            optSms: false,
            optEmail: false,
            optPromotions: false,
            optPrivacyPolicy: false,
            optWarrantyTerms: false,
            recaptchaChecked: false,
        });
        setFormError("");
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        if (!formData.email) {
            setFormError("Vui lòng nhập Email của bạn");
            return;
        }
        if (!formData.firstName || !formData.lastName) {
            setFormError("Vui lòng nhập Tên và Họ của bạn");
            return;
        }
        if (!formData.phone) {
            setFormError("Vui lòng nhập Số điện thoại di động");
            return;
        }
        if (!formData.purchaseDate) {
            setFormError("Vui lòng chọn Ngày mua hàng");
            return;
        }
        if (!formData.optPrivacyPolicy) {
            setFormError("Vui lòng đồng ý với Chính Sách Bảo Mật");
            return;
        }
        if (!formData.optWarrantyTerms) {
            setFormError("Vui lòng đồng ý với Điều khoản và điều kiện bảo hành");
            return;
        }
        if (!formData.recaptchaChecked) {
            setFormError("Vui lòng xác nhận bạn không phải là người máy (reCAPTCHA)");
            return;
        }

        const generatedId = "REG-" + Math.floor(10000000 + Math.random() * 90000000);
        setRegistrationId(generatedId);

        // Save registered product to localStorage so it appears in Account -> Registered Products page
        if (typeof window !== "undefined" && selectedProduct) {
            const newRegistration = {
                id: generatedId,
                registrationId: generatedId,
                productName: selectedProduct.name,
                sku: selectedProduct.sku,
                pnc: selectedProduct.pnc,
                img: selectedProduct.img,
                category: selectedCategory,
                serialNumber: formData.serialNumber || "ELX" + Math.floor(100000 + Math.random() * 900000),
                purchaseDate: formData.purchaseDate,
                registeredAt: new Date().toISOString(),
                status: "Đang bảo hành",
                warrantyMonths: 24,
                customerName: `${formData.salutation} ${formData.lastName} ${formData.firstName}`,
                customerEmail: formData.email,
                customerPhone: formData.phone,
            };

            try {
                const existingRaw = localStorage.getItem("electrolux_registered_products");
                const existingList = existingRaw ? JSON.parse(existingRaw) : [];
                const updatedList = [newRegistration, ...existingList];
                localStorage.setItem("electrolux_registered_products", JSON.stringify(updatedList));
            } catch (err) {
                console.error("Lỗi khi lưu sản phẩm đã đăng ký vào localStorage:", err);
            }
        }

        setViewState("registered_success");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const filteredProducts = getFilteredProducts();

    return (
        <>
            <Header navItems={navItems} />

            {/* ── Page Title ── */}
            <section style={{ textAlign: "center", padding: "40px 20px 24px", borderBottom: "1px solid var(--elx-border)" }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--elx-navy)", margin: 0 }}>
                    Hỗ trợ sản phẩm
                </h1>
            </section>

            {/* ── Model Search Banner (Always visible or customizable) ── */}
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "44px 20px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 40 }}>
                    {/* Left */}
                    <div>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.35, marginBottom: 20 }}>
                            Tìm kiếm hỗ trợ cho model<br />sản phẩm của bạn
                        </h2>
                        <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 4, overflow: "hidden", border: "1px solid #ccc" }}>
                            <input
                                type="text"
                                placeholder="Nhập vào số model. Eg ER123456"
                                value={modelQuery}
                                onChange={(e) => setModelQuery(e.target.value)}
                                style={{ flex: 1, border: "none", outline: "none", padding: "12px 16px", fontSize: "1rem", color: "#333", background: "transparent" }}
                            />
                            <button type="submit" style={{ background: "none", border: "none", cursor: "pointer", padding: "0 16px", color: "#555" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                                </svg>
                            </button>
                        </form>
                        <a href="#" style={{ display: "inline-block", marginTop: 10, fontSize: "0.9rem", color: "#ccd6e8", textDecoration: "underline" }}>
                            Tôi tìm số model sản phẩm của mình bằng cách nào?
                        </a>
                    </div>
                    {/* Divider */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#a0b4cc" }}>
                        <div style={{ width: 1, height: 70, background: "#3a5a7c" }} />
                        <span style={{ fontSize: "0.9rem" }}>Hoặc</span>
                        <div style={{ width: 1, height: 70, background: "#3a5a7c" }} />
                    </div>
                    {/* Right: QR */}
                    <div>
                        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" style={{ marginBottom: 12 }}>
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
                        <p style={{ fontSize: "0.98rem", lineHeight: 1.5, fontWeight: 500, marginBottom: 8 }}>
                            Quét mã QR bằng điện thoại để tìm kiếm thông tin hỗ trợ
                        </p>
                        <a href="#" style={{ fontSize: "0.88rem", color: "#ccd6e8", textDecoration: "underline" }}>
                            Tôi tìm mã QR trên sản phẩm của mình bằng cách nào?
                        </a>
                    </div>
                </div>
            </section>


            {/* ── STEP 1: CATEGORY SELECTION (HÌNH 1) ── */}
            {viewState === "categories" && (
                <section style={{ padding: "56px 20px", textAlign: "center" }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 40 }}>
                            Bạn cần trợ giúp cho thiết bị nào?
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                            {deviceCategories.map((d, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectCategory(d.label)}
                                    style={{
                                        display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 16px",
                                        border: "1px solid var(--elx-border)", borderRadius: 8, background: "#fff",
                                        color: "var(--elx-navy)", fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--elx-navy)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,44,91,0.12)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--elx-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                                >
                                    <Image src={d.icon} alt={d.label} width={56} height={56} style={{ objectFit: "contain" }} />
                                    <span>{d.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}


            {/* ── STEP 2: PRODUCTS LIST FOR SELECTED CATEGORY (HÌNH 2) ── */}
            {viewState === "products" && (
                <section style={{ padding: "48px 20px", background: "#fff" }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", textAlign: "center", marginBottom: 28 }}>
                            Bạn cần trợ giúp cho thiết bị nào?
                        </h2>

                        {/* Back button & Selected Category badge */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 40 }}>
                            <button
                                onClick={() => { setViewState("categories"); setModelQuery(""); }}
                                style={{ background: "none", border: "none", color: "var(--elx-navy)", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                            >
                                ↩ Quay lại
                            </button>
                            <div style={{ background: "var(--elx-navy)", color: "#fff", padding: "8px 20px", borderRadius: 4, fontWeight: 700, fontSize: "0.95rem" }}>
                                {modelQuery ? `Kết quả tìm kiếm: "${modelQuery}"` : selectedCategory}
                            </div>
                        </div>

                        {/* Product Grid */}
                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
                                Không tìm thấy sản phẩm phù hợp. Vui lòng thử tìm kiếm lại.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "24px 16px" }}>
                                {filteredProducts.map((prod) => (
                                    <div
                                        key={prod.id}
                                        onClick={() => handleSelectProduct(prod)}
                                        style={{
                                            border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px 12px", background: "#fff",
                                            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                                            cursor: "pointer", transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--elx-navy)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,44,91,0.1)"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                                    >
                                        <div style={{ width: "100%", height: 110, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                                            <Image src={prod.img} alt={prod.name} width={70} height={70} style={{ objectFit: "contain" }} />
                                        </div>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 4 }}>
                                            {prod.sku}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", color: "#334155", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {prod.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}


            {/* ── STEP 3: PRODUCT SUPPORT DETAILS CARD (HÌNH 3) ── */}
            {viewState === "product_detail" && selectedProduct && (
                <section style={{ padding: "60px 20px", background: "#fff", minHeight: 420 }}>
                    <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "320px 1fr", gap: 48, alignItems: "center" }}>
                        {/* Left image */}
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
                            <Image src={selectedProduct.img} alt={selectedProduct.name} width={240} height={240} style={{ objectFit: "contain" }} />
                        </div>
                        {/* Right Details */}
                        <div>
                            <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: "var(--elx-navy)", marginTop: 0, marginBottom: 24, lineHeight: 1.3 }}>
                                Hỗ trợ: {selectedProduct.name}
                            </h2>
                            <p style={{ fontSize: "1.05rem", color: "var(--elx-navy)", fontWeight: 500, margin: "0 0 10px" }}>
                                <strong>Mã sản phẩm:</strong> {selectedProduct.sku}
                            </p>
                            <p style={{ fontSize: "1.05rem", color: "var(--elx-navy)", fontWeight: 500, margin: "0 0 32px" }}>
                                PNC: {selectedProduct.pnc}
                            </p>
                            <button
                                onClick={() => setViewState("register")}
                                style={{
                                    background: "var(--elx-navy)", color: "#fff", border: "none",
                                    padding: "14px 36px", fontSize: "1rem", fontWeight: 700,
                                    letterSpacing: "0.5px", cursor: "pointer", borderRadius: 2,
                                    boxShadow: "0 2px 8px rgba(0,44,91,0.2)"
                                }}
                            >
                                ĐĂNG KÝ SẢN PHẨM
                            </button>
                        </div>
                    </div>
                </section>
            )}


            {/* ── STEP 4: PRODUCT WARRANTY REGISTRATION FORM (HÌNH 4 & HÌNH 5) ── */}
            {viewState === "register" && selectedProduct && (
                <section style={{ padding: "48px 20px", background: "#fff" }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: 48 }}>

                        {/* Left Column: Product Summary */}
                        <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: 24 }}>
                            <button
                                onClick={() => setViewState("product_detail")}
                                style={{ background: "none", border: "none", color: "var(--elx-navy)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 28 }}
                            >
                                ↩ Quay lại
                            </button>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                                <Image src={selectedProduct.img} alt={selectedProduct.name} width={180} height={180} style={{ objectFit: "contain" }} />
                            </div>
                            <p style={{ fontSize: "0.95rem", color: "var(--elx-navy)", margin: "0 0 8px", fontWeight: 600 }}>
                                Mã model: <strong>{selectedProduct.sku}</strong>
                            </p>
                            <p style={{ fontSize: "0.95rem", color: "var(--elx-navy)", margin: 0, fontWeight: 600 }}>
                                Số PNC: <strong>{selectedProduct.pnc}</strong>
                            </p>
                        </div>

                        {/* Right Column: Form */}
                        <div>
                            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                                {/* Form Error Banner if any */}
                                {formError && (
                                    <div style={{ background: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: "12px 16px", borderRadius: 4, fontSize: "0.92rem", fontWeight: 600 }}>
                                        {formError}
                                    </div>
                                )}

                                {/* Section 1: Thông tin của bạn */}
                                <div>
                                    <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--elx-navy)", margin: "0 0 24px" }}>
                                        Thông tin của bạn
                                    </h2>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                                Email*
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.95rem", outline: "none" }}
                                            />
                                        </div>

                                        {/* Radio buttons */}
                                        <div style={{ display: "flex", gap: 32, margin: "4px 0" }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", color: "#334155", cursor: "pointer" }}>
                                                <input
                                                    type="radio"
                                                    name="custType"
                                                    checked={formData.customerType === "ca-nhan"}
                                                    onChange={() => setFormData({ ...formData, customerType: "ca-nhan" })}
                                                />
                                                Cá nhân
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", color: "#334155", cursor: "pointer" }}>
                                                <input
                                                    type="radio"
                                                    name="custType"
                                                    checked={formData.customerType === "doanh-nghiep"}
                                                    onChange={() => setFormData({ ...formData, customerType: "doanh-nghiep" })}
                                                />
                                                Doanh nghiệp
                                            </label>
                                        </div>

                                        {/* Danh xưng */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                                Danh xưng*
                                            </label>
                                            <select
                                                value={formData.salutation}
                                                onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                                                style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.95rem", outline: "none", background: "#fff" }}
                                            >
                                                <option value="Ông">Ông</option>
                                                <option value="Bà">Bà</option>
                                                <option value="Cô">Cô</option>
                                                <option value="Anh">Anh</option>
                                                <option value="Chị">Chị</option>
                                            </select>
                                        </div>

                                        {/* Tên & Họ */}
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                                    Tên*
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Tên"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.95rem", outline: "none" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                                    Họ*
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Họ"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.95rem", outline: "none" }}
                                                />
                                            </div>
                                        </div>

                                        {/* Ngày sinh */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                                Ngày sinh (không bắt buộc)
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.95rem", outline: "none" }}
                                            />
                                        </div>

                                        {/* Số điện thoại di động */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                                Số điện thoại di động*
                                            </label>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #cbd5e1", borderRadius: 4, padding: "0 12px", background: "#f8fafc", fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                                                    <span>🇻🇳</span> VN
                                                </div>
                                                <input
                                                    type="tel"
                                                    placeholder="+84 | Số điện thoại"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    style={{ flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.95rem", outline: "none" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: 1, background: "#e2e8f0" }} />

                                {/* Section 2: Thông tin mua hàng */}
                                <div>
                                    <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--elx-navy)", margin: "0 0 24px" }}>
                                        Thông tin mua hàng
                                    </h2>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                                Số serial (không bắt buộc)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Số serial"
                                                value={formData.serialNumber}
                                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                                style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.95rem", outline: "none" }}
                                            />
                                            <a href="#" style={{ display: "inline-block", marginTop: 6, fontSize: "0.85rem", color: "var(--elx-navy)", textDecoration: "underline", fontWeight: 600 }}>
                                                Làm thế nào để tìm số serial?
                                            </a>
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                                Ngày mua hàng*
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.purchaseDate}
                                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                                style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: "0.95rem", outline: "none" }}
                                            />
                                        </div>

                                        <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                                            *Lưu ý: Electrolux sẽ không xuất chứng nhận bảo hành trong quy trình này. Vui lòng giữ lại hóa đơn mua hàng trực tuyến để làm bằng chứng bảo hành trong tương lai.
                                        </p>

                                        {/* Upload file */}
                                        <div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: "none" }}
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setFormData({ ...formData, invoiceFile: e.target.files[0] });
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    background: "#fff", border: "1px solid var(--elx-navy)", color: "var(--elx-navy)",
                                                    padding: "10px 20px", fontWeight: 700, fontSize: "0.9rem", borderRadius: 4, cursor: "pointer"
                                                }}
                                            >
                                                + {formData.invoiceFile ? formData.invoiceFile.name : "TẢI TẬP TIN LÊN"}
                                            </button>
                                            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 8, lineHeight: 1.4 }}>
                                                Ảnh chụp hóa đơn phải có đầy đủ ngày mua hàng, tên cửa hàng, số model, giá. Chỉ hỗ trợ PDF, png hoặc jpg có dung lượng dưới 5MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: 1, background: "#e2e8f0" }} />

                                {/* Section 3: Đồng ý nhận nội dung tiếp thị */}
                                <div>
                                    <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--elx-navy)", margin: "0 0 16px" }}>
                                        Đồng ý nhận nội dung tiếp thị
                                    </h2>
                                    <p style={{ fontSize: "0.9rem", color: "#334155", marginBottom: 16 }}>
                                        Tôi muốn nhận thông tin tiếp thị thông qua các phương thức liên lạc dưới đây vào số điện thoại và/hoặc địa chỉ email của tôi:
                                    </p>

                                    <div style={{ display: "flex", gap: 32, marginBottom: 20 }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "#334155", cursor: "pointer" }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.optCall}
                                                onChange={(e) => setFormData({ ...formData, optCall: e.target.checked })}
                                            />
                                            Gọi điện thoại
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "#334155", cursor: "pointer" }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.optSms}
                                                onChange={(e) => setFormData({ ...formData, optSms: e.target.checked })}
                                            />
                                            Tin nhắn SMS
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "#334155", cursor: "pointer" }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.optEmail}
                                                onChange={(e) => setFormData({ ...formData, optEmail: e.target.checked })}
                                            />
                                            Email
                                        </label>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.88rem", color: "#334155", cursor: "pointer", lineHeight: 1.5 }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.optPromotions}
                                                onChange={(e) => setFormData({ ...formData, optPromotions: e.target.checked })}
                                                style={{ marginTop: 3 }}
                                            />
                                            Cập nhật cho tôi về tin tức và các ưu đãi độc quyền
                                        </label>

                                        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.88rem", color: "#334155", cursor: "pointer", lineHeight: 1.5 }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.optPrivacyPolicy}
                                                onChange={(e) => setFormData({ ...formData, optPrivacyPolicy: e.target.checked })}
                                                style={{ marginTop: 3 }}
                                            />
                                            <span>
                                                Tôi xác nhận rằng tôi đã đọc, hiểu và đồng ý với toàn bộ{" "}
                                                <a href="#" style={{ color: "var(--elx-navy)", fontWeight: 700, textDecoration: "underline" }}>
                                                    Chính Sách Bảo Mật
                                                </a>{" "}
                                                bao gồm cả cách thức dữ liệu cá nhân của tôi có thể được thu thập, sử dụng và tiết lộ bởi Công Ty TNHH Electrolux Việt Nam và các công ty có liên quan của Công Ty TNHH Electrolux Việt Nam theo quy định tại Chính Sách Bảo Mật.*
                                            </span>
                                        </label>

                                        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.88rem", color: "#334155", cursor: "pointer", lineHeight: 1.5 }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.optWarrantyTerms}
                                                onChange={(e) => setFormData({ ...formData, optWarrantyTerms: e.target.checked })}
                                                style={{ marginTop: 3 }}
                                            />
                                            <span>
                                                Tôi đồng ý về{" "}
                                                <a href="#" style={{ color: "var(--elx-navy)", fontWeight: 700, textDecoration: "underline" }}>
                                                    Điều khoản và điều kiện bảo hành*
                                                </a>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* reCAPTCHA Widget Simulation */}
                                <div style={{ background: "#f9f9f9", border: "1px solid #d3d3d3", borderRadius: 4, padding: "12px 16px", display: "inline-flex", alignItems: "center", justifyContent: "space-between", width: 300 }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontSize: "0.9rem", color: "#222" }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.recaptchaChecked}
                                            onChange={(e) => setFormData({ ...formData, recaptchaChecked: e.target.checked })}
                                            style={{ width: 24, height: 24 }}
                                        />
                                        <span>Tôi không phải là người máy</span>
                                    </label>
                                    <div style={{ textAlign: "center" }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2">
                                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                                        </svg>
                                        <span style={{ display: "block", fontSize: "0.6rem", color: "#666" }}>reCAPTCHA</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={handleResetForm}
                                        style={{
                                            flex: 1, padding: "14px 24px", background: "#fff", border: "1px solid var(--elx-navy)",
                                            color: "var(--elx-navy)", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.5px", cursor: "pointer"
                                        }}
                                    >
                                        NHẬP LẠI
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1, padding: "14px 24px", background: "var(--elx-navy)", border: "none",
                                            color: "#fff", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.5px", cursor: "pointer"
                                        }}
                                    >
                                        ĐĂNG KÝ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            )}


            {/* ── STEP 5: REGISTRATION SUCCESS SCREEN ── */}
            {viewState === "registered_success" && (
                <section style={{ padding: "64px 20px", background: "#fff", textAlign: "center" }}>
                    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                        <div style={{ width: 72, height: 72, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", margin: "0 0 12px" }}>
                            Đăng ký bảo hành thành công!
                        </h2>
                        <p style={{ fontSize: "1rem", color: "#475569", marginBottom: 24 }}>
                            Cảm ơn quý khách <strong>{formData.salutation} {formData.lastName} {formData.firstName}</strong> đã đăng ký bảo hành cho sản phẩm <strong>{selectedProduct?.name} ({selectedProduct?.sku})</strong>.
                        </p>

                        <div style={{ background: "#f8fafc", border: "1px border var(--elx-navy)", borderRadius: 6, padding: "16px 24px", marginBottom: 28 }}>
                            <span style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Mã đăng ký bảo hành của bạn</span>
                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--elx-navy)", letterSpacing: 2, marginTop: 4 }}>
                                {registrationId}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                            <button
                                onClick={() => setViewState("categories")}
                                style={{ padding: "12px 24px", background: "none", border: "2px solid var(--elx-navy)", color: "var(--elx-navy)", fontWeight: 700, borderRadius: 4, cursor: "pointer" }}
                            >
                                Về trang Hỗ trợ
                            </button>
                            <button
                                onClick={() => setViewState("register")}
                                style={{ padding: "12px 24px", background: "var(--elx-navy)", border: "none", color: "#fff", fontWeight: 700, borderRadius: 4, cursor: "pointer" }}
                            >
                                Đăng ký sản phẩm khác
                            </button>
                        </div>
                    </div>
                </section>
            )}


            {/* ── Quick Links ── */}
            <section style={{ padding: "56px 20px", background: "#f7f9fb", borderTop: "1px solid var(--elx-border)", borderBottom: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 36, textAlign: "center" }}>
                        Liên kết nhanh
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 48px" }}>
                        {quickLinks.map((link, i) => (
                            <a key={i} href={link.href}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", borderBottom: "1px solid var(--elx-border)", color: "var(--elx-navy)", textDecoration: "none", fontWeight: 500, fontSize: "1rem", gap: 12 }}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <QuickIcon type={link.type} />
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
                </div>
            </section>

            {/* ── Chúng tôi sẵn sàng hỗ trợ bạn ── */}
            <section style={{ background: "#eef2f7", padding: "0 30px" }}>
                {/* Header band */}
                <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--elx-navy)", margin: "0 0 8px" }}>
                        Chúng tôi sẵn sàng hỗ trợ bạn
                    </h2>
                    <p style={{ fontSize: "1rem", color: "var(--elx-navy)", margin: 0 }}>Liên hệ với chúng tôi</p>
                </div>
                {/* Divider */}
                <div style={{ height: 1, background: "var(--elx-border)" }} />
                {/* Cards row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0 }}>
                    {channels.map((ch, i) => (
                        <div
                            key={i}
                            style={{
                                background: "#fff",
                                padding: "36px 24px",
                                borderRight: i < channels.length - 1 ? "1px solid var(--elx-border)" : "none",
                                borderTop: "1px solid var(--elx-border)",
                                borderBottom: "1px solid var(--elx-border)",
                                borderLeft: i === 0 ? "1px solid var(--elx-border)" : "none",
                                display: "flex", flexDirection: "column", gap: 12,
                            }}
                        >
                            <div style={{ marginBottom: 4 }}>{i === 0 ? "◎" : i === 1 ? "✉" : i === 2 ? "☎" : i === 3 ? "⌖" : "▦"}</div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--elx-navy)", margin: 0 }}>{ch.title}</h3>
                            <p style={{ fontSize: "1.03rem", color: "#4a5a72", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line", flex: 1 }}>{ch.desc}</p>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: ch.links.length > 2 ? "1fr 1fr" : "1fr",
                                gap: "8px 12px",
                                marginTop: 4
                            }}>
                                {ch.links.map((lk, j) => (
                                    <a
                                        key={j}
                                        href={lk[1]}
                                        style={{
                                            display: "inline-flex", alignItems: "center", gap: 6,
                                            color: "var(--elx-navy)", fontWeight: 700, fontSize: "0.85rem",
                                            textDecoration: "none", letterSpacing: 0.3,
                                        }}
                                    >
                                        {lk[0]}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" /><path d="M12 8l4 4-4 4M8 12h8" />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {/* bottom spacing */}
                <div style={{ height: 40 }} />
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

            <Footer footerSections={footerSections} />
        </>
    );
}

