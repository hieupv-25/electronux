"use client";

import { FormEvent, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { footerSections, navItems } from "@/data/siteData";

type ProductResult = { productId: string; productName: string; model: string; pnc: string; variantName: string };
const initialForm = {
  productId: "", productName: "", model: "", pnc: "", customerType: "individual", salutation: "",
  firstName: "", lastName: "", dateOfBirth: "", phone: "", email: "", serialNumber: "",
  purchaseDate: "", retailer: "", invoiceUrl: "", website: "", marketingCall: false, marketingSms: false,
  marketingEmail: false, newsletterOptIn: false, privacyConsent: false, warrantyConsent: false,
};

export default function ProductRegistrationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ registrationCode: string; emailSent: boolean } | null>(null);
  const update = (name: keyof typeof initialForm, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }));

  async function searchProducts() {
    if (query.trim().length < 2) return setError("Nhập ít nhất 2 ký tự của model hoặc tên sản phẩm.");
    setSearching(true); setError("");
    try {
      const response = await fetch(`/api/support/product-registrations?model=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tìm sản phẩm.");
      setProducts(data.products || []);
      if (!data.products?.length) setError("Không tìm thấy model trong danh mục. Vui lòng kiểm tra lại mã model.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tìm sản phẩm."); }
    finally { setSearching(false); }
  }

  function chooseProduct(product: ProductResult) {
    setForm((current) => ({ ...current, ...product }));
    setProducts([]); setQuery(product.model); setError("");
  }

  async function uploadInvoice(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
      setError("Hóa đơn chỉ nhận PDF, PNG hoặc JPG và không vượt quá 5 MB."); return;
    }
    setUploading(true); setError("");
    const body = new FormData(); body.append("file", file); body.append("folder", "warranty-invoices");
    try {
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Tải hóa đơn thất bại.");
      update("invoiceUrl", data.url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Tải hóa đơn thất bại."); }
    finally { setUploading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/support/product-registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể gửi đăng ký.");
      setResult({ registrationCode: data.registrationCode, emailSent: Boolean(data.emailSent) });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể gửi đăng ký."); }
    finally { setLoading(false); }
  }

  return (
    <>
      <Header navItems={navItems} />
      <main>
        <section className="hero"><div className="wrap"><a href="/support">← Hỗ trợ</a><h1>Đăng ký sản phẩm</h1><p>Chọn đúng model trong danh mục, sau đó cung cấp thông tin mua hàng để kích hoạt quyền lợi bảo hành.</p></div></section>
        <section className="section"><div className="wrap narrow">
          {result ? <Success result={result} reset={() => { setForm(initialForm); setQuery(""); setStep(0); setResult(null); }} /> : (
            <form onSubmit={submit} className="form">
              <ol className="steps"><li className={step >= 0 ? "active" : ""}>1. Chọn sản phẩm</li><li className={step >= 1 ? "active" : ""}>2. Thông tin đăng ký</li><li className={step >= 2 ? "active" : ""}>3. Xác nhận</li></ol>
              {error && <p className="error" role="alert">{error}</p>}

              {step === 0 && <div>
                <h2>Tìm model sản phẩm</h2><p className="hint">Nhập model in trên nhãn sản phẩm. Bạn phải chọn một kết quả hợp lệ trong danh mục.</p>
                <div className="search"><input value={query} onChange={(e) => { setQuery(e.target.value); update("productId", ""); }} placeholder="Ví dụ: EWF1024P5WB" /><button type="button" onClick={searchProducts} disabled={searching}>{searching ? "Đang tìm..." : "Tìm kiếm"}</button></div>
                <div className="results">{products.map((product) => <button type="button" className="product" key={`${product.productId}-${product.model}`} onClick={() => chooseProduct(product)}><strong>{product.model}</strong><span>{product.productName}{product.variantName ? ` – ${product.variantName}` : ""}</span></button>)}</div>
                {form.productId && <div className="selected"><span>Đã chọn</span><strong>{form.model}</strong><p>{form.productName}</p></div>}
                <div className="actions"><button type="button" disabled={!form.productId} onClick={() => { setError(""); setStep(1); }}>Tiếp theo</button></div>
              </div>}

              {step === 1 && <div>
                <h2>Thông tin khách hàng và mua hàng</h2>
                <div className="grid two"><Field label="Loại khách hàng *"><select value={form.customerType} onChange={(e) => update("customerType", e.target.value)}><option value="individual">Cá nhân</option><option value="business">Doanh nghiệp</option></select></Field><Field label="Danh xưng"><select value={form.salutation} onChange={(e) => update("salutation", e.target.value)}><option value="">Không chọn</option><option>Ông</option><option>Bà</option><option>Anh</option><option>Chị</option></select></Field><Field label="Họ *"><input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></Field><Field label="Tên *"><input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></Field><Field label="Ngày sinh"><input type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} /></Field><Field label="Số điện thoại *"><input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field><Field label="Email *"><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field><Field label="Ngày mua *"><input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.purchaseDate} onChange={(e) => update("purchaseDate", e.target.value)} /></Field><Field label="Serial (không bắt buộc)"><input value={form.serialNumber} onChange={(e) => update("serialNumber", e.target.value)} /></Field><Field label="Nơi mua"><input value={form.retailer} onChange={(e) => update("retailer", e.target.value)} /></Field></div>
                <Field label="Hóa đơn (không bắt buộc, tối đa 5 MB)"><input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => uploadInvoice(e.target.files?.[0])} /></Field>{uploading && <p className="hint">Đang tải hóa đơn...</p>}{form.invoiceUrl && <p className="uploaded">✓ Đã tải hóa đơn</p>}
                <div className="actions"><button type="button" className="secondary" onClick={() => setStep(0)}>Quay lại</button><button type="button" disabled={!form.firstName || !form.lastName || !form.phone || !form.email || !form.purchaseDate || uploading} onClick={() => { setError(""); setStep(2); }}>Tiếp theo</button></div>
              </div>}

              {step === 2 && <div>
                <h2>Xác nhận đăng ký</h2><div className="summary"><p><span>Sản phẩm</span><strong>{form.productName}</strong></p><p><span>Model / PNC</span><strong>{form.model} / {form.pnc}</strong></p><p><span>Khách hàng</span><strong>{form.lastName} {form.firstName}</strong></p><p><span>Ngày mua</span><strong>{form.purchaseDate}</strong></p></div>
                <input className="honeypot" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
                <div className="consents"><Check required checked={form.privacyConsent} onChange={(v) => update("privacyConsent", v)}>Tôi đồng ý với <a href="/privacy-policy">chính sách quyền riêng tư</a>. *</Check><Check required checked={form.warrantyConsent} onChange={(v) => update("warrantyConsent", v)}>Tôi xác nhận thông tin đúng và đồng ý với <a href="/support/warranty-policy">điều khoản bảo hành</a>. *</Check><p>Tùy chọn nhận thông tin:</p><Check checked={form.marketingCall} onChange={(v) => update("marketingCall", v)}>Cuộc gọi</Check><Check checked={form.marketingSms} onChange={(v) => update("marketingSms", v)}>SMS</Check><Check checked={form.marketingEmail} onChange={(v) => update("marketingEmail", v)}>Email</Check><Check checked={form.newsletterOptIn} onChange={(v) => update("newsletterOptIn", v)}>Bản tin Electrolux</Check></div>
                <div className="actions"><button type="button" className="secondary" onClick={() => setStep(1)}>Quay lại</button><button disabled={loading || !form.privacyConsent || !form.warrantyConsent}>{loading ? "Đang gửi..." : "Hoàn tất đăng ký"}</button></div>
              </div>}
            </form>
          )}
        </div></section>
      </main>
      <Footer footerSections={footerSections} />
      <style jsx>{styles}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Check({ children, checked, onChange, required = false }: { children: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; required?: boolean }) { return <label className="check-row"><input type="checkbox" required={required} checked={checked} onChange={(e) => onChange(e.target.checked)} /><span>{children}</span></label>; }
function Success({ result, reset }: { result: { registrationCode: string; emailSent: boolean }; reset: () => void }) { return <div className="success"><div className="check">✓</div><h2>Đăng ký đã được tiếp nhận</h2><p>Mã tiếp nhận: <strong>{result.registrationCode}</strong></p><p>{result.emailSent ? "Email xác nhận đã được gửi tới bạn." : "Thông tin đã được lưu để bộ phận hỗ trợ kiểm tra."}</p><button onClick={reset}>Đăng ký sản phẩm khác</button></div>; }

const styles = `
  .wrap{max-width:1120px;margin:auto}.narrow{max-width:850px}.hero{background:#011e41;color:white;padding:52px 24px}.hero a{color:#bfd1e6;text-decoration:none}.hero h1{font-size:clamp(2rem,4vw,3rem);margin:18px 0 10px}.hero p{max-width:720px;color:#d7e1ec;line-height:1.65}.section{padding:54px 24px;background:#f6f7f8}.form,.success{background:white;border-radius:8px;padding:clamp(24px,5vw,48px);box-shadow:0 8px 30px rgba(1,30,65,.08)}h2{color:#011e41}.steps{display:grid;grid-template-columns:repeat(3,1fr);padding:0;margin:0 0 40px;list-style:none;border-bottom:2px solid #dce1e7}.steps li{padding:12px 5px;color:#718096;text-align:center}.steps li.active{color:#011e41;font-weight:700;border-bottom:3px solid #011e41;margin-bottom:-2px}.hint{color:#5c6878;line-height:1.5}.search{display:flex;gap:10px}.search input{flex:1;border:1px solid #aeb8c5;border-radius:4px;padding:12px;font:inherit}.results{display:grid;gap:8px;margin-top:12px}.product{display:flex!important;align-items:flex-start!important;text-align:left!important;gap:15px!important;background:white!important;color:#011e41!important;border:1px solid #c7d0db!important}.product span{font-weight:400}.selected{padding:16px;border-left:4px solid #011e41;background:#eef3f8;margin-top:18px}.selected span,.selected strong{display:block}.selected p{margin:5px 0 0}.grid{display:grid;gap:18px}.two{grid-template-columns:repeat(2,1fr)}.field{display:block;margin-bottom:18px}.field span{display:block;font-weight:650;color:#011e41;margin-bottom:7px}.field :global(input),.field :global(select){width:100%;box-sizing:border-box;border:1px solid #aeb8c5;border-radius:4px;padding:12px;font:inherit;color:#011e41;background:white}.uploaded{color:#237a38;font-weight:700}.summary{border:1px solid #dce1e7;padding:20px;border-radius:6px}.summary p{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #edf0f3;padding:10px 0;margin:0}.summary p:last-child{border:0}.consents{margin-top:25px}.check-row{display:flex;gap:10px;align-items:flex-start;margin:11px 0;line-height:1.45}.check-row :global(input){margin-top:4px}.check-row :global(a){color:#011e41}.actions{display:flex;justify-content:flex-end;gap:12px;margin-top:28px}button{background:#011e41;color:white;border:2px solid #011e41;border-radius:4px;padding:12px 24px;font-weight:700;cursor:pointer}button:disabled{opacity:.5;cursor:not-allowed}.secondary{background:white;color:#011e41}.error{background:#fff1f1;color:#a71919;padding:12px;border-radius:4px}.honeypot{position:absolute;left:-9999px}.success{text-align:center}.success .check{width:70px;height:70px;border-radius:50%;display:grid;place-items:center;margin:0 auto 20px;background:#e5f4e9;color:#237a38;font-size:38px}@media(max-width:700px){.two{grid-template-columns:1fr}.steps li{font-size:.8rem}.search,.actions{flex-direction:column}.actions button{width:100%}.summary p{flex-direction:column;gap:4px}}
`;
