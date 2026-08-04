"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

  useEffect(() => {
    if (!token || !email) {
      setError("Link đặt lại mật khẩu không hợp lệ.");
    }
  }, [token, email]);

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
          <a href="/" className="cta-btn" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
            Về trang chủ
          </a>
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
          <a href="/" className="cta-btn" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
            Về trang chủ để đăng nhập
          </a>
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
            <label className="auth-label">Mật khẩu mới*</label>
            <div className="auth-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Xác nhận mật khẩu*</label>
            <div className="auth-input-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                className="auth-input"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? "🙈" : "👁"}
              </button>
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
