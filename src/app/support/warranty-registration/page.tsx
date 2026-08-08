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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [registrationId, setRegistrationId] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/warranty", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Đã có lỗi xảy ra");
            setRegistrationId(data.registrationId);
            setSubmitted(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể gửi email. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 16px", border: "1px solid var(--elx-border)", borderRadius: 4,
        fontSize: "0.95rem", outline: "none", color: "var(--elx-navy)", fontFamily: "inherit",
        boxSizing: "border-box",
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

                    {/* Success Screen */}
                    {submitted ? (
                        <div style={{ textAlign: "center", padding: "48px 24px" }}>
                            {/* Checkmark circle */}
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%", background: "#e8f5e9",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 24px",
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h2 style={{ color: "var(--elx-navy)", fontSize: "1.6rem", fontWeight: 700, margin: "0 0 10px" }}>
                                Đăng ký thành công!
                            </h2>
                            <p style={{ color: "#4a5a72", fontSize: "1rem", marginBottom: 6 }}>
                                Email xác nhận đã được gửi đến
                            </p>
                            <p style={{ color: "var(--elx-navy)", fontWeight: 700, fontSize: "1.05rem", marginBottom: 24 }}>
                                {form.email}
                            </p>

                            {/* Registration ID */}
                            <div style={{
                                display: "inline-block", background: "#eef4fb", border: "1px solid #c5d8ef",
                                borderRadius: 8, padding: "16px 32px", marginBottom: 32,
                            }}>
                                <p style={{ margin: "0 0 4px", fontSize: "0.78rem", color: "#7a8a9c", textTransform: "uppercase", letterSpacing: "1px" }}>
                                    Mã đăng ký bảo hành
                                </p>
                                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--elx-navy)", letterSpacing: "3px" }}>
                                    {registrationId}
                                </p>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: "0.88rem", color: "#4a5a72", marginBottom: 36 }}>
                                <p style={{ margin: 0 }}>📧 Vui lòng kiểm tra hộp thư (bao gồm thư mục Spam)</p>
                                <p style={{ margin: 0 }}>📌 Lưu mã đăng ký để sử dụng khi cần liên hệ bảo hành</p>
                            </div>

                            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                                <a href="/support" style={{
                                    display: "inline-block", padding: "12px 28px",
                                    border: "2px solid var(--elx-navy)", color: "var(--elx-navy)",
                                    borderRadius: 4, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none",
                                }}>
                                    Về trang hỗ trợ
                                </a>
                                <button
                                    onClick={() => { setSubmitted(false); setStep(0); setForm({ model: "", serial: "", purchaseDate: "", retailer: "", name: "", phone: "", email: "", city: "" }); }}
                                    style={{
                                        padding: "12px 28px", background: "var(--elx-navy)", color: "#fff",
                                        border: "none", borderRadius: 4, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
                                    }}
                                >
                                    Đăng ký sản phẩm khác
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                        <label style={labelStyle}>Email *</label>
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
                                        * Sau khi xác nhận, email xác nhận sẽ được gửi đến <strong>{form.email}</strong>
                                    </p>

                                    {/* Error message */}
                                    {error && (
                                        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "12px 16px", marginBottom: 16, color: "#b91c1c", fontSize: "0.9rem" }}>
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    <div style={{ display: "flex", gap: 12 }}>
                                        <button onClick={() => setStep(1)} disabled={isSubmitting} style={{ flex: 1, background: "none", border: "2px solid var(--elx-navy)", color: "var(--elx-navy)", padding: "14px", borderRadius: 4, fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
                                            ← Quay lại
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            style={{
                                                flex: 2, background: isSubmitting ? "#7a9ab8" : "var(--elx-navy)", color: "#fff", border: "none",
                                                padding: "14px", borderRadius: 4, fontWeight: 700, fontSize: "1rem",
                                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                                    </svg>
                                                    Đang gửi...
                                                </>
                                            ) : "Xác nhận đăng ký ✓"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            <Footer footerSections={footerSections} />
        </>
    );
}
