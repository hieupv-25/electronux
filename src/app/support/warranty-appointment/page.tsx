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
      <main className="appointment-shell">
        <section className="hero">
          <div className="wrap">
            <a href="/support">← Hỗ trợ</a>
            <h1>Đặt lịch hẹn bảo hành</h1>
            <p>Gửi thông tin sản phẩm và thời gian mong muốn. Bộ phận chăm sóc khách hàng sẽ liên hệ để xác nhận lịch.</p>
          </div>
        </section>

        <section className="appointment-page section">
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
      <style>{styles}</style>
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
  .appointment-shell .wrap { width: 100%; max-width: 1120px; margin: 0 auto; box-sizing: border-box; }
  .appointment-shell .hero { background: #011e41; color: #fff; padding: 52px 24px 48px; }
  .appointment-shell .hero a { color: #c9d9eb; text-decoration: none; font-weight: 600; }
  .appointment-shell .hero h1 { font-size: clamp(2rem, 4vw, 2.65rem); line-height: 1.15; margin: 18px 0 11px; }
  .appointment-shell .hero p { max-width: 760px; margin: 0; line-height: 1.65; color: #dce7f3; }

  .appointment-page { padding: 52px 24px 80px; background: #f4f6f8; }
  .appointment-page .narrow { max-width: 900px; }
  .appointment-page .form,
  .appointment-page .success { box-sizing: border-box; background: #fff; border: 1px solid #d5dce5; border-radius: 10px; padding: 38px 42px 42px; box-shadow: 0 8px 28px rgba(1, 30, 65, .08); }
  .appointment-page .form h2 { position: relative; color: #011e41; font-size: 1.35rem; margin: 0 0 24px; padding: 0 0 12px; border-bottom: 1px solid #dce2e8; }
  .appointment-page .form h2::after { content: ""; position: absolute; bottom: -1px; left: 0; width: 54px; height: 3px; background: #0067b9; }
  .appointment-page .form h2:not(:first-child) { margin-top: 38px; }
  .appointment-page .grid { display: grid; gap: 0 22px; }
  .appointment-page .two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .appointment-page .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .appointment-page .field { display: block; margin-bottom: 21px; }
  .appointment-page .field > span { display: block; margin-bottom: 8px; color: #17375e; font-size: .92rem; font-weight: 700; }
  .appointment-page .field input,
  .appointment-page .field select,
  .appointment-page .field textarea { width: 100%; min-height: 50px; box-sizing: border-box; border: 2px solid #aeb9c7; border-radius: 6px; padding: 12px 14px; background: #fff; color: #011e41; font: inherit; transition: border-color .18s ease, box-shadow .18s ease, background .18s ease; }
  .appointment-page .field textarea { min-height: 132px; resize: vertical; line-height: 1.55; }
  .appointment-page .field input::placeholder,
  .appointment-page .field textarea::placeholder { color: #738195; opacity: 1; }
  .appointment-page .field input:hover,
  .appointment-page .field select:hover,
  .appointment-page .field textarea:hover { border-color: #78879a; }
  .appointment-page .field input:focus,
  .appointment-page .field select:focus,
  .appointment-page .field textarea:focus { outline: 0; border-color: #0067b9; box-shadow: 0 0 0 3px rgba(0, 103, 185, .16); background: #fbfdff; }
  .appointment-page .consents { margin-top: 10px; padding: 22px 24px; border: 1px solid #d6dde6; border-radius: 7px; background: #f8fafc; color: #36465a; }
  .appointment-page .consents > p { margin: 22px 0 10px; color: #17375e; font-weight: 700; }
  .appointment-page .check-row { display: flex; gap: 11px; align-items: flex-start; margin: 12px 0; line-height: 1.5; }
  .appointment-page .check-row input { width: 19px; height: 19px; margin: 2px 0 0; flex: 0 0 19px; accent-color: #011e41; }
  .appointment-page .check-row a { color: #011e41; font-weight: 700; }
  .appointment-page .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; }
  .appointment-page button { min-width: 170px; min-height: 50px; padding: 11px 25px; border: 2px solid #011e41; border-radius: 5px; background: #011e41; color: #fff; font-weight: 750; cursor: pointer; transition: background .18s ease, border-color .18s ease; }
  .appointment-page button:hover:not(:disabled) { background: #06376e; border-color: #06376e; }
  .appointment-page button:focus-visible { outline: 3px solid rgba(0, 103, 185, .3); outline-offset: 2px; }
  .appointment-page button:disabled { opacity: .5; cursor: not-allowed; }
  .appointment-page .secondary { background: #fff; color: #011e41; }
  .appointment-page .secondary:hover:not(:disabled) { color: #fff; }
  .appointment-page .error { margin: 22px 0 0; padding: 14px 16px; border: 1px solid #f4a9ae; border-left: 5px solid #b91c1c; border-radius: 6px; background: #fff1f2; color: #991b1b; font-weight: 600; }
  .appointment-page .honeypot { position: absolute; left: -9999px; }
  .appointment-page .success { text-align: center; }
  .appointment-page .success h2 { color: #011e41; margin: 0 0 16px; }
  .appointment-page .success p { color: #46576b; line-height: 1.6; }
  .appointment-page .success .check { width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 22px; background: #e5f4e9; color: #237a38; font-size: 40px; }
  .appointment-page .success strong { color: #011e41; }

  @media (max-width: 760px) {
    .appointment-shell .hero { padding: 38px 20px 34px; }
    .appointment-shell .hero h1 { font-size: 1.8rem; }
    .appointment-page { padding: 34px 14px 56px; }
    .appointment-page .form,
    .appointment-page .success { padding: 27px 18px 30px; border-radius: 8px; }
    .appointment-page .two,
    .appointment-page .three { grid-template-columns: 1fr; }
    .appointment-page .form h2:not(:first-child) { margin-top: 30px; }
    .appointment-page .consents { padding: 19px 16px; }
    .appointment-page .actions { flex-direction: column-reverse; }
    .appointment-page .actions button { width: 100%; }
  }
`;
