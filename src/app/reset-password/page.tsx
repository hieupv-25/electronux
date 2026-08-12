"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

type EyeButtonProps = {
  show: boolean;
  onToggle: () => void;
};

function EyeButton({ show, onToggle }: EyeButtonProps) {
  return (
    <button
      type="button"
      className="auth-eye"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
    >
      {show ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--elx-gray)" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--elx-gray)" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đã xảy ra lỗi.");
      } else {
        setSuccess(true);
        setMessage(data.message);
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="reset-page">
        <div className="reset-card">
          <h1>Đặt lại mật khẩu</h1>
          <p className="reset-error">Link đặt lại mật khẩu không hợp lệ.</p>
          <Link href="/" className="cta-btn" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-page">
        <div className="reset-card">
          <div style={{ textAlign: "center" }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 style={{ color: "#22c55e" }}>Thành công!</h1>
          <p>{message}</p>
          <Link href="/" className="cta-btn" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
            Về trang chủ để đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h1>Đặt lại mật khẩu</h1>
        <p style={{ color: "var(--elx-gray)", marginBottom: 24 }}>
          Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-password">Mật khẩu mới*</label>
            <div className="auth-input-wrap">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <EyeButton show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-confirm">Xác nhận mật khẩu*</label>
            <div className="auth-input-wrap">
              <input
                id="reset-confirm"
                type={showConfirm ? "text" : "password"}
                className="auth-input"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <EyeButton show={showConfirm} onToggle={() => setShowConfirm((value) => !value)} />
            </div>
          </div>

          {error && <p className="reset-error">{error}</p>}

          <button
            type="submit"
            className="cta-btn"
            disabled={loading}
            style={{ width: "100%", marginTop: 10, padding: "14px 28px", fontSize: "1rem" }}
          >
            {loading ? "Đang xử lý..." : "ĐẶT LẠI MẬT KHẨU"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="reset-page">
          <div className="reset-card">
            <p>Đang tải...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
