"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { popularSearchTags } from "@/data/siteData";

type HeaderProps = {
  navItems: string[];
};

export default function Header({ navItems }: HeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Đóng search khi nhấn Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [searchOpen]);

  return (
    <>
      {/* ====== TOP BAR ====== */}
      <div style={{ background: "var(--elx-navy)", color: "#fff", fontSize: "1.075rem" }}>
        <div
          style={{
            maxWidth: "100%",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            height: 40,
          }}
        >
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
            <svg width="12" height="16" viewBox="0 0 10 14" fill="none">
              <path
                d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 115 3.5a1.5 1.5 0 010 3z"
                fill="#fff"
              />
            </svg>
            Chọn vị trí của bạn
          </a>
        </div>
      </div>

      {/* ====== HEADER / NAV ====== */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--elx-border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 85,
          }}
        >
          {/* ── LEFT: Hamburger + Logo ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Hamburger (chỉ hiện trên mobile qua CSS) */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Menu"
              className="md-hide-hamburger"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              {mobileMenu ? (
                <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="27" height="27" viewBox="0 0 24 24" fill="var(--elx-navy)">
                  <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
                </svg>
              )}
            </button>
            <a href="/" style={{ display: "flex", alignItems: "center" }}>
              <Image src="/electrolux_logo.svg" alt="Electrolux Vietnam" width={156} height={38} priority />
            </a>
          </div>

          {/* ── CENTER: Desktop Nav OR Search Input ── */}
          {searchOpen ? (
            /* Inline Search Input */
            <div
              className="search-bar-enter"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "#f4f6f8",
                borderRadius: 8,
                padding: "0 16px",
                height: 48,
                gap: 10,
                margin: "0 16px",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "1.2rem",
                  color: "var(--elx-navy)",
                  background: "transparent",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "1.3rem", lineHeight: 1 }}
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            /* Desktop Nav — ẩn trên mobile qua CSS class */
            <nav className="desktop-nav" style={{ display: "flex", gap: 0, alignItems: "center" }}>
              {navItems.map((item) => (
                <a
                  key={item}
                  href={item === "Hỗ trợ" ? "/support" : "#"}
                  style={{
                    padding: "24px 25px",
                    fontWeight: 600,
                    fontSize: "1.18rem",
                    color: "var(--elx-navy)",
                    position: "relative",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>
          )}

          {/* ── RIGHT: Icons + Language ── */}
          <div className="header-icons" style={{ display: "flex", gap: 18, alignItems: "center", flexShrink: 0 }}>
            {/* Search toggle */}
            <button
              aria-label="Tìm kiếm"
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) setSearchQuery("");
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {searchOpen ? (
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              )}
            </button>
            {/* Wishlist */}
            <button aria-label="Yêu thích" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
            {/* Profile */}
            <button aria-label="Tài khoản" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            {/* Cart */}
            <button aria-label="Giỏ hàng" style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}>
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="var(--elx-navy)" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#ff3a30",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                0
              </span>
            </button>
            {/* Language — ẩn trên mobile qua CSS class */}
            <a
              className="header-lang"
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "var(--elx-navy)",
                fontWeight: 600,
                fontSize: "1.15rem",
                borderLeft: "1px solid var(--elx-border)",
                paddingLeft: 16,
              }}
            >
              <Image src="/flag-vn.png" alt="VN" width={26} height={18} /> Tiếng Việt ›
            </a>
          </div>
        </div>

        {/* ── Mobile Nav Drawer ── */}
        <div className={`mobile-nav${mobileMenu ? " mobile-nav--open" : ""}`}>
          {navItems.map((item) => (
            <a key={item} href="#" onClick={() => setMobileMenu(false)}>
              {item}
            </a>
          ))}
        </div>

        {/* ── Popular Searches Dropdown ── */}
        {searchOpen && (
          <div
            className="search-dropdown-enter search-dropdown-mobile"
            style={{
              borderTop: "1px solid var(--elx-border)",
              background: "#fff",
              padding: "16px 16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--elx-navy)", marginBottom: 10 }}>
              Tìm kiếm phổ biến
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {popularSearchTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  style={{
                    background: "#f4f6f8",
                    border: "1px solid #e0e4ea",
                    borderRadius: 20,
                    padding: "6px 15px",
                    fontSize: "1.075rem",
                    color: "var(--elx-navy)",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop to close search on outside click */}
      {searchOpen && (
        <div
          className="search-dim"
          style={{ position: "fixed", inset: 0, zIndex: 39, background: "rgba(0,0,0,0.4)", marginTop: 106 }}
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        />
      )}
    </>
  );
}
