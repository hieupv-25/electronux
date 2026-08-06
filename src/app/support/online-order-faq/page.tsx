"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

const faqGroups = [
    {
        group: "Tài khoản của tôi",
        faqs: [
            { q: "Tôi có cần tạo một tài khoản trước khi mua hàng không?", a: "Có, bạn sẽ được yêu cầu tạo một tài khoản Electrolux trước khi tiến hành thanh toán. Bạn có thể đăng ký tài khoản mới rất nhanh chóng và dễ dàng." },
            { q: "Những lợi ích tôi có được khi tạo tài khoản là gì?", a: "Tài khoản Electrolux sẽ cho phép bạn lưu lại địa chỉ, xem lại lịch sử mua hàng và theo dõi đơn hàng. Khách hàng đã đăng ký cũng sẽ nhận được những ưu đãi và chiết khấu đặc biệt." },
            { q: "Thông tin cá nhân của tôi có được bảo mật bởi Electrolux không?", a: "Có, Electrolux tuân theo các nguyên tắc toàn cầu để đảm bảo thông tin cá nhân của bạn được an toàn và bảo mật hoàn toàn, và chúng tôi không chia sẻ thông tin với bất kì bên thứ ba nào." },
            { q: "Làm cách nào để đặt lại mật khẩu tài khoản?", a: "Bạn có thể gửi yêu cầu đặt lại mật khẩu bằng cách nhấp vào \"quên mật khẩu\" ở trang đăng nhập và chúng tôi sẽ gửi cho bạn một liên kết qua email. Nếu cần hỗ trợ, liên hệ 1800-5888-99." },
        ],
    },
    {
        group: "Đơn hàng của tôi",
        faqs: [
            { q: "Tôi có thể chỉnh sửa đơn hàng sau khi đã xác nhận không?", a: "Sau khi đơn hàng đã được xác nhận, bạn không thể tự chỉnh sửa trên trang web. Nếu bạn cần chỉnh sửa, vui lòng liên hệ Tổng đài Electrolux theo số 1800-5888-99, chúng tôi có thể hỗ trợ nếu đơn hàng chưa rời khỏi kho." },
            { q: "Tôi không nhận được xác nhận đơn hàng?", a: "Bạn sẽ nhận được email xác nhận qua địa chỉ email đã cung cấp khi tạo tài khoản. Vui lòng kiểm tra thùng thư rác hoặc liên hệ Tổng đài 1800-5888-99." },
            { q: "Tôi có thể huỷ đơn hàng sau khi đã xác nhận không?", a: "Rất tiếc, sau khi đã đặt hàng bạn không thể tự hủy. Nếu có lý do chính đáng, vui lòng liên hệ Tổng đài Electrolux theo số 1800-5888-99 sớm nhất có thể." },
            { q: "Tại sao đơn hàng của tôi bị chậm trễ?", a: "Chúng tôi luôn nỗ lực giao hàng đúng hẹn. Nếu thời gian giao hàng dự kiến đã qua và bạn chưa nhận được hàng, liên hệ Tổng đài 1800-5888-99 để chúng tôi kiểm tra đơn hàng." },
        ],
    },
    {
        group: "Thanh toán",
        faqs: [
            { q: "Những phương thức thanh toán nào được chấp nhận?", a: "Electrolux chấp nhận thanh toán qua thẻ tín dụng/ghi nợ, chuyển khoản ngân hàng và thanh toán khi nhận hàng (COD) cho một số khu vực." },
            { q: "Thanh toán của tôi có an toàn không?", a: "Tất cả các giao dịch thanh toán đều được mã hóa SSL và tuân thủ tiêu chuẩn bảo mật PCI DSS. Thông tin thẻ của bạn không được lưu trữ trên hệ thống của chúng tôi." },
            { q: "Tôi có thể sử dụng nhiều mã khuyến mãi cho một đơn hàng không?", a: "Hiện tại mỗi đơn hàng chỉ áp dụng được một mã khuyến mãi. Chọn mã có lợi nhất cho bạn." },
        ],
    },
    {
        group: "Giao hàng",
        faqs: [
            { q: "Thời gian giao hàng là bao lâu?", a: "Thông thường 3–5 ngày làm việc đối với khu vực nội thành các tỉnh thành lớn; 5–7 ngày đối với các khu vực khác. Thời gian cụ thể sẽ được xác nhận qua email." },
            { q: "Tôi có thể theo dõi đơn hàng của mình không?", a: "Có. Sau khi đơn hàng được giao cho đơn vị vận chuyển, bạn sẽ nhận email kèm mã vận đơn để theo dõi trạng thái giao hàng." },
            { q: "Phí vận chuyển được tính như thế nào?", a: "Phí vận chuyển phụ thuộc vào khu vực giao hàng và trọng lượng sản phẩm. Phí vận chuyển sẽ được hiển thị rõ ràng trước khi bạn xác nhận đơn hàng." },
        ],
    },
    {
        group: "Đổi trả & Hoàn tiền",
        faqs: [
            { q: "Chính sách đổi trả của Electrolux như thế nào?", a: "Electrolux chấp nhận đổi trả trong vòng 15 ngày kể từ ngày nhận hàng nếu sản phẩm có lỗi kỹ thuật và được xác nhận bởi kỹ thuật viên. Sản phẩm phải còn nguyên bao bì và phụ kiện đầy đủ." },
            { q: "Khi nào tôi nhận được hoàn tiền?", a: "Sau khi sản phẩm được kiểm tra và chấp thuận đổi trả, hoàn tiền sẽ được xử lý trong vòng 7–14 ngày làm việc tùy theo phương thức thanh toán ban đầu." },
        ],
    },
];

export default function OnlineOrderFaqPage() {
    const [openItem, setOpenItem] = useState<string | null>(null);

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
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 10px" }}>Câu hỏi thường gặp về mua hàng trực tuyến</h1>
                    <p style={{ fontSize: "1rem", color: "#ccd6e8", margin: 0 }}>
                        Tìm câu trả lời nhanh chóng cho các thắc mắc phổ biến khi mua sắm tại Electrolux
                    </p>
                </div>
            </section>

            {/* FAQ groups */}
            <section style={{ padding: "56px 30px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    {faqGroups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: 48 }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--elx-navy)", marginBottom: 8, paddingBottom: 12, borderBottom: "2px solid var(--elx-navy)" }}>
                                {group.group}
                            </h2>
                            {group.faqs.map((faq, fi) => {
                                const key = `${gi}-${fi}`;
                                return (
                                    <div key={fi} style={{ borderBottom: "1px solid var(--elx-border)" }}>
                                        <button
                                            onClick={() => setOpenItem(openItem === key ? null : key)}
                                            style={{ width: "100%", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", cursor: "pointer", textAlign: "left", color: "var(--elx-navy)", fontSize: "1rem", fontWeight: openItem === key ? 700 : 500, gap: 16 }}
                                        >
                                            <span>{faq.q}</span>
                                            <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{openItem === key ? "−" : "+"}</span>
                                        </button>
                                        {openItem === key && (
                                            <div style={{ padding: "0 0 18px", color: "#444", fontSize: "0.95rem", lineHeight: 1.75 }}>{faq.a}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact strip */}
            <section style={{ background: "var(--elx-navy)", color: "#fff", padding: "40px 30px", textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", marginBottom: 16 }}>Không tìm được câu trả lời? Liên hệ trực tiếp với chúng tôi</p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="tel:1800588899" style={{ background: "#fff", color: "var(--elx-navy)", padding: "10px 24px", borderRadius: 4, fontWeight: 700, textDecoration: "none" }}>
                        📞 1800 588 899
                    </a>
                    <a href="mailto:vncare@electrolux.com" style={{ border: "2px solid #fff", color: "#fff", padding: "10px 24px", borderRadius: 4, fontWeight: 700, textDecoration: "none" }}>
                        ✉ vncare@electrolux.com
                    </a>
                </div>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
