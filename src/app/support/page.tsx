"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { footerSections, navItems } from "@/data/siteData";

const devices = [
  ["/icon-washing-machine.svg", "Máy giặt"], ["/icon-dryer.svg", "Máy sấy"],
  ["/icon-fridge.svg", "Tủ lạnh"], ["/icon-hob.svg", "Bếp nấu"],
  ["/icon-air-purifier.svg", "Máy lọc không khí"], ["/icon-dishwasher.svg", "Máy rửa bát"],
  ["/icon-oven.svg", "Lò nướng"], ["/icon-hood.svg", "Máy hút mùi"],
];

function QuickIcon({ type }: { type: "tool" | "bag" | "doc" | "shield" | "calendar" | "recycle" }) {
  const paths: Record<string, ReactNode> = {
    tool: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.8-3.8a6 6 0 01-8 8l-6.9 6.9a2.1 2.1 0 01-3-3l6.9-6.9a6 6 0 018-8z" />,
    bag: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/></>,
    doc: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M12 12v6M9 15h6"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/></>,
    recycle: <><path d="M7.5 7.5L12 2l4.5 5.5M16.5 7.5L21 16h-5M16 16l-4 6-4-6M8 16H3l4.5-8.5"/></>,
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

const faqs = [
  { q: "Làm sao để tôi đăng ký bảo hành sản phẩm mới?", a: <>Bạn có thể chọn model và điền thông tin tại trang <Link href="/support/product-registration">đăng ký bảo hành điện tử</Link>.</> },
  { q: "Khi thiết bị không hoạt động, tôi cần xử lý như thế nào?", a: <>Xem mục <Link href="/support/troubleshooting">xử lý sự cố</Link>, gọi <a href="tel:1800588899">1800 588 899</a> hoặc đặt lịch bảo hành nếu vẫn cần kỹ thuật viên hỗ trợ.</> },
  { q: "Tôi có thể tham khảo thông tin bảo hành ở đâu?", a: <>Điều kiện, phạm vi và thời hạn được trình bày tại <Link href="/support/warranty-policy">chính sách bảo hành</Link>.</> },
  { q: "Thiết bị của tôi hiển thị mã lỗi?", a: <>Kiểm tra sách hướng dẫn và trang xử lý sự cố. Nếu mã lỗi vẫn xuất hiện, hãy liên hệ tổng đài chính hãng để được hướng dẫn.</> },
  { q: "Số tổng đài Electrolux chính hãng là gì?", a: <>Hotline chính hãng là <strong>1800 588 899</strong>, miễn phí cước gọi, phục vụ từ thứ hai đến thứ bảy.</> },
];

const channels = [
  { title: "Mạng xã hội", desc: "Kết nối với chúng tôi để cập nhật thông tin mới nhất", links: [["FACEBOOK", "https://www.facebook.com/electroluxvietnam/"], ["ZALO", "https://zalo.me/3940082846017430673"], ["INSTAGRAM", "https://www.instagram.com/electroluxvn/"], ["TIKTOK", "https://www.tiktok.com/@electrolux.vietnam"]] },
  { title: "Email", desc: "Chia sẻ thắc mắc của bạn bất cứ lúc nào", links: [["GỬI EMAIL NGAY", "mailto:vncare@electrolux.com"]] },
  { title: "Gọi tổng đài Electrolux", desc: "Số điện thoại bảo hành và tư vấn chính hãng\nThứ hai đến thứ sáu: 8:00 – 18:00\nThứ bảy: 8:00 – 17:00", links: [["1800 588 899", "tel:1800588899"]] },
  { title: "Đặt lịch hẹn bảo hành", desc: "Yêu cầu bảo hành và hỗ trợ kỹ thuật cho thiết bị", links: [["ĐẶT HẸN NGAY", "/support/warranty-appointment"]] },
  { title: "Dịch vụ Electrolux", desc: "Bảo dưỡng, sửa chữa giá cố định và gia hạn bảo hành", links: [["XEM DỊCH VỤ", "/services"]] },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [model, setModel] = useState("");

  function goToRegistration() {
    const query = model.trim() ? `?model=${encodeURIComponent(model.trim())}` : "";
    window.location.href = `/support/product-registration${query}`;
  }

  return <>
    <Header navItems={navItems} />
    <main className="support-page">
      <section className="title"><h1>Hỗ trợ sản phẩm</h1></section>
      <section className="model-search"><div className="search-layout">
        <div><h2>Tìm kiếm hỗ trợ cho model<br/>sản phẩm của bạn</h2><div className="search-box"><input value={model} onChange={(event) => setModel(event.target.value)} onKeyDown={(event) => event.key === "Enter" && goToRegistration()} placeholder="Nhập số model. Ví dụ EWF1024P5WB"/><button onClick={goToRegistration} aria-label="Tìm model"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></button></div><Link href="/support/product-registration">Tôi tìm số model sản phẩm bằng cách nào?</Link></div>
        <div className="or"><i/><span>Hoặc</span><i/></div>
        <div className="qr"><svg width="82" height="82" viewBox="0 0 100 100" fill="none"><rect x="2" y="2" width="40" height="40" rx="4" stroke="white" strokeWidth="4"/><rect x="14" y="14" width="16" height="16" fill="white"/><rect x="58" y="2" width="40" height="40" rx="4" stroke="white" strokeWidth="4"/><rect x="70" y="14" width="16" height="16" fill="white"/><rect x="2" y="58" width="40" height="40" rx="4" stroke="white" strokeWidth="4"/><rect x="14" y="70" width="16" height="16" fill="white"/><path d="M58 58h10v10H58zM74 58h10v10H74zM58 74h10v10H58zM74 74h10v10H74zM90 74h10v10H90z" fill="white"/></svg><p>Quét mã QR bằng điện thoại để tìm kiếm thông tin hỗ trợ</p><Link href="/support/product-registration">Đăng ký sản phẩm bằng model</Link></div>
      </div></section>

      <section className="devices"><h2>Bạn cần trợ giúp cho thiết bị nào?</h2><div>{devices.map(([icon, label]) => <Link href="/support/troubleshooting" key={label}><Image src={icon} alt={label} width={56} height={56}/><span>{label}</span></Link>)}</div></section>

      <section className="quick"><h2>Liên kết nhanh</h2><div>{quickLinks.map((item) => <Link href={item.href} key={item.href}><span><QuickIcon type={item.type}/>{item.label}</span><b>→</b></Link>)}</div></section>

      <section className="faq"><h2>Câu hỏi thường gặp về sản phẩm Electrolux</h2>{faqs.map((faq, index) => <div className="faq-row" key={faq.q}><button onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{faq.q}</span><b>{openFaq === index ? "−" : "+"}</b></button>{openFaq === index && <p>{faq.a}</p>}</div>)}</section>

      <section className="contact"><div className="contact-title"><h2>Chúng tôi sẵn sàng hỗ trợ bạn</h2><p>Liên hệ với chúng tôi</p></div><div className="channel-grid">{channels.map((channel, index) => <article key={channel.title}><div className="channel-icon">{index === 0 ? "◎" : index === 1 ? "✉" : index === 2 ? "☎" : index === 3 ? "⌖" : "▦"}</div><h3>{channel.title}</h3><p>{channel.desc}</p><div>{channel.links.map(([label, href]) => href.startsWith("/") ? <Link href={href} key={href}>{label} ⊙</Link> : <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" key={href}>{label} ⊙</a>)}</div></article>)}</div></section>
    </main>
    <Footer footerSections={footerSections} />
    <style>{`
      .support-page .title{text-align:center;padding:48px 20px 32px;border-bottom:1px solid #d8dee6}.support-page .title h1,.support-page .devices h2,.support-page .quick h2,.support-page .faq h2,.support-page .contact h2{color:#011e41}.support-page .title h1{font-size:2.2rem;margin:0}.support-page .model-search{background:#011e41;color:#fff;padding:48px 20px}.support-page .search-layout{max-width:1100px;margin:auto;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:40px}.support-page .search-layout h2{font-size:1.75rem;line-height:1.35}.support-page .search-box{display:flex;background:#fff;border-radius:4px;overflow:hidden}.support-page .search-box input{flex:1;min-width:0;border:0;outline:0;padding:13px 16px;font:inherit}.support-page .search-box button{border:0;background:white;padding:0 16px;cursor:pointer}.support-page .search-layout a{display:inline-block;margin-top:10px;color:#ccd6e8;font-size:.9rem}.support-page .or{display:flex;flex-direction:column;align-items:center;gap:12px;color:#a0b4cc}.support-page .or i{width:1px;height:80px;background:#3a5a7c}.support-page .qr p{max-width:330px;line-height:1.5}.support-page .devices{padding:56px 20px;text-align:center;max-width:1100px;margin:auto}.support-page .devices h2,.support-page .quick h2,.support-page .faq h2{font-size:1.75rem;margin-bottom:38px}.support-page .devices>div{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.support-page .devices a{min-height:128px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:22px 14px;border:1px solid #d8dee6;border-radius:8px;background:#fff;color:#011e41;text-decoration:none;font-weight:650;box-sizing:border-box}.support-page .devices a:hover{border-color:#011e41;box-shadow:0 4px 16px rgba(1,30,65,.12)}.support-page .quick{padding:56px 20px;background:#f7f9fb;border-block:1px solid #d8dee6}.support-page .quick>div{max-width:1100px;margin:auto;display:grid;grid-template-columns:1fr 1fr;column-gap:48px}.support-page .quick h2{text-align:center}.support-page .quick a{min-height:65px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:16px 4px;border-bottom:1px solid #d8dee6;color:#011e41;text-decoration:none}.support-page .quick a span{display:flex;align-items:center;gap:13px}.support-page .quick b{font-size:1.3rem;flex:0 0 auto}.support-page .faq{max-width:1100px;margin:auto;padding:56px 20px}.support-page .faq h2{text-align:center}.support-page .faq-row{border-bottom:1px solid #d8dee6}.support-page .faq-row button{width:100%;background:none;border:0;display:flex;justify-content:space-between;align-items:center;padding:20px 0;color:#011e41;font:inherit;font-size:1.08rem;text-align:left;cursor:pointer}.support-page .faq-row p{margin:0;padding:0 0 24px;color:#3f4e60;line-height:1.7}.support-page .faq-row a{color:#011e41;font-weight:700}.support-page .contact{background:#eef2f7;padding:0 30px 40px}.support-page .contact-title{text-align:center;padding:40px 0 30px}.support-page .contact-title h2{margin:0 0 8px}.support-page .contact-title p{margin:0;color:#011e41}.support-page .channel-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));max-width:1240px;margin:auto}.support-page .channel-grid article{min-height:335px;box-sizing:border-box;background:white;border:1px solid #d8dee6;border-right:0;padding:32px 24px;display:flex;flex-direction:column}.support-page .channel-grid article:last-child{border-right:1px solid #d8dee6}.support-page .channel-icon{font-size:2.3rem;color:#011e41;line-height:1}.support-page .channel-grid h3{color:#011e41;font-size:1rem;margin:18px 0 8px}.support-page .channel-grid p{white-space:pre-line;color:#4a5a72;line-height:1.55;flex:1;margin-top:0}.support-page .channel-grid a{display:block;color:#011e41;font-size:.82rem;font-weight:750;text-decoration:none;margin:7px 0}@media(max-width:900px){.support-page .channel-grid{grid-template-columns:repeat(2,1fr);gap:12px}.support-page .channel-grid article{min-height:280px;border-right:1px solid #d8dee6}.support-page .search-layout{grid-template-columns:1fr}.support-page .or{display:none}}@media(max-width:650px){.support-page .title{padding:38px 16px 28px}.support-page .title h1{font-size:1.9rem}.support-page .model-search{padding:36px 20px}.support-page .model-search h2{font-size:1.55rem}.support-page .qr{display:none}.support-page .devices{padding:46px 16px}.support-page .devices h2,.support-page .quick h2,.support-page .faq h2{font-size:1.55rem}.support-page .devices>div{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.support-page .devices a{min-height:116px;padding:18px 8px}.support-page .quick{padding:46px 18px}.support-page .quick>div,.support-page .channel-grid{grid-template-columns:1fr}.support-page .quick a{padding:15px 0}.support-page .faq{padding:46px 18px}.support-page .contact{padding-inline:16px}.support-page .channel-grid article{min-height:auto;padding:26px 22px}}
    `}</style>
  </>;
}
