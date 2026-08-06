import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

const warrantyTable = [
    { product: "Máy giặt / Máy sấy", method: "Bảo hành tại nhà", note: "10 năm cho Motor (theo tem sản phẩm)" },
    { product: "Tủ lạnh", method: "Bảo hành tại nhà", note: "" },
    { product: "Máy rửa chén bát", method: "Bảo hành tại nhà", note: "" },
    { product: "Bếp gas / Bếp điện âm / Lò nướng / Máy hút mùi", method: "Bảo hành tại nhà", note: "" },
    { product: "Lò vi sóng", method: "Bảo hành tại trung tâm bảo hành", note: "Tại nhà nếu lắp âm" },
    { product: "Máy nước nóng trực tiếp", method: "Bảo hành tại nhà", note: "10 năm bình chứa; 5 năm thanh nhiệt" },
    { product: "Máy nước nóng gián tiếp", method: "Bảo hành tại nhà", note: "10 năm bình chứa" },
    { product: "Máy lọc KK / Máy hút ẩm / Máy hút bụi / Gia dụng nhỏ", method: "Bảo hành tại trung tâm", note: "" },
    { product: "Phụ kiện", method: "Không được bảo hành", note: "Bình thủy tinh, đĩa lò vi sóng..." },
];

const conditions = [
    "Bảo hành 24 tháng kể từ ngày mua (theo hóa đơn). Không gia hạn nếu sản phẩm được sang nhượng.",
    "Đổi sản phẩm trong 15 ngày nếu có lỗi kỹ thuật, được xác nhận bởi kỹ thuật viên Electrolux. Chỉ áp dụng hộ gia đình.",
    "Sử dụng cho mục đích kinh doanh (nhà hàng, khách sạn...) thì bảo hành chỉ 06 tháng.",
    "Chỉ áp dụng tại lãnh thổ Việt Nam, khu vực đất liền.",
    "Vị trí lắp đặt phức tạp, nguy hiểm thì khách hàng chịu chi phí phát sinh.",
    "Cung cấp chứng từ mua hàng hợp lệ hoặc đăng ký bảo hành tại electrolux.vn.",
];

const exclusions = [
    "Hư hỏng do tai nạn, sử dụng sai, không theo hướng dẫn",
    "Điện áp không ổn định, mất điện, sét đánh, thiên tai",
    "Côn trùng, động vật xâm nhập vào bên trong sản phẩm",
    "Đã bị tháo dỡ, sửa chữa bởi người không được ủy quyền",
    "Hư hỏng bề mặt thẩm mỹ do vận chuyển/sử dụng không đúng",
    "Phụ kiện đi kèm: bình thủy tinh, đĩa lò vi sóng, dây nguồn...",
];

export default function WarrantyPolicyPage() {
    return (
        <>
            <Header navItems={navItems} />
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "48px 30px 40px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <a href="/support" style={{ color: "#a0c0e0", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, textDecoration: "none" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Hỗ trợ sản phẩm
                    </a>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 10px" }}>Điều khoản bảo hành sản phẩm</h1>
                    <p style={{ fontSize: "1rem", color: "#ccd6e8", margin: 0 }}>Chính sách bảo hành chính hãng Electrolux Việt Nam</p>
                </div>
            </section>

            <section style={{ padding: "56px 30px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ background: "#eef2f7", borderLeft: "4px solid var(--elx-navy)", padding: "20px 24px", borderRadius: "0 8px 8px 0", marginBottom: 40 }}>
                        <strong style={{ color: "var(--elx-navy)", fontSize: "1.05rem" }}>Chính sách bảo hành chung:</strong>
                        <p style={{ marginTop: 8, color: "#333", lineHeight: 1.7 }}>
                            Các sản phẩm Electrolux được bảo hành <strong>24 tháng</strong> kể từ ngày mua đầu tiên.
                        </p>
                    </div>

                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 20 }}>Bảng bảo hành theo loại sản phẩm</h2>
                    <div style={{ overflowX: "auto", marginBottom: 48 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.93rem" }}>
                            <thead>
                                <tr style={{ background: "var(--elx-navy)", color: "#fff" }}>
                                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Loại sản phẩm</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Cách thức</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warrantyTable.map((row, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f7f9fb", borderBottom: "1px solid var(--elx-border)" }}>
                                        <td style={{ padding: "12px 16px", color: "var(--elx-navy)", fontWeight: 500 }}>{row.product}</td>
                                        <td style={{ padding: "12px 16px", color: row.method.includes("Không") ? "#c0392b" : "#2d6a4f", fontWeight: 600 }}>{row.method}</td>
                                        <td style={{ padding: "12px 16px", color: "#555", fontSize: "0.88rem" }}>{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 20 }}>Điều kiện áp dụng bảo hành</h2>
                    <ol style={{ paddingLeft: 20, marginBottom: 48 }}>
                        {conditions.map((c, i) => (
                            <li key={i} style={{ marginBottom: 12, color: "#333", lineHeight: 1.7, fontSize: "0.95rem" }}>{c}</li>
                        ))}
                    </ol>

                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 20 }}>Các trường hợp không được bảo hành</h2>
                    <ul style={{ paddingLeft: 20, marginBottom: 48 }}>
                        {exclusions.map((e, i) => (
                            <li key={i} style={{ marginBottom: 10, color: "#333", lineHeight: 1.7, fontSize: "0.95rem" }}>{e}</li>
                        ))}
                    </ul>

                    <div style={{ border: "1px solid var(--elx-border)", borderRadius: 8, padding: "28px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 12 }}>Gia hạn bảo hành</h3>
                        <ul style={{ paddingLeft: 20, color: "#333", lineHeight: 1.8, fontSize: "0.95rem" }}>
                            <li>Gói Gia hạn có hiệu lực ngay khi thời hạn bảo hành gốc chấm dứt, kéo dài lên đến 3 năm.</li>
                            <li>Không áp dụng cho sản phẩm sử dụng mục đích kinh doanh.</li>
                        </ul>
                        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <a href="/support/warranty-registration" style={{ background: "var(--elx-navy)", color: "#fff", padding: "10px 24px", borderRadius: 4, fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
                                Đăng ký bảo hành
                            </a>
                            <a href="tel:1800588899" style={{ border: "2px solid var(--elx-navy)", color: "var(--elx-navy)", padding: "10px 24px", borderRadius: 4, fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
                                Liên hệ 1800 588 899
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
