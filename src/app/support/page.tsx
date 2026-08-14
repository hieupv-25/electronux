import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { footerSections, navItems } from "@/data/siteData";

const contactCards = [
  { title: "Gọi tổng đài", description: "Tư vấn sản phẩm, bảo hành và hỗ trợ kỹ thuật.", label: "1800 588 899", href: "tel:1800588899" },
  { title: "Gửi email", description: "Gửi thông tin chi tiết để đội ngũ chăm sóc khách hàng phản hồi.", label: "vncare@electrolux.com", href: "mailto:vncare@electrolux.com" },
  { title: "Đặt lịch bảo hành", description: "Chọn ngày mong muốn để kỹ thuật viên liên hệ xác nhận.", label: "Đặt lịch ngay", href: "/support/warranty-appointment" },
];

const supportLinks = [
  { title: "Đăng ký sản phẩm", description: "Đăng ký sản phẩm đã mua để được hỗ trợ quyền lợi bảo hành.", href: "/support/product-registration" },
  { title: "Chính sách bảo hành", description: "Xem điều kiện, thời hạn và phạm vi bảo hành.", href: "/support/warranty-policy" },
  { title: "Tự xử lý sự cố", description: "Kiểm tra các lỗi thường gặp trước khi đặt lịch kỹ thuật.", href: "/support/troubleshooting" },
  { title: "Câu hỏi về đơn hàng", description: "Thanh toán, vận chuyển, đổi trả và mua hàng trực tuyến.", href: "/support/online-order-faq" },
  { title: "Điểm thu hồi sản phẩm", description: "Thông tin chương trình thu hồi và tái chế thiết bị điện tử.", href: "/support/recycling-points" },
  { title: "Dịch vụ trả phí", description: "Bảo dưỡng, sửa chữa giá cố định và gia hạn bảo hành.", href: "/services" },
];

export default function SupportPage() {
  return <>
    <Header navItems={navItems} />
    <main>
      <section className="hero"><div className="wrap"><p className="eyebrow">HỖ TRỢ ELECTROLUX</p><h1>Chúng tôi có thể giúp gì cho bạn?</h1><p>Chọn đúng kênh hỗ trợ cho sản phẩm, bảo hành hoặc đơn hàng của bạn.</p></div></section>
      <section className="contact"><div className="wrap cards">{contactCards.map((card) => <article key={card.title}><h2>{card.title}</h2><p>{card.description}</p><a href={card.href}>{card.label} →</a></article>)}</div></section>
      <section className="resources"><div className="wrap"><h2>Hỗ trợ sản phẩm và đơn hàng</h2><div className="resource-grid">{supportLinks.map((item) => <a href={item.href} key={item.title}><h3>{item.title}</h3><p>{item.description}</p><span>Xem chi tiết →</span></a>)}</div></div></section>
      <section className="social"><div className="wrap"><h2>Kết nối với Electrolux</h2><p>Nhắn tin qua kênh mạng xã hội chính thức để được hướng dẫn thêm.</p><div><a href="https://www.facebook.com/electroluxvietnam/" target="_blank" rel="noreferrer">Facebook</a><a href="https://zalo.me/3940082846017430673" target="_blank" rel="noreferrer">Zalo</a><a href="https://www.instagram.com/electroluxvn/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.tiktok.com/@electrolux.vietnam" target="_blank" rel="noreferrer">TikTok</a></div></div></section>
    </main>
    <Footer footerSections={footerSections} />
    <style>{`body{margin:0}.wrap{max-width:1120px;margin:auto}.hero{background:#011e41;color:#fff;padding:75px 24px}.eyebrow{font-size:.82rem;letter-spacing:2px;font-weight:700;color:#b9cae0}.hero h1{font-size:clamp(2.2rem,5vw,3.7rem);max-width:760px;margin:14px 0}.hero>div>p:last-child{font-size:1.1rem;color:#d5dfeb}.contact{padding:0 24px;background:#f5f6f7}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;transform:translateY(-30px)}.cards article{background:#fff;padding:30px;border-radius:6px;box-shadow:0 8px 28px rgba(1,30,65,.11)}h2,h3{color:#011e41}.cards p,.resource-grid p{color:#526174;line-height:1.55}.cards a,.resource-grid span{color:#011e41;font-weight:750;text-decoration:none}.resources{padding:50px 24px 75px}.resources>div>h2{text-align:center;font-size:2rem;margin-bottom:35px}.resource-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.resource-grid>a{display:block;border:1px solid #d8dee6;border-radius:6px;padding:25px;text-decoration:none;transition:.2s}.resource-grid>a:hover{border-color:#011e41;transform:translateY(-2px)}.social{background:#e8eef5;padding:55px 24px;text-align:center}.social p{color:#526174}.social div div{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px}.social a{border:1px solid #011e41;padding:10px 18px;border-radius:3px;color:#011e41;text-decoration:none;font-weight:700}@media(max-width:760px){.cards,.resource-grid{grid-template-columns:1fr}.cards{transform:none;padding-top:25px}.contact{padding-bottom:20px}}`}</style>
  </>;
}
