"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

const steps = [
    { num: "01", title: "Điền thông tin", desc: "Cung cấp thông tin sản phẩm và thông tin liên hệ của bạn" },
    { num: "02", title: "Xác nhận lịch hẹn", desc: "Tổng đài viên sẽ liên hệ để xác nhận thời gian phù hợp" },
    { num: "03", title: "Kỹ thuật viên đến nhà", desc: "Đội ngũ kỹ thuật viên chuyên nghiệp sẽ đến đúng hẹn" },
    { num: "04", title: "Hoàn tất bảo hành", desc: "Sản phẩm được sửa chữa và bàn giao lại cho bạn" },
];



export default function BookServicePage() {
    const [form, setForm] = useState({
        name: "", phone: "", email: "", address: "", city: "",
        model: "", serial: "", issue: "", preferDate: "", preferTime: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "11px 14px", border: "1px solid var(--elx-border)", borderRadius: 4,
        fontSize: "0.95rem", outline: "none", color: "var(--elx-navy)", fontFamily: "inherit",
        boxSizing: "border-box",
    };
    const labelStyle: React.CSSProperties = {
        display: "block", marginBottom: 6, fontWeight: 600, color: "var(--elx-navy)", fontSize: "0.88rem",
    };

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
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 10px" }}>Đặt lịch hẹn bảo hành trực tuyến</h1>
                    <p style={{ fontSize: "1rem", color: "#ccd6e8", margin: 0 }}>
                        Đặt hẹn nhanh chóng — kỹ thuật viên Electrolux sẽ đến tận nơi hỗ trợ bạn
                    </p>
                </div>
            </section>



            {/* Process steps */}
            <section style={{ padding: "48px 30px", borderBottom: "1px solid var(--elx-border)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <h2 style={{ textAlign: "center", fontSize: "1.3rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 36 }}>
                        Quy trình xử lý yêu cầu đặt lịch
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
                        {steps.map((s, i) => (
                            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
                                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--elx-navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800 }}>
                                    {s.num}
                                </div>
                                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--elx-navy)", margin: 0 }}>{s.title}</h3>
                                <p style={{ fontSize: "0.87rem", color: "#4a5a72", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking form */}
            <section style={{ padding: "56px 30px" }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    {submitted ? (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 12 }}>
                                Đặt hẹn thành công!
                            </h2>
                            <p style={{ color: "#4a5a72", fontSize: "1rem", lineHeight: 1.7, marginBottom: 24 }}>
                                Chúng tôi đã nhận được yêu cầu của bạn. Tổng đài viên sẽ liên hệ để xác nhận lịch hẹn trong vòng 24 giờ làm việc.
                            </p>
                            <a href="/support" style={{ background: "var(--elx-navy)", color: "#fff", padding: "12px 28px", borderRadius: 4, fontWeight: 700, textDecoration: "none" }}>
                                Quay lại trang hỗ trợ
                            </a>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 32, textAlign: "center" }}>
                                Điền thông tin đặt hẹn
                            </h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                {/* Personal Info */}
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 16, borderBottom: "1px solid var(--elx-border)", paddingBottom: 8 }}>
                                        Thông tin liên hệ
                                    </h3>
                                </div>
                                <div>
                                    <label style={labelStyle}>Họ và tên *</label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Số điện thoại *</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="0912 345 678" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Tỉnh / Thành phố *</label>
                                    <select name="city" value={form.city} onChange={handleChange} style={inputStyle}>
                                        <option value="">-- Chọn tỉnh thành --</option>
                                        <option>Hà Nội</option>
                                        <option>TP. Hồ Chí Minh</option>
                                        <option>Đà Nẵng</option>
                                        <option>Hải Phòng</option>
                                        <option>Cần Thơ</option>
                                        <option>Tỉnh/thành khác</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={labelStyle}>Địa chỉ cụ thể *</label>
                                    <input name="address" value={form.address} onChange={handleChange} placeholder="Số nhà, tên đường, phường/xã..." style={inputStyle} />
                                </div>

                                {/* Product Info */}
                                <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
                                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 16, borderBottom: "1px solid var(--elx-border)", paddingBottom: 8 }}>
                                        Thông tin sản phẩm
                                    </h3>
                                </div>
                                <div>
                                    <label style={labelStyle}>Số Model *</label>
                                    <input name="model" value={form.model} onChange={handleChange} placeholder="VD: EWF8024BDWA" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Số Serial</label>
                                    <input name="serial" value={form.serial} onChange={handleChange} placeholder="Tìm trên tem sản phẩm" style={inputStyle} />
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={labelStyle}>Mô tả sự cố *</label>
                                    <textarea
                                        name="issue" value={form.issue}
                                        onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
                                        placeholder="Mô tả chi tiết vấn đề bạn gặp phải với sản phẩm..."
                                        rows={4}
                                        style={{ ...inputStyle, resize: "vertical" }}
                                    />
                                </div>

                                {/* Preferred time */}
                                <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
                                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 16, borderBottom: "1px solid var(--elx-border)", paddingBottom: 8 }}>
                                        Thời gian mong muốn
                                    </h3>
                                </div>
                                <div>
                                    <label style={labelStyle}>Ngày mong muốn</label>
                                    <input type="date" name="preferDate" value={form.preferDate} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Khung giờ</label>
                                    <select name="preferTime" value={form.preferTime} onChange={handleChange} style={inputStyle}>
                                        <option value="">-- Chọn khung giờ --</option>
                                        <option>8:00 – 10:00</option>
                                        <option>10:00 – 12:00</option>
                                        <option>13:00 – 15:00</option>
                                        <option>15:00 – 17:00</option>
                                    </select>
                                </div>

                                <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                                    <p style={{ fontSize: "0.85rem", color: "#4a5a72", marginBottom: 16 }}>
                                        * Electrolux có thể cung cấp thông tin khách hàng cho đối tác ủy quyền nhằm mục đích sửa chữa bảo hành.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(true)}
                                        style={{ width: "100%", background: "var(--elx-navy)", color: "#fff", border: "none", padding: "14px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
                                    >
                                        Đặt lịch hẹn ngay
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Emergency CTA */}
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "32px 30px", textAlign: "center" }}>
                <p style={{ fontSize: "1rem", marginBottom: 12 }}>Cần hỗ trợ khẩn cấp? Gọi trực tiếp cho chúng tôi</p>
                <a href="tel:1800588899" style={{ background: "#fff", color: "var(--elx-navy)", padding: "10px 28px", borderRadius: 4, fontWeight: 800, textDecoration: "none", fontSize: "1.1rem" }}>
                    1800 588 899
                </a>
                <p style={{ fontSize: "0.85rem", color: "#a0c0e0", marginTop: 10, margin: "10px 0 0" }}>Thứ Hai – Thứ Sáu: 8:00 – 18:00 | Thứ Bảy: 8:00 – 17:00</p>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
