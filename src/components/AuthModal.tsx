"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import PasswordStrength from "./PasswordStrength";
import { useToast } from "./Toast";

type AuthView = "login" | "register" | "forgot" | "forgotSent";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
};

export default function AuthModal({ isOpen, onClose, initialView = "login" }: Props) {
  const [view, setView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const { showToast } = useToast();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
  const [regEmail, setRegEmail] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regAcceptTerms, setRegAcceptTerms] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");

  // Sync initialView when the prop changes
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  const resetAllFields = useCallback(() => {
    setGlobalError("");
    setRegErrors({});
    setLoading(false);
    setLoginEmail("");
    setLoginPassword("");
    setShowLoginPw(false);
    setRegEmail("");
    setRegFirstName("");
    setRegLastName("");
    setRegPassword("");
    setRegConfirm("");
    setRegPhone("");
    setShowRegPw(false);
    setShowRegConfirm(false);
    setRegAcceptTerms(false);
    setForgotEmail("");
  }, []);

  const handleClose = useCallback(() => {
    resetAllFields();
    onClose();
  }, [onClose, resetAllFields]);

  const resetState = () => {
    setGlobalError("");
    setRegErrors({});
    setLoading(false);
  };

  const switchView = (v: AuthView) => {
    resetState();
    setView(v);
  };

  // ── Login handler ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        setGlobalError(result.error === "CredentialsSignin"
          ? "Email hoặc mật khẩu không đúng."
          : result.error);
      } else {
        handleClose();
        showToast("Đăng nhập thành công! Chào mừng bạn quay trở lại.", "success");
        // Small delay for toast to show before reload
        setTimeout(() => window.location.reload(), 800);
      }
    } catch {
      setGlobalError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ── Register handler ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors({});
    setGlobalError("");

    // Client-side validation for terms
    if (!regAcceptTerms) {
      setGlobalError("Vui lòng đồng ý với điều khoản sử dụng.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          firstName: regFirstName,
          lastName: regLastName,
          password: regPassword,
          confirmPassword: regConfirm,
          phone: regPhone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setRegErrors(data.errors);
          if (data.errors._form) setGlobalError(data.errors._form);
        } else {
          setGlobalError("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      } else {
        // Auto-login after successful registration
        const loginResult = await signIn("credentials", {
          email: regEmail,
          password: regPassword,
          rememberMe: "true",
          redirect: false,
        });

        if (loginResult?.error) {
          // Registration succeeded but auto-login failed — switch to login view
          handleClose();
          showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success");
        } else {
          handleClose();
          showToast(`Chào mừng ${regFirstName}! Tài khoản đã được tạo thành công.`, "success");
          setTimeout(() => window.location.reload(), 800);
        }
      }
    } catch {
      setGlobalError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password handler ──
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (res.ok) {
        setView("forgotSent");
      } else {
        const data = await res.json();
        setGlobalError(data.message || "Đã xảy ra lỗi.");
      }
    } catch {
      setGlobalError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const EyeButton = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" className="auth-eye" onClick={toggle} tabIndex={-1}>
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

  return (
    <>
      {/* Backdrop */}
      <div className="auth-overlay" onClick={handleClose} />

      {/* Modal */}
      <div className="auth-modal" role="dialog" aria-modal="true">
        {/* Close button */}
        <button className="auth-close" onClick={handleClose} aria-label="Đóng">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Branding image */}
        <div className="auth-modal__branding">
          <Image
            src="/auth-branding.png"
            alt="Electrolux"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="auth-modal__branding-overlay" />
          <div className="auth-modal__branding-text">
            <Image src="/electrolux_logo.svg" alt="Electrolux" width={180} height={44} />
            <p>{view === "login" ? "Đăng nhập thành viên" : view === "register" ? "Tạo tài khoản mới" : "Khôi phục mật khẩu"}</p>
          </div>
        </div>

        {/* Right: Form content */}
        <div className="auth-modal__form">
          {/* ════════════════════ LOGIN ════════════════════ */}
          {view === "login" && (
            <>
              <h2 className="auth-title">Đăng nhập nhanh bằng tài khoản</h2>

              {/* Social buttons (placeholder) */}
              <div className="auth-social-row">
                <button className="auth-social auth-social--fb" disabled>
                  <svg width="10" height="20" viewBox="0 0 10 20" fill="#fff">
                    <path d="M6.82 20v-9.12h3.06l.46-3.56H6.82V5.05c0-1.03.29-1.73 1.76-1.73h1.88V.14C10.12.1 9 0 7.69 0 4.97 0 3.13 1.66 3.13 4.7v2.62H0v3.56h3.13V20h3.69z" />
                  </svg>
                  FACEBOOK
                </button>
                <button className="auth-social auth-social--gg" disabled>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 001 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  GOOGLE
                </button>
              </div>

              <div className="auth-divider">
                <span>hoặc</span>
              </div>

              <form onSubmit={handleLogin}>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="login-email">Email*</label>
                  <input
                    id="login-email"
                    type="email"
                    className="auth-input"
                    placeholder="example@gmail.com *"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="login-password">Mật khẩu*</label>
                  <div className="auth-input-wrap">
                    <input
                      id="login-password"
                      type={showLoginPw ? "text" : "password"}
                      className="auth-input"
                      placeholder="Mật khẩu *"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <EyeButton show={showLoginPw} toggle={() => setShowLoginPw(!showLoginPw)} />
                  </div>
                </div>

                <div className="auth-remember-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="auth-checkbox"
                    />
                    Tiếp tục đăng nhập?
                  </label>
                  <button
                    type="button"
                    className="auth-link"
                    onClick={() => switchView("forgot")}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {globalError && <p className="auth-error">{globalError}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    "ĐĂNG NHẬP"
                  )}
                </button>
              </form>

              <div className="auth-switch">
                <span style={{ color: "var(--elx-gray)", fontSize: "0.9rem" }}>
                  Chưa có tài khoản?{" "}
                </span>
                <button type="button" className="auth-link" onClick={() => switchView("register")}>
                  Tạo tài khoản mới
                </button>
              </div>
            </>
          )}

          {/* ════════════════════ REGISTER ════════════════════ */}
          {view === "register" && (
            <>
              <h2 className="auth-title">Đăng ký bằng email và mật khẩu của bạn:</h2>

              {/* Social buttons (placeholder) */}
              <div className="auth-social-row">
                <button className="auth-social auth-social--fb" disabled>
                  <svg width="10" height="20" viewBox="0 0 10 20" fill="#fff">
                    <path d="M6.82 20v-9.12h3.06l.46-3.56H6.82V5.05c0-1.03.29-1.73 1.76-1.73h1.88V.14C10.12.1 9 0 7.69 0 4.97 0 3.13 1.66 3.13 4.7v2.62H0v3.56h3.13V20h3.69z" />
                  </svg>
                  FACEBOOK
                </button>
                <button className="auth-social auth-social--gg" disabled>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 001 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  GOOGLE
                </button>
              </div>

              <div className="auth-divider">
                <span>hoặc</span>
              </div>

              <form onSubmit={handleRegister}>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-email">Email*</label>
                  <input
                    id="reg-email"
                    type="email"
                    className="auth-input"
                    placeholder="example@gmail.com *"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  {regErrors.email && <span className="auth-field-error">{regErrors.email}</span>}
                </div>

                <div className="auth-field-row">
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="reg-first-name">Tên*</label>
                    <input
                      id="reg-first-name"
                      type="text"
                      className="auth-input"
                      placeholder="Tên *"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      required
                      autoComplete="given-name"
                    />
                    {regErrors.firstName && <span className="auth-field-error">{regErrors.firstName}</span>}
                  </div>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="reg-last-name">Họ*</label>
                    <input
                      id="reg-last-name"
                      type="text"
                      className="auth-input"
                      placeholder="Họ *"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      required
                      autoComplete="family-name"
                    />
                    {regErrors.lastName && <span className="auth-field-error">{regErrors.lastName}</span>}
                  </div>
                </div>

                <div className="auth-field-row">
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="reg-password">Mật khẩu*</label>
                    <div className="auth-input-wrap">
                      <input
                        id="reg-password"
                        type={showRegPw ? "text" : "password"}
                        className="auth-input"
                        placeholder="Mật khẩu *"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <EyeButton show={showRegPw} toggle={() => setShowRegPw(!showRegPw)} />
                    </div>
                    {regErrors.password && <span className="auth-field-error">{regErrors.password}</span>}
                    <PasswordStrength password={regPassword} />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="reg-confirm">Xác nhận lại mật khẩu*</label>
                    <div className="auth-input-wrap">
                      <input
                        id="reg-confirm"
                        type={showRegConfirm ? "text" : "password"}
                        className="auth-input"
                        placeholder="Xác nhận lại mật khẩu *"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <EyeButton show={showRegConfirm} toggle={() => setShowRegConfirm(!showRegConfirm)} />
                    </div>
                    {regErrors.confirmPassword && <span className="auth-field-error">{regErrors.confirmPassword}</span>}
                    {regConfirm && regPassword && regConfirm !== regPassword && (
                      <span className="auth-field-error">Mật khẩu xác nhận không khớp</span>
                    )}
                    {regConfirm && regPassword && regConfirm === regPassword && regConfirm.length >= 8 && (
                      <span className="auth-field-success">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Mật khẩu khớp
                      </span>
                    )}
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-phone">Số điện thoại</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="auth-input"
                    placeholder="Số điện thoại (tuỳ chọn)"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    autoComplete="tel"
                  />
                  {regErrors.phone && <span className="auth-field-error">{regErrors.phone}</span>}
                </div>

                {/* Terms & Conditions */}
                <div className="auth-terms">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={regAcceptTerms}
                      onChange={(e) => setRegAcceptTerms(e.target.checked)}
                      className="auth-checkbox"
                    />
                    <span>
                      Tôi đồng ý với{" "}
                      <a href="#" className="auth-link" onClick={(e) => e.stopPropagation()}>
                        Điều khoản sử dụng
                      </a>{" "}
                      và{" "}
                      <a href="#" className="auth-link" onClick={(e) => e.stopPropagation()}>
                        Chính sách bảo mật
                      </a>
                    </span>
                  </label>
                </div>

                {globalError && <p className="auth-error">{globalError}</p>}

                <button type="submit" className="auth-submit" disabled={loading || !regAcceptTerms}>
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    "TẠO TÀI KHOẢN MỚI"
                  )}
                </button>
              </form>

              <div className="auth-switch">
                <span style={{ color: "var(--elx-gray)", fontSize: "0.9rem" }}>
                  Đã có tài khoản?{" "}
                </span>
                <button type="button" className="auth-link" onClick={() => switchView("login")}>
                  Đăng nhập ngay
                </button>
              </div>
            </>
          )}

          {/* ════════════════════ FORGOT PASSWORD ════════════════════ */}
          {view === "forgot" && (
            <>
              <h2 className="auth-title">Quên mật khẩu</h2>
              <p style={{ color: "var(--elx-gray)", marginBottom: 20, fontSize: "0.95rem" }}>
                Nhập email đăng ký tài khoản để nhận link đặt lại mật khẩu.
              </p>

              <form onSubmit={handleForgot}>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="forgot-email">Email*</label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="auth-input"
                    placeholder="example@gmail.com *"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                {globalError && <p className="auth-error">{globalError}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    "GỬI LINK ĐẶT LẠI"
                  )}
                </button>
              </form>

              <div className="auth-switch">
                <button type="button" className="auth-link" onClick={() => switchView("login")}>
                  ← Quay lại đăng nhập
                </button>
              </div>
            </>
          )}

          {/* ════════════════════ FORGOT SENT ════════════════════ */}
          {view === "forgotSent" && (
            <>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                </svg>
                <h2 className="auth-title">Kiểm tra email của bạn</h2>
                <p style={{ color: "var(--elx-gray)", marginBottom: 24, lineHeight: 1.6 }}>
                  Nếu email <strong>{forgotEmail}</strong> tồn tại trong hệ thống,
                  bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
                </p>
                <p style={{ color: "var(--elx-gray)", fontSize: "0.875rem" }}>
                  Không nhận được email? Kiểm tra thư mục spam hoặc thử lại.
                </p>
              </div>

              <div className="auth-switch" style={{ marginTop: 10 }}>
                <button type="button" className="auth-link" onClick={() => switchView("login")}>
                  ← Quay lại đăng nhập
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
