"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

const steps = ["Thông tin sản phẩm", "Thông tin cá nhân", "Xác nhận"];



export default function WarrantyRegistrationPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        model: "", serial: "", purchaseDate: "", retailer: "",
        name: "", phone: "", email: "", city: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 16px", border: "1px solid var(--elx-border)", borderRadius: 4,
        fontSize: "0.95rem", outline: "none", color: "var(--elx-navy)", fontFamily: "inherit",
    };
    const labelStyle: React.CSSProperties = { display: "block", marginBottom: 6, fontWeight: 600, color: "var(--elx-navy)", fontSize: "0.9rem" };

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
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 10px" }}>Đăng ký bảo hành điện tử</h1>
                    <p style={{ fontSize: "1rem", color: "#ccd6e8", margin: 0 }}>
                        Đăng ký ngay để được hưởng đầy đủ quyền lợi bảo hành chính hãng từ Electrolux
                    </p>
                </div>
            </section>


            <section style={{ padding: "56px 30px" }}>
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                    {/* Step indicator */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 48 }}>
                        {steps.map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "default" }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                        background: i <= step ? "var(--elx-navy)" : "#e0e6ed", color: i <= step ? "#fff" : "#7a8a9c",
                                        fontWeight: 700, fontSize: "0.9rem",
                                    }}>{i + 1}</div>
                                    <span style={{ fontSize: "0.8rem", color: i <= step ? "var(--elx-navy)" : "#7a8a9c", fontWeight: i === step ? 700 : 400, whiteSpace: "nowrap" }}>{s}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div style={{ width: 80, height: 2, background: i < step ? "var(--elx-navy)" : "#e0e6ed", margin: "0 8px", marginBottom: 24 }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 0: Product info */}
                    {step === 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div>
                                <label style={labelStyle}>Số Model sản phẩm *</label>
                                <input name="model" value={form.model} onChange={handleChange} placeholder="VD: EWF8024BDWA" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Số Series (Serial Number) *</label>
                                <input name="serial" value={form.serial} onChange={handleChange} placeholder="Tìm trên tem sản phẩm" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Ngày mua *</label>
                                <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nơi mua hàng</label>
                                <input name="retailer" value={form.retailer} onChange={handleChange} placeholder="Tên cửa hàng / đại lý" style={inputStyle} />
                            </div>
                            <button onClick={() => setStep(1)} style={{ background: "var(--elx-navy)", color: "#fff", border: "none", padding: "14px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", cursor: "pointer", marginTop: 8 }}>
                                Tiếp theo →
                            </button>
                        </div>
                    )}

                    {/* Step 1: Personal info */}
                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                                <input name="city" value={form.city} onChange={handleChange} placeholder="Hà Nội" style={inputStyle} />
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={() => setStep(0)} style={{ flex: 1, background: "none", border: "2px solid var(--elx-navy)", color: "var(--elx-navy)", padding: "14px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
                                    ← Quay lại
                                </button>
                                <button onClick={() => setStep(2)} style={{ flex: 2, background: "var(--elx-navy)", color: "#fff", border: "none", padding: "14px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
                                    Tiếp theo →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Confirm */}
                    {step === 2 && (
                        <div>
                            <div style={{ border: "1px solid var(--elx-border)", borderRadius: 8, padding: "28px", marginBottom: 24 }}>
                                <h3 style={{ color: "var(--elx-navy)", marginBottom: 16, fontWeight: 700 }}>Thông tin sản phẩm</h3>
                                <p><strong>Model:</strong> {form.model || "—"}</p>
                                <p><strong>Serial:</strong> {form.serial || "—"}</p>
                                <p><strong>Ngày mua:</strong> {form.purchaseDate || "—"}</p>
                                <p><strong>Nơi mua:</strong> {form.retailer || "—"}</p>
                                <h3 style={{ color: "var(--elx-navy)", marginTop: 20, marginBottom: 16, fontWeight: 700 }}>Thông tin cá nhân</h3>
                                <p><strong>Họ tên:</strong> {form.name || "—"}</p>
                                <p><strong>Điện thoại:</strong> {form.phone || "—"}</p>
                                <p><strong>Email:</strong> {form.email || "—"}</p>
                                <p><strong>Tỉnh thành:</strong> {form.city || "—"}</p>
                            </div>
                            <p style={{ fontSize: "0.88rem", color: "#4a5a72", marginBottom: 20 }}>
                                * Chú ý: Đăng ký bảo hành sản phẩm chỉ áp dụng qua đăng ký Online
                            </p>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={() => setStep(1)} style={{ flex: 1, background: "none", border: "2px solid var(--elx-navy)", color: "var(--elx-navy)", padding: "14px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
                                    ← Quay lại
                                </button>
                                <button onClick={() => alert("Đăng ký thành công! Chúng tôi sẽ gửi xác nhận qua email.")} style={{ flex: 2, background: "var(--elx-navy)", color: "#fff", border: "none", padding: "14px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
                                    Xác nhận đăng ký
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
