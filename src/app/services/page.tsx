import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { footerSections, navItems } from "@/data/siteData";

const services = [
  { title: "Dịch vụ bảo dưỡng", description: "Vệ sinh và bảo dưỡng định kỳ theo từng nhóm thiết bị.", href: "/services/maintenance" },
  { title: "Gia hạn bảo hành", description: "Mở rộng thời gian bảo vệ cho sản phẩm đủ điều kiện.", href: "/services/warranty-extension" },
];

export default function ServicesPage() {
  return <><Header navItems={navItems} /><main><section className="hero"><div><p>DỊCH VỤ ELECTROLUX</p><h1>Chăm sóc thiết bị lâu dài</h1><span>Các gói dịch vụ có phạm vi và chi phí riêng, tách biệt với yêu cầu hỗ trợ bảo hành.</span></div></section><section className="section"><div className="grid">{services.map((service) => <a href={service.href} key={service.href}><h2>{service.title}</h2><p>{service.description}</p><strong>Xem dịch vụ →</strong></a>)}</div><div className="help"><h2>Cần hỗ trợ sản phẩm đang bảo hành?</h2><p>Đặt lịch với bộ phận chăm sóc khách hàng để được xác nhận điều kiện bảo hành.</p><a href="/support/warranty-appointment">Đến trang đặt lịch bảo hành</a></div></section></main><Footer footerSections={footerSections} /><style>{`.hero{background:#011e41;color:#fff;padding:75px 24px}.hero>div,.section{max-width:1120px;margin:auto}.hero p{letter-spacing:2px;font-weight:700;color:#b9cae0}.hero h1{font-size:clamp(2.2rem,5vw,3.6rem);margin:12px 0}.hero span{color:#d5dfeb}.section{padding:65px 24px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.grid a{border:1px solid #d6dde5;padding:28px;text-decoration:none;border-radius:6px}.grid h2,.help h2{color:#011e41}.grid p,.help p{color:#526174;line-height:1.6}.grid strong{color:#011e41}.help{margin-top:55px;padding:30px;background:#eef3f8;border-left:4px solid #011e41}.help a{display:inline-block;margin-top:8px;background:#011e41;color:white;text-decoration:none;padding:12px 18px;font-weight:700}@media(max-width:760px){.grid{grid-template-columns:1fr}}`}</style></>;
}
