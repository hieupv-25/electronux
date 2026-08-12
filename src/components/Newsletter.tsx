export default function Newsletter() {
  return (
    <section className="newsletter" style={{ padding: "50px 15px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--elx-navy)", marginBottom: 10 }}>
          Đăng ký nhận tin
        </h2>
        <p style={{ color: "var(--elx-gray-dark)", marginBottom: 20, fontSize: "0.9rem" }}>
          Nhận thông tin khuyến mại và sản phẩm mới nhất từ Electrolux
        </p>
        <div style={{ display: "flex", maxWidth: 450, margin: "0 auto" }}>
          <input type="email" placeholder="Nhập email của bạn" className="newsletter__input" />
          <button className="newsletter__btn">Đăng ký</button>
        </div>
      </div>
    </section>
  );
}
