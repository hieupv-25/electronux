import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItems, footerSections } from "@/data/siteData";

export default function RecyclingPointsPage() {
    return (
        <>
            <Header navItems={navItems} />

            <section style={{ padding: "64px 30px", maxWidth: 900, margin: "0 auto", minHeight: "60vh" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--elx-navy)", textAlign: "center", marginBottom: 48 }}>
                    Điểm tiếp nhận sản phẩm thải bỏ
                </h1>

                <div style={{ fontSize: "0.97rem", color: "var(--elx-navy)", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: 18 }}>
                    <p>Kính thưa Quý khách,</p>

                    <p>Cảm ơn Quý khách đã quan tâm và lựa chọn sản phẩm của Electrolux.</p>

                    <p>
                        Tập đoàn Electrolux luôn phấn đấu để bảo đảm rằng các sản phẩm, dịch vụ của mình đóng góp vào sự phát triển dài lâu tại Việt Nam.
                        Chúng tôi đi đầu trong việc tuân thủ và áp dụng những quy định về bảo vệ môi trường và khuyến khích những nhà cung cấp của mình tuân theo
                        những nguyên tắc về môi trường mà Electrolux theo đuổi.
                    </p>

                    <p>
                        Nhằm mục tiêu đó, Electrolux có bố trí các địa điểm thu gom sản phẩm Electrolux thải bỏ tại các tỉnh thành trên toàn quốc.
                        Chúng tôi mong muốn nhận được sự hợp tác của Quý khách bằng việc vận chuyển sản phẩm (Electrolux) cần được thải bỏ sau quá trình
                        sử dụng đến các trung tâm tiếp nhận.
                    </p>

                    <p>
                        Quý khách vui lòng tham khảo danh sách trung tâm tiếp nhận{" "}
                        <a href="/support/warranty-appointment" style={{ color: "var(--elx-navy)", fontWeight: 600, textDecoration: "underline" }}>
                            tại đây
                        </a>.
                    </p>

                    <p>
                        Nếu Quý khách có bất kỳ câu hỏi nào, xin vui lòng liên hệ tổng đài CSKH{" "}
                        <strong>1800 5888 99</strong> (miễn phí cước gọi) hoặc email{" "}
                        <a href="mailto:vncare@electrolux.com" style={{ color: "var(--elx-navy)", fontWeight: 600, textDecoration: "underline" }}>
                            vncare@electrolux.com
                        </a>{" "}
                        để được hỗ trợ.
                    </p>

                    <p>Trân trọng cảm ơn</p>
                </div>
            </section>

            <Footer footerSections={footerSections} />
        </>
    );
}
