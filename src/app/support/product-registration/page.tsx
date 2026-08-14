"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { footerSections, navItems } from "@/data/siteData";

type ProductResult = { productId: string; productName: string; model: string; pnc: string; variantName: string };
const steps = ["Thông tin sản phẩm", "Thông tin cá nhân", "Xác nhận"];
const initialForm = {
  productId: "", productName: "", model: "", pnc: "", customerType: "individual", salutation: "",
  firstName: "", lastName: "", dateOfBirth: "", phone: "", email: "", serialNumber: "",
  purchaseDate: "", retailer: "", invoiceUrl: "", website: "", marketingCall: false, marketingSms: false,
  marketingEmail: false, newsletterOptIn: false, privacyConsent: false, warrantyConsent: false,
};

export default function ProductRegistrationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [modelQuery, setModelQuery] = useState("");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ code: string; emailSent: boolean } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = new URL(window.location.href).searchParams.get("model");
      if (query) setModelQuery(query);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const update = (name: keyof typeof initialForm, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }));

  async function searchProduct() {
    if (modelQuery.trim().length < 2) return setError("Vui lòng nhập ít nhất 2 ký tự của model.");
    setSearching(true); setError("");
    try {
      const response = await fetch(`/api/support/product-registrations?model=${encodeURIComponent(modelQuery)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tìm sản phẩm.");
      setProducts(data.products || []);
      if (!data.products?.length) setError("Không tìm thấy model trong danh mục. Vui lòng kiểm tra lại.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tìm sản phẩm."); }
    finally { setSearching(false); }
  }

  function chooseProduct(product: ProductResult) {
    setForm((current) => ({ ...current, ...product }));
    setModelQuery(product.model); setProducts([]); setError("");
  }

  async function uploadInvoice(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !["application/pdf", "image/png", "image/jpeg"].includes(file.type)) return setError("Hóa đơn chỉ nhận PDF, PNG hoặc JPG và không vượt quá 5 MB.");
    setUploading(true); setError("");
    const data = new FormData(); data.append("file", file); data.append("folder", "warranty-invoices");
    try {
      const response = await fetch("/api/upload", { method: "POST", body: data });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Tải hóa đơn thất bại.");
      update("invoiceUrl", payload.url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Tải hóa đơn thất bại."); }
    finally { setUploading(false); }
  }

  function nextPersonal() {
    if (!form.productId) return setError("Vui lòng tìm và chọn đúng model sản phẩm.");
    setError(""); setStep(1);
  }

  function nextConfirm() {
    if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.purchaseDate) return setError("Vui lòng điền đầy đủ các trường bắt buộc.");
    setError(""); setStep(2);
  }

  async function submit() {
    if (!form.privacyConsent || !form.warrantyConsent) return setError("Bạn cần đồng ý với chính sách quyền riêng tư và điều khoản bảo hành.");
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/support/product-registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể gửi đăng ký.");
      setResult({ code: data.registrationCode, emailSent: Boolean(data.emailSent) });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể gửi đăng ký."); }
    finally { setSubmitting(false); }
  }

  function reset() { setStep(0); setForm(initialForm); setModelQuery(""); setProducts([]); setError(""); setResult(null); }

  return <>
    <Header navItems={navItems} />
    <main className="registration-shell">
      <section className="hero"><div><Link href="/support">← Hỗ trợ sản phẩm</Link><h1>Đăng ký bảo hành điện tử</h1><p>Đăng ký ngay để được hưởng đầy đủ quyền lợi bảo hành chính hãng từ Electrolux</p></div></section>
      <section className="registration-page content"><div className="form-wrap">
        {result ? <div className="success"><div className="success-icon">✓</div><h2>Đăng ký thành công!</h2><p>{result.emailSent ? "Email xác nhận đã được gửi đến" : "Thông tin đăng ký đã được tiếp nhận cho"}</p><strong>{form.email}</strong><div className="code"><span>Mã đăng ký bảo hành</span><b>{result.code}</b></div><p>📌 Vui lòng lưu mã đăng ký để sử dụng khi cần liên hệ bảo hành</p><div className="button-row"><Link href="/support" className="outline">Về trang hỗ trợ</Link><button onClick={reset}>Đăng ký sản phẩm khác</button></div></div> : <>
          <div className="steps">{steps.map((label, index) => <div className="step-item" key={label}><div><b className={index <= step ? "active" : ""}>{index + 1}</b><span className={index <= step ? "current" : ""}>{label}</span></div>{index < steps.length - 1 && <i className={index < step ? "done" : ""}/>}</div>)}</div>
          {error && <div className="error" role="alert">⚠ {error}</div>}

          {step === 0 && <div className="pane"><h2>Thông tin sản phẩm</h2><p className="intro">Nhập model trên nhãn thiết bị và chọn đúng sản phẩm từ danh mục.</p><label><span>Số model sản phẩm *</span><div className="model-row"><input value={modelQuery} onChange={(event) => { setModelQuery(event.target.value); update("productId", ""); }} onKeyDown={(event) => event.key === "Enter" && searchProduct()} placeholder="VD: EWF1024P5WB"/><button onClick={searchProduct} disabled={searching}>{searching ? "Đang tìm..." : "Tìm model"}</button></div></label><div className="results">{products.map((product) => <button key={`${product.productId}-${product.model}`} onClick={() => chooseProduct(product)}><b>{product.model}</b><span>{product.productName}{product.variantName ? ` – ${product.variantName}` : ""}</span></button>)}</div>{form.productId && <div className="selected"><span>Đã chọn sản phẩm</span><b>{form.model}</b><p>{form.productName}</p></div>}<button className="next" onClick={nextPersonal} disabled={!form.productId}>Tiếp theo →</button></div>}

          {step === 1 && <div className="pane"><h2>Thông tin cá nhân và mua hàng</h2><div className="grid two"><Field label="Loại khách hàng *"><select value={form.customerType} onChange={(event) => update("customerType", event.target.value)}><option value="individual">Cá nhân</option><option value="business">Doanh nghiệp</option></select></Field><Field label="Danh xưng"><select value={form.salutation} onChange={(event) => update("salutation", event.target.value)}><option value="">Không chọn</option><option>Ông</option><option>Bà</option><option>Anh</option><option>Chị</option></select></Field><Field label="Họ *"><input value={form.lastName} onChange={(event) => update("lastName", event.target.value)}/></Field><Field label="Tên *"><input value={form.firstName} onChange={(event) => update("firstName", event.target.value)}/></Field><Field label="Số điện thoại *"><input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)}/></Field><Field label="Email *"><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)}/></Field><Field label="Ngày mua *"><input type="date" max={new Date().toISOString().slice(0, 10)} value={form.purchaseDate} onChange={(event) => update("purchaseDate", event.target.value)}/></Field><Field label="Ngày sinh"><input type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)}/></Field><Field label="Serial (không bắt buộc)"><input value={form.serialNumber} onChange={(event) => update("serialNumber", event.target.value)}/></Field><Field label="Nơi mua hàng"><input value={form.retailer} onChange={(event) => update("retailer", event.target.value)}/></Field></div><Field label="Hóa đơn (không bắt buộc, tối đa 5 MB)"><input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => uploadInvoice(event.target.files?.[0])}/></Field>{uploading && <p>Đang tải hóa đơn...</p>}{form.invoiceUrl && <p className="uploaded">✓ Đã tải hóa đơn</p>}<div className="button-row"><button className="outline" onClick={() => setStep(0)}>← Quay lại</button><button onClick={nextConfirm} disabled={uploading}>Tiếp theo →</button></div></div>}

          {step === 2 && <div className="pane"><h2>Xác nhận thông tin</h2><div className="summary"><h3>Thông tin sản phẩm</h3><p><b>Sản phẩm:</b> {form.productName}</p><p><b>Model / PNC:</b> {form.model} / {form.pnc}</p><p><b>Serial:</b> {form.serialNumber || "—"}</p><p><b>Ngày mua:</b> {form.purchaseDate}</p><h3>Thông tin cá nhân</h3><p><b>Họ tên:</b> {form.lastName} {form.firstName}</p><p><b>Điện thoại:</b> {form.phone}</p><p><b>Email:</b> {form.email}</p></div><div className="consents"><Check checked={form.privacyConsent} onChange={(value) => update("privacyConsent", value)}>Tôi đồng ý để Electrolux xử lý dữ liệu theo chính sách quyền riêng tư. *</Check><Check checked={form.warrantyConsent} onChange={(value) => update("warrantyConsent", value)}>Tôi xác nhận thông tin đúng và đồng ý với <Link href="/support/warranty-policy">điều khoản bảo hành</Link>. *</Check><p>Nhận thông tin và ưu đãi (không bắt buộc):</p><div className="marketing"><Check checked={form.marketingCall} onChange={(value) => update("marketingCall", value)}>Cuộc gọi</Check><Check checked={form.marketingSms} onChange={(value) => update("marketingSms", value)}>SMS</Check><Check checked={form.marketingEmail} onChange={(value) => update("marketingEmail", value)}>Email</Check></div></div><input className="honeypot" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)}/><div className="button-row"><button className="outline" onClick={() => setStep(1)}>← Quay lại</button><button onClick={submit} disabled={submitting}>{submitting ? "Đang gửi..." : "Xác nhận đăng ký ✓"}</button></div></div>}
        </>}
      </div></section>
    </main>
    <Footer footerSections={footerSections} />
    <style>{styles}</style>
  </>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Check({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) { return <label className="check"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}/><span>{children}</span></label>; }

const styles = `
  .registration-shell .hero{background:#011e41;color:white;padding:48px 30px 40px}.registration-shell .hero>div{max-width:1100px;margin:auto}.registration-shell .hero a{color:#a0c0e0;text-decoration:none}.registration-shell .hero h1{font-size:2rem;margin:16px 0 10px}.registration-shell .hero p{color:#ccd6e8;margin-bottom:0}
  .registration-page{padding:56px 24px 72px}.registration-page .form-wrap{width:100%;max-width:760px;margin:0 auto}.registration-page .steps{display:flex;justify-content:center;align-items:center;margin-bottom:48px}.registration-page .step-item{display:flex;align-items:center}.registration-page .step-item>div{display:flex;flex-direction:column;align-items:center;gap:7px}.registration-page .step-item b{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#e0e6ed;color:#7a8a9c}.registration-page .step-item b.active{background:#011e41;color:white}.registration-page .step-item span{font-size:.82rem;color:#7a8a9c;white-space:nowrap}.registration-page .step-item span.current{color:#011e41;font-weight:700}.registration-page .step-item i{width:92px;height:2px;background:#e0e6ed;margin:0 12px 25px}.registration-page .step-item i.done{background:#011e41}.registration-page .pane{width:100%}.registration-page .pane h2{color:#011e41;font-size:1.4rem;margin:0 0 8px}.registration-page .intro{color:#526174;margin:0 0 24px}.registration-page .pane label>span,.registration-page .field>span{display:block;margin-bottom:7px;font-weight:650;color:#011e41;font-size:.9rem}.registration-page .pane input,.registration-page .pane select{width:100%;min-height:48px;box-sizing:border-box;padding:12px 15px;border:1px solid #b9c2cd;border-radius:4px;font:inherit;color:#011e41;background:white}.registration-page .pane input:focus,.registration-page .pane select:focus{outline:2px solid rgba(1,30,65,.15);border-color:#011e41}.registration-page .model-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:stretch}.registration-page .pane button,.registration-page .success button,.registration-page .success .outline{min-height:48px;background:#011e41;color:white;border:2px solid #011e41;padding:11px 24px;border-radius:4px;font-weight:700;cursor:pointer;text-decoration:none;text-align:center;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}.registration-page .pane button:disabled{opacity:.5;cursor:not-allowed}.registration-page .next{width:100%;margin-top:26px}.registration-page .results{display:grid;gap:9px;margin-top:14px}.registration-page .results button{display:grid;grid-template-columns:125px minmax(0,1fr);text-align:left;gap:15px;background:white;color:#011e41;border:1px solid #c7d0db;white-space:normal;justify-content:stretch}.registration-page .results button:hover{border-color:#011e41;background:#f6f8fa}.registration-page .results button span{font-weight:400}.registration-page .selected{background:#eef4fb;border-left:4px solid #011e41;padding:15px 17px;margin-top:18px}.registration-page .selected span,.registration-page .selected b{display:block}.registration-page .selected p{margin:5px 0 0}.registration-page .grid{display:grid;gap:0 20px}.registration-page .two{grid-template-columns:1fr 1fr}.registration-page .field{display:block;margin-bottom:19px}.registration-page .button-row{display:flex;gap:12px;margin-top:28px}.registration-page .button-row>*{flex:1}.registration-page .button-row .outline,.registration-page .success .outline{background:white;color:#011e41}.registration-page .summary{border:1px solid #d8dee6;border-radius:8px;padding:26px 28px}.registration-page .summary h3{color:#011e41;margin-top:0}.registration-page .summary h3:nth-of-type(2){margin-top:24px}.registration-page .summary p{color:#3f4e60;margin:10px 0}.registration-page .consents{margin-top:24px}.registration-page .check{display:flex;gap:11px;align-items:flex-start;margin:13px 0;line-height:1.5;color:#3f4e60}.registration-page .check input{width:17px;min-height:auto;margin:3px 0 0;flex:0 0 17px}.registration-page .check a{color:#011e41;font-weight:700}.registration-page .marketing{display:flex;gap:24px;flex-wrap:wrap}.registration-page .error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;padding:13px 16px;border-radius:6px;margin-bottom:24px}.registration-page .uploaded{color:#237a38;font-weight:700}.registration-page .honeypot{position:absolute;left:-9999px}.registration-page .success{text-align:center;padding:42px 24px}.registration-page .success-icon{width:80px;height:80px;border-radius:50%;background:#e8f5e9;color:#2e7d32;display:grid;place-items:center;margin:0 auto 24px;font-size:40px}.registration-page .success h2,.registration-page .success>strong{color:#011e41}.registration-page .code{display:inline-flex;flex-direction:column;background:#eef4fb;border:1px solid #c5d8ef;border-radius:8px;padding:16px 32px;margin:24px}.registration-page .code span{font-size:.78rem;text-transform:uppercase;color:#7a8a9c}.registration-page .code b{color:#011e41;font-size:1.45rem;letter-spacing:2px;margin-top:5px}@media(max-width:700px){.registration-page{padding:38px 18px 56px}.registration-page .step-item i{width:28px;margin-inline:6px}.registration-page .step-item span{font-size:.67rem}.registration-page .two{grid-template-columns:1fr}.registration-page .model-row{grid-template-columns:1fr}.registration-page .button-row{flex-direction:column-reverse}.registration-page .marketing{flex-direction:column;gap:0}.registration-page .results button{grid-template-columns:1fr;gap:3px}.registration-page .code{margin-inline:0}.registration-page .success{padding-inline:0}}
`;
