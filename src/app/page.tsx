"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

/* ── data ── */
const heroSlides = [
  { img: "/hero-banner-1.jpg", title: "SALE LỚN GIỮA NĂM\nNÂNG TẦM TỔ ẤM", desc: "Số lượng ưu đãi có hạn", cta: "Mua Ngay", href: "#" },
  { img: "/hero-banner-2.jpg", title: "Wash life balance", desc: "Máy giặt Electrolux mới giúp bạn giặt sạch cả tủ quần áo nhanh hơn", cta: "Khám phá ngay", href: "#" },
  { img: "/hero-banner-3.jpg", title: "Tủ lạnh AI AutoSense", desc: "Tiết kiệm điện đến 10%", cta: "KHÁM PHÁ NGAY", href: "#" },
  { img: "/hero-banner-4.png", title: "SẤY KHÔ HIỆU QUẢ\nGẤP 3 LẦN", desc: "Bộ sưu tập Máy rửa bát UltimateCare 300", cta: "Khám phá ngay", href: "#" },
  { img: "/hero-banner-5.png", title: "Thu cũ đổi mới dễ dàng\nGiảm thêm 5%", desc: "Khi sắm thiết bị mới", cta: "Khám phá ngay!", href: "#" },
];

const services = [
  { icon: "/icon-free-shipping.svg", text: "Miễn phí vận chuyển" },
  { icon: "/icon-free-install.svg", text: "Miễn phí lắp đặt" },
  { icon: "/icon-installment.svg", text: "Trả góp 0%" },
];

const categories = [
  { icon: "/icon-washing-machine.svg", name: "Máy giặt" },
  { icon: "/icon-dryer.svg", name: "Máy sấy quần áo" },
  { icon: "/icon-fridge.svg", name: "Tủ lạnh" },
  { icon: "/icon-hob.svg", name: "Bếp nấu" },
  { icon: "/icon-air-purifier.svg", name: "Máy lọc không khí" },
  { icon: "/icon-dehumidifier.svg", name: "Máy hút ẩm" },
  { icon: "/icon-vacuum.svg", name: "Máy hút bụi" },
  { icon: "/icon-dishwasher.svg", name: "Máy rửa bát" },
  { icon: "/icon-oven.svg", name: "Lò nướng" },
  { icon: "/icon-hood.svg", name: "Máy hút mùi" },
  { icon: "/icon-rice-cooker.svg", name: "Nồi cơm điện" },
  { icon: "/icon-kettle.svg", name: "Bình đun siêu tốc" },
  { icon: "/icon-blender.svg", name: "Máy xay sinh tố" },
  { icon: "/icon-water-dispenser.svg", name: "Cây nước nóng lạnh" },
  { icon: "/icon-iron.svg", name: "Bàn ủi" },
  { icon: "/icon-water-heater.svg", name: "Máy nước nóng" },
];

const products = [
  { img: "/product-1.jpg", name: "Máy giặt cửa trước 10kg UltimateCare 300", sku: "EWF1023P5WC", price: "9.990.000₫", oldPrice: "12.990.000₫", badge: "GIẢM 23%" },
  { img: "/product-2.jpg", name: "Máy giặt cửa trước 9kg UltimateCare 500", sku: "EWF9023P5WC", price: "11.490.000₫", oldPrice: "14.490.000₫", badge: "GIẢM 21%" },
  { img: "/product-3.jpg", name: "Máy giặt cửa trước 9kg UltimateCare 500", sku: "EWF9023P5SC", price: "12.990.000₫", oldPrice: "15.990.000₫", badge: "GIẢM 19%" },
  { img: "/product-4.jpg", name: "Máy sấy cửa trước 8kg UltimateCare 300", sku: "EDV804H3WC", price: "8.990.000₫", oldPrice: "11.490.000₫", badge: "GIẢM 22%" },
];

const navItems = ["Sản phẩm", "Dịch vụ", "Khuyến mại", "Blog"];

const footerSections = [
  { title: "Sản phẩm", links: ["Máy giặt", "Máy sấy quần áo", "Tủ lạnh", "Bếp nấu", "Máy lọc không khí", "Máy hút bụi"] },
  { title: "Dịch vụ", links: ["Đặt lịch sửa chữa", "Đăng ký sản phẩm", "Gia hạn bảo hành", "Hỗ trợ khách hàng", "Câu hỏi thường gặp"] },
  { title: "Về Electrolux", links: ["Giới thiệu", "Bền vững", "Tin tức", "Tuyển dụng", "Liên hệ"] },
];

/* ── Hero Slider Component ── */
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const len = heroSlides.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % len), [len]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + len) % len), [len]);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="hero-slider" id="hero-slider">
      <div className="hero-slider__track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {heroSlides.map((s, i) => (
          <div className="hero-slider__slide" key={i}>
            <Image src={s.img} alt={s.title} width={1920} height={500} style={{ width: "100%", height: "auto", minHeight: 400, objectFit: "cover" }} priority={i === 0} />
            <div className="hero-slider__overlay" />
            <div className="hero-slider__content">
              <h1 style={{ whiteSpace: "pre-line" }}>{s.title}</h1>
              <p>{s.desc}</p>
              <div><a href={s.href} className="cta-btn cta-btn--white">{s.cta}</a></div>
            </div>
          </div>
        ))}
      </div>
      <button className="hero-slider__arrow hero-slider__arrow--prev" onClick={prev} aria-label="Previous">‹</button>
      <button className="hero-slider__arrow hero-slider__arrow--next" onClick={next} aria-label="Next">›</button>
      <div className="hero-slider__dots">
        {heroSlides.map((_, i) => (
          <button key={i} className={`hero-slider__dot ${i === current ? "hero-slider__dot--active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}

/* ── Main Page ── */
export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      {/* ====== TOP BAR ====== */}
      <div style={{ background: "var(--elx-navy)", color: "#fff", fontSize: "0.875rem" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 15px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 40 }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none"><path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 115 3.5a1.5 1.5 0 010 3z" fill="#fff"/></svg>
            Chọn vị trí của bạn
          </a>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <a href="#" style={{ color: "#fff" }}>Hỗ trợ</a>
            <a href="#" style={{ color: "#fff" }}>Đặt lịch sửa chữa</a>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 5, color: "#fff" }}>
              <Image src="/flag-vn.png" alt="VN" width={20} height={14} /> Tiếng Việt
            </a>
          </div>
        </div>
      </div>

      {/* ====== HEADER / NAV ====== */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--elx-border)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 15px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 75 }}>
          {/* Hamburger */}
          <button onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu" style={{ display: "none", background: "none", border: "none", cursor: "pointer" }} className="md-hide-hamburger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--elx-navy)"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
          </button>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image src="/electrolux_logo.svg" alt="Electrolux Vietnam" width={144} height={35} priority />
          </a>
          {/* Nav Items */}
          <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {navItems.map((item) => (
              <a key={item} href="#" style={{ padding: "28px 17px", fontWeight: 600, fontSize: "1rem", color: "var(--elx-navy)", position: "relative" }}>
                {item}
              </a>
            ))}
          </nav>
          {/* Right icons */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* Search */}
            <button aria-label="Tìm kiếm" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
            {/* Wishlist */}
            <button aria-label="Yêu thích" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
            {/* Profile */}
            <button aria-label="Tài khoản" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            {/* Cart */}
            <button aria-label="Giỏ hàng" style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              <span style={{ position: "absolute", top: -6, right: -6, background: "#ff3a30", color: "#fff", fontSize: "0.65rem", fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>0</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====== SERVICE BANNER ====== */}
      <div style={{ background: "var(--elx-navy)", color: "#fff" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
          {services.map((s, i) => (
            <a key={i} href="#" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 30px", color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
              <Image src={s.icon} alt={s.text} width={32} height={32} /> {s.text}
            </a>
          ))}
        </div>
      </div>

      {/* ====== HERO SLIDER ====== */}
      <HeroSlider />

      {/* ====== BROWSE PRODUCTS ====== */}
      <section style={{ padding: "50px 15px", maxWidth: 1180, margin: "0 auto" }}>
        <h2 className="section-heading">Khám phá sản phẩm</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
          {categories.map((c, i) => (
            <a key={i} href="#" className="category-tile">
              <Image src={c.icon} alt={c.name} width={80} height={80} className="category-tile__icon" />
              <span className="category-tile__name">{c.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ====== BEST SELLERS ====== */}
      <section style={{ padding: "40px 15px 60px", background: "var(--elx-gray-light)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h2 className="section-heading">Sản phẩm bán chạy</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {products.map((p, i) => (
              <div key={i} className="product-card">
                {p.badge && <span className="product-card__badge">{p.badge}</span>}
                <Image src={p.img} alt={p.name} width={300} height={300} className="product-card__img" style={{ objectFit: "contain", margin: "0 auto" }} />
                <h3 className="product-card__name">{p.name}</h3>
                <p className="product-card__sku">{p.sku}</p>
                <p className="product-card__price">{p.price}</p>
                {p.oldPrice && <p className="product-card__price-old">{p.oldPrice}</p>}
                <div className="product-card__actions">
                  <a href="#" className="cta-btn" style={{ width: "100%" }}>Thêm vào giỏ</a>
                  <a href="#" className="cta-btn cta-btn--outline" style={{ width: "100%" }}>Xem chi tiết</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PROMO BANNERS ====== */}
      <section style={{ padding: "60px 15px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 }}>
          <a href="#" className="promo-banner">
            <Image src="/ultimatecare.png" alt="UltimateCare" width={900} height={600} style={{ width: "100%", height: 350, objectFit: "cover" }} />
            <div className="promo-banner__overlay" />
            <div className="promo-banner__content">
              <h3>Máy giặt UltimateCare</h3>
              <p>Công nghệ giặt hơi nước diệt khuẩn, bảo vệ sợi vải tối ưu</p>
              <span className="cta-btn cta-btn--white">Khám phá ngay</span>
            </div>
          </a>
          <a href="#" className="promo-banner">
            <Image src="/refrigerators.jpg" alt="Tủ lạnh" width={900} height={600} style={{ width: "100%", height: 350, objectFit: "cover" }} />
            <div className="promo-banner__overlay" />
            <div className="promo-banner__content">
              <h3>Tủ lạnh NutriFresh®</h3>
              <p>Giữ rau quả tươi ngon lâu hơn gấp 7 lần</p>
              <span className="cta-btn cta-btn--white">Tìm hiểu thêm</span>
            </div>
          </a>
        </div>
      </section>

      {/* ====== WARRANTY BANNER ====== */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Image src="/warranty.jpg" alt="Bảo hành" width={1920} height={600} style={{ width: "100%", height: 350, objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(90deg, rgba(1,30,65,0.75) 0%, rgba(1,30,65,0.3) 60%, transparent 100%)" }} />
        <div style={{ position: "absolute", top: "50%", left: 40, transform: "translateY(-50%)", color: "#fff", maxWidth: 500, padding: 20 }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 10 }}>Gia hạn bảo hành</h2>
          <p style={{ marginBottom: 20, opacity: 0.9 }}>Bảo vệ thiết bị lâu dài hơn với gói Gia Hạn Bảo Hành chính hãng từ Electrolux</p>
          <a href="#" className="cta-btn cta-btn--white">Xem thêm</a>
        </div>
      </section>

      {/* ====== BLOG BANNER ====== */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Image src="/blog-banner.jpg" alt="Blog" width={1920} height={760} style={{ width: "100%", height: 350, objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(0deg, rgba(1,30,65,0.7) 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", bottom: 30, left: 40, color: "#fff", maxWidth: 500, padding: 20 }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 10 }}>Blog & Mẹo hay</h2>
          <p style={{ marginBottom: 15, opacity: 0.9 }}>Khám phá các bài viết hữu ích về chăm sóc nhà cửa, mẹo nấu ăn và bảo quản thực phẩm</p>
          <a href="#" className="cta-btn cta-btn--white">Đọc thêm</a>
        </div>
      </section>

      {/* ====== NEWSLETTER ====== */}
      <section className="newsletter" style={{ padding: "50px 15px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--elx-navy)", marginBottom: 10 }}>Đăng ký nhận tin</h2>
          <p style={{ color: "var(--elx-gray-dark)", marginBottom: 20, fontSize: "0.9rem" }}>Nhận thông tin khuyến mại và sản phẩm mới nhất từ Electrolux</p>
          <div style={{ display: "flex", maxWidth: 450, margin: "0 auto" }}>
            <input type="email" placeholder="Nhập email của bạn" className="newsletter__input" />
            <button className="newsletter__btn">Đăng ký</button>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="footer">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "50px 15px 30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 30, marginBottom: 30 }}>
            {/* Logo + Social */}
            <div>
              <Image src="/electrolux_logo.svg" alt="Electrolux" width={120} height={30} style={{ filter: "brightness(0) invert(1)", marginBottom: 20 }} />
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: 15, lineHeight: 1.6 }}>Thương hiệu thiết bị gia dụng hàng đầu từ Thụy Điển</p>
              <div style={{ display: "flex", gap: 12 }}>
                {["Facebook", "YouTube", "Zalo"].map((s) => (
                  <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}>{s[0]}</a>
                ))}
              </div>
            </div>
            {/* Footer Sections */}
            {footerSections.map((sec) => (
              <div key={sec.title}>
                <h4 className="footer__heading">{sec.title}</h4>
                {sec.links.map((link) => (
                  <a key={link} href="#" className="footer__link">{link}</a>
                ))}
              </div>
            ))}
          </div>
          {/* Hotline */}
          <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.15)", borderBottom: "1px solid rgba(255,255,255,0.15)", marginBottom: 20 }}>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Hotline: <a href="tel:19006099" style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>1900 6099</a></p>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 Electrolux Vietnam. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
