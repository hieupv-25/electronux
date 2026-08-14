"use client";

import { FormEvent, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { footerSections, navItems } from "@/data/siteData";

const initialForm = {
  firstName: "", lastName: "", phone: "", email: "", city: "", district: "", ward: "",
  address: "", model: "", preferredDate: "", preferredTime: "", issue: "", website: "",
  privacyConsent: false, marketingCall: false, marketingSms: false, marketingEmail: false,
};

export default function WarrantyAppointmentPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ appointmentCode: string; emailSent: boolean } | null>(null);

  const update = (name: keyof typeof initialForm, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/support/warranty-appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể gửi lịch hẹn.");
      setResult({ appointmentCode: data.appointmentCode, emailSent: Boolean(data.emailSent) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi lịch hẹn.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header navItems={navItems} />
      <main>
        <section className="hero">
          <div className="wrap">
            <a href="/support">← Hỗ trợ</a>
            <h1>Đặt lịch hẹn bảo hành</h1>
            <p>Gửi thông tin sản phẩm và thời gian mong muốn. Bộ phận chăm sóc khách hàng sẽ liên hệ để xác nhận lịch.</p>
          </div>
        </section>

        <section className="section">
          <div className="wrap narrow">
            {result ? (
              <div className="success">
                <div className="check">✓</div>
                <h2>Yêu cầu đã được tiếp nhận</h2>
                <p>Mã tiếp nhận: <strong>{result.appointmentCode}</strong></p>
                <p>{result.emailSent ? "Thông tin xác nhận đã được gửi tới email của bạn." : "Nhân viên hỗ trợ sẽ liên hệ qua số điện thoại bạn cung cấp."}</p>
                <button onClick={() => { setForm(initialForm); setResult(null); }}>Đặt lịch khác</button>
              </div>
            ) : (
              <form onSubmit={submit} className="form">
                <h2>Thông tin khách hàng</h2>
                <div className="grid two">
                  <Field label="Họ *"><input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></Field>
                  <Field label="Tên *"><input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></Field>
                  <Field label="Số điện thoại *"><input required type="tel" placeholder="+84..." value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
                  <Field label="Email *"><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
                </div>

                <h2>Địa chỉ cần hỗ trợ</h2>
                <div className="grid three">
                  <Field label="Tỉnh / Thành phố *"><input required value={form.city} onChange={(e) => update("city", e.target.value)} /></Field>
                  <Field label="Quận / Huyện *"><input required value={form.district} onChange={(e) => update("district", e.target.value)} /></Field>
                  <Field label="Phường / Xã *"><input required value={form.ward} onChange={(e) => update("ward", e.target.value)} /></Field>
                </div>
                <Field label="Số nhà, tên đường *"><input required value={form.address} onChange={(e) => update("address", e.target.value)} /></Field>

                <h2>Thông tin lịch hẹn</h2>
                <div className="grid two">
                  <Field label="Model sản phẩm *"><input required placeholder="Ví dụ: EWF1024P5WB" value={form.model} onChange={(e) => update("model", e.target.value)} /></Field>
                  <Field label="Ngày mong muốn *"><input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.preferredDate} onChange={(e) => update("preferredDate", e.target.value)} /></Field>
                </div>
                <Field label="Khung giờ mong muốn"><select value={form.preferredTime} onChange={(e) => update("preferredTime", e.target.value)}><option value="">Chọn khung giờ</option><option>08:00 - 12:00</option><option>13:00 - 17:00</option></select></Field>
                <Field label="Mô tả sự cố *"><textarea required rows={5} value={form.issue} onChange={(e) => update("issue", e.target.value)} /></Field>
                <input className="honeypot" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />

                <div className="consents">
                  <Check required checked={form.privacyConsent} onChange={(value) => update("privacyConsent", value)}>Tôi đồng ý để Electrolux xử lý dữ liệu theo <a href="/privacy-policy">chính sách quyền riêng tư</a>. *</Check>
                  <p>Tùy chọn nhận thông tin và ưu đãi:</p>
                  <Check checked={form.marketingCall} onChange={(value) => update("marketingCall", value)}>Qua cuộc gọi</Check>
                  <Check checked={form.marketingSms} onChange={(value) => update("marketingSms", value)}>Qua SMS</Check>
                  <Check checked={form.marketingEmail} onChange={(value) => update("marketingEmail", value)}>Qua email</Check>
                </div>

                {error && <p className="error" role="alert">{error}</p>}
                <div className="actions"><button type="button" className="secondary" onClick={() => setForm(initialForm)}>Đặt lại</button><button disabled={loading}>{loading ? "Đang gửi..." : "Gửi yêu cầu"}</button></div>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer footerSections={footerSections} />
      <style jsx>{styles}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Check({ children, checked, onChange, required = false }: { children: React.ReactNode; checked: boolean; onChange: (value: boolean) => void; required?: boolean }) {
  return <label className="check-row"><input type="checkbox" required={required} checked={checked} onChange={(e) => onChange(e.target.checked)} /><span>{children}</span></label>;
}

const styles = `
  .wrap{max-width:1120px;margin:auto}.narrow{max-width:820px}.hero{background:#011e41;color:white;padding:52px 24px}.hero a{color:#bfd1e6;text-decoration:none}.hero h1{font-size:clamp(2rem,4vw,3rem);margin:18px 0 10px}.hero p{max-width:720px;line-height:1.65;color:#d7e1ec}.section{padding:54px 24px;background:#f6f7f8}.form,.success{background:white;border-radius:8px;padding:clamp(24px,5vw,48px);box-shadow:0 8px 30px rgba(1,30,65,.08)}h2{color:#011e41;margin:0 0 20px}form h2:not(:first-child){margin-top:36px}.grid{display:grid;gap:18px}.two{grid-template-columns:repeat(2,1fr)}.three{grid-template-columns:repeat(3,1fr)}.field{display:block;margin-bottom:18px}.field span{display:block;font-weight:650;color:#011e41;margin-bottom:7px}.field :global(input),.field :global(select),.field :global(textarea){width:100%;box-sizing:border-box;border:1px solid #aeb8c5;border-radius:4px;padding:12px;font:inherit;color:#011e41;background:white}.field :global(textarea){resize:vertical}.consents{border-top:1px solid #dce1e7;margin-top:28px;padding-top:22px;color:#36465a}.check-row{display:flex;gap:10px;align-items:flex-start;margin:11px 0;line-height:1.45}.check-row :global(input){margin-top:4px}.check-row :global(a){color:#011e41}.actions{display:flex;justify-content:flex-end;gap:12px;margin-top:28px}button{background:#011e41;color:white;border:2px solid #011e41;border-radius:4px;padding:12px 24px;font-weight:700;cursor:pointer}button:disabled{opacity:.6}.secondary{background:white;color:#011e41}.error{background:#fff1f1;color:#a71919;padding:12px;border-radius:4px}.honeypot{position:absolute;left:-9999px}.success{text-align:center}.success .check{width:70px;height:70px;border-radius:50%;display:grid;place-items:center;margin:0 auto 20px;background:#e5f4e9;color:#237a38;font-size:38px}.success strong{color:#011e41}@media(max-width:700px){.two,.three{grid-template-columns:1fr}.actions{flex-direction:column-reverse}.actions button{width:100%}}
`;
