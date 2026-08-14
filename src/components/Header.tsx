"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { popularSearchTags, megaMenu } from "@/data/siteData";
import { categoryRoutes } from "@/data/categories";

import AuthModal from "./AuthModal";
import { useToast } from "./Toast";
import { useCart } from "./CartContext";

import {
  IconShirt,
  IconKitchen,
  IconBlender,
  IconAirPurifier,
  IconBathtub,
  IconTag,
  IconGift,
  IconTools,
  IconShield,
  IconPhoneCircle,
  IconCalendar,
  IconClipboard,
  IconDoc,
  IconToolbox,
} from "./MenuIcons";

type HeaderProps = {
  navItems: string[];
};

function getNavHref(item: string) {
  if (item === "Hỗ trợ") {
    return "/support";
  }

  if (item === "Blog") {
    return "/blog";
  }

  return "#";
}

/* ============================================================
   MENU ICONS
============================================================ */

const MENU_ICONS: Record<string, ReactNode> = {
  shirt: <IconShirt />,
  kitchen: <IconKitchen />,
  blender: <IconBlender />,
  airPurifier: <IconAirPurifier />,
  air_purifier: <IconAirPurifier />,
  bathtub: <IconBathtub />,
  tag: <IconTag />,
  gift: <IconGift />,
  tools: <IconTools />,
  shield: <IconShield />,
  phoneCircle: <IconPhoneCircle />,
  phone_circle: <IconPhoneCircle />,
  calendar: <IconCalendar />,
  clipboard: <IconClipboard />,
  doc: <IconDoc />,
  toolbox: <IconToolbox />,
};

/* ============================================================
   HEADER
============================================================ */

export default function Header({ navItems }: HeaderProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { count, openCart } = useCart();

  /* ============================================================
     STATE
  ============================================================ */

  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const [userDropdown, setUserDropdown] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);

  /* ============================================================
     REFS
  ============================================================ */

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ============================================================
     AUTH REQUIRED
  ============================================================ */

  useEffect(() => {
    const url = new URL(window.location.href);
    const authRequired = url.searchParams.get("authRequired");
    const adminForbidden = url.searchParams.get("adminForbidden");

    if (authRequired !== "true" && adminForbidden !== "true") {
      return;
    }

    if (authRequired === "true" && session?.user) {
      return;
    }

    url.searchParams.delete("authRequired");
    url.searchParams.delete("adminForbidden");
    url.searchParams.set("view", "customer");

    router.replace(url.pathname + url.search, {
      scroll: false,
    });

    const timer = window.setTimeout(() => {
      if (adminForbidden === "true") {
        showToast(
          "Tai khoan cua ban khong co quyen truy cap trang quan tri.",
          "error"
        );
        return;
      }

      setAuthView("login");
      setAuthOpen(true);

      showToast(
        "Vui lòng đăng nhập để tiếp tục.",
        "info"
      );
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    session,
    showToast,
    router,
  ]);

  /* ============================================================
     ESC KEY
  ============================================================ */

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setAuthOpen(false);
        setUserDropdown(false);
        setActiveNav(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, []);

  /* ============================================================
     CLICK OUTSIDE USER DROPDOWN
  ============================================================ */

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target as Node
        )
      ) {
        setUserDropdown(false);
      }
    };

    if (userDropdown) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [userDropdown]);

  /* ============================================================
     LOCK BODY WHEN AUTH MODAL IS OPEN
  ============================================================ */

  useEffect(() => {
    document.body.style.overflow = authOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [authOpen]);

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = useCallback(async () => {
    setUserDropdown(false);

    await signOut({
      redirect: false,
    });

    await update();

    showToast(
      "Đã đăng xuất thành công.",
      "info"
    );
  }, [showToast, update]);

  /* ============================================================
     OPEN AUTH
  ============================================================ */

  const openAuth = (
    view: "login" | "register"
  ) => {
    setAuthView(view);
    setAuthOpen(true);
  };

  /* ============================================================
     USER INITIALS
  ============================================================ */

  const getUserInitials = () => {
    if (!session?.user) {
      return "";
    }

    const first =
      session.user.firstName?.[0] || "";

    const last =
      session.user.lastName?.[0] || "";

    return (
      first + last
    ).toUpperCase();
  };

  /* ============================================================
     MEGA MENU
  ============================================================ */

  const handleNavEnter = (item: string) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
    }

    if (megaMenu[item]) {
      setActiveNav(item);
    }
  };

  const handleNavLeave = () => {
    leaveTimer.current = setTimeout(() => {
      setActiveNav(null);
    }, 120);
  };

  const handleMegaEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
    }
  };

  const handleMegaLeave = () => {
    leaveTimer.current = setTimeout(() => {
      setActiveNav(null);
    }, 120);
  };

  const activeSection = activeNav
    ? megaMenu[activeNav]
    : null;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div
        style={{
          background: "var(--elx-navy)",
          color: "#fff",
          fontSize: "1.075rem",
        }}
      >
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
          <a
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#fff",
            }}
          >
            Chọn vị trí của bạn
          </a>
        </div>
      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        style={{
          background: "#fff",
          borderBottom:
            "1px solid var(--elx-border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* ====================================================
            MAIN HEADER ROW
        ==================================================== */}

        <div
          style={{
            maxWidth: "100%",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            height: 85,
          }}
        >
          {/* ==================================================
              LOGO + MOBILE MENU
          ================================================== */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() =>
                setMobileMenu(
                  (value) => !value
                )
              }
              aria-label="Menu"
              className="md-hide-hamburger"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              {mobileMenu ? (
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--elx-navy)"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="var(--elx-navy)"
                >
                  <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
                </svg>
              )}
            </button>

            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
              <Image src="/electrolux_logo.svg" alt="Electrolux Vietnam" width={156} height={38} style={{ height: "auto" }} priority />
            </Link>
          </div>

          {/* ==================================================
              SEARCH
          ================================================== */}

          {searchOpen ? (
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
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#888"
                strokeWidth="2"
                style={{
                  flexShrink: 0,
                }}
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />
                <path d="M21 21l-4.35-4.35" />
              </svg>

              <input
                autoFocus
                type="text"
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "1.2rem",
                  color:
                    "var(--elx-navy)",
                  background:
                    "transparent",
                }}
              />

              {searchQuery && (
                <button
                  onClick={() =>
                    setSearchQuery("")
                  }
                  aria-label="Xóa tìm kiếm"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#aaa",
                    fontSize: "1.3rem",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            /* ==================================================
               DESKTOP NAVIGATION
            ================================================== */

            <nav
              className="desktop-nav"
              style={{
                display: "flex",
                gap: 0,
                alignItems: "center",
              }}
            >
              {navItems.map((item) => (
                <div
                  key={item}
                  className="nav-item-wrapper"
                  onMouseEnter={() =>
                    handleNavEnter(item)
                  }
                  onMouseLeave={
                    handleNavLeave
                  }
                  style={{
                    position: "relative",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  <a
                    href={getNavHref(item)}
                    className={`nav-link${
                      activeNav === item
                        ? " nav-link--active"
                        : ""
                    }`}
                    style={{
                      padding:
                        "24px 25px",
                      fontWeight: 600,
                      fontSize:
                        "1.18rem",
                      color:
                        "var(--elx-navy)",
                      position:
                        "relative",
                      whiteSpace:
                        "nowrap",
                      display: "block",
                    }}
                  >
                    {item}

                    {/* Underline */}
                    {activeNav === item && (
                      <span className="nav-link__underline" />
                    )}
                  </a>
                </div>
              ))}
            </nav>
          )}

          {/* ==================================================
              HEADER ICONS
          ================================================== */}

          <div
            className="header-icons"
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {/* Search button */}

            <button
              aria-label="Tìm kiếm"
              onClick={() => {
                setSearchOpen(
                  (value) => !value
                );

                if (searchOpen) {
                  setSearchQuery("");
                }
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {searchOpen ? (
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--elx-navy)"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--elx-navy)"
                  strokeWidth="2"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                  />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              )}
            </button>

            {/* Wishlist */}

            <button
              aria-label="Yêu thích"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--elx-navy)"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>

            {/* ==================================================
                USER
            ================================================== */}

            {session?.user ? (
              <div
                className="user-dropdown"
                ref={dropdownRef}
              >
                <button
                  aria-label="Tài khoản"
                  onClick={() =>
                    setUserDropdown(
                      (value) => !value
                    )
                  }
                  className="user-avatar-btn"
                >
                  <span className="user-avatar">
                    {getUserInitials()}
                  </span>
                </button>

                {userDropdown && (
                  <div className="user-dropdown__menu">
                    <div className="user-dropdown__header">
                      <div className="user-dropdown__name">
                        {
                          session.user
                            .firstName
                        }{" "}
                        {
                          session.user
                            .lastName
                        }
                      </div>

                      <div className="user-dropdown__email">
                        {
                          session.user
                            .email
                        }
                      </div>
                    </div>

                    <a
                      href="/account"
                      className="user-dropdown__item"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle
                          cx="12"
                          cy="7"
                          r="4"
                        />
                      </svg>

                      Tài khoản của tôi
                    </a>

                    <a
                      href="/account/orders"
                      className="user-dropdown__item"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="2"
                          y="3"
                          width="20"
                          height="14"
                          rx="2"
                        />
                        <path d="M8 21h8M12 17v4" />
                      </svg>

                      Đơn hàng của tôi
                    </a>

                    <a
                      href="/account/wishlist"
                      className="user-dropdown__item"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>

                      Yêu thích
                    </a>

                    <div className="user-dropdown__divider" />

                    <button
                      className="user-dropdown__item user-dropdown__item--danger"
                      onClick={
                        handleLogout
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line
                          x1="21"
                          y1="12"
                          x2="9"
                          y2="12"
                        />
                      </svg>

                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                aria-label="Tài khoản"
                onClick={() =>
                  openAuth("login")
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--elx-navy)"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                </svg>
              </button>
            )}

            {/* Cart */}
            <button
              aria-label="Giỏ hàng"
              onClick={openCart}
              style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}
            >
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
                {count}
              </span>
            </button>

            {/* ==================================================
                LANGUAGE
            ================================================== */}

            <a
              className="header-lang"
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color:
                  "var(--elx-navy)",
                fontWeight: 600,
                fontSize: "1.15rem",
                borderLeft:
                  "1px solid var(--elx-border)",
                paddingLeft: 16,
              }}
            >
              <Image src="/flag-vn.png" alt="VN" width={26} height={18} style={{ height: "auto" }} /> Tiếng Việt ›
            </a>
          </div>
        </div>

        {/* ====================================================
            MOBILE NAVIGATION
        ==================================================== */}

        <div
          className={`mobile-nav${
            mobileMenu
              ? " mobile-nav--open"
              : ""
          }`}
        >
          {navItems.map((item) => (
            <a
              key={item}
              href={getNavHref(item)}
              onClick={() =>
                setMobileMenu(false)
              }
            >
              {item}
            </a>
          ))}

          {!session?.user && (
            <div className="mobile-nav__auth">
              <button
                onClick={() => {
                  setMobileMenu(false);
                  openAuth("login");
                }}
                className="mobile-nav__auth-btn"
              >
                Đăng nhập
              </button>

              <button
                onClick={() => {
                  setMobileMenu(false);
                  openAuth("register");
                }}
                className="mobile-nav__auth-btn mobile-nav__auth-btn--outline"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>

        {/* ====================================================
            SEARCH DROPDOWN
        ==================================================== */}

        {searchOpen && (
          <div
            className="search-dropdown-enter search-dropdown-mobile"
            style={{
              borderTop:
                "1px solid var(--elx-border)",
              background: "#fff",
              padding: "16px",
              boxShadow:
                "0 6px 20px rgba(0,0,0,0.08)",
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color:
                  "var(--elx-navy)",
                marginBottom: 10,
              }}
            >
              Tìm kiếm phổ biến
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {popularSearchTags.map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSearchQuery(tag)
                    }
                    style={{
                      background:
                        "#f4f6f8",
                      border:
                        "1px solid #e0e4ea",
                      borderRadius: 20,
                      padding:
                        "6px 15px",
                      fontSize:
                        "1.075rem",
                      color:
                        "var(--elx-navy)",
                      cursor:
                        "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            MEGA MENU
        ==================================================== */}

        {activeNav &&
          activeSection && (
            <div
              ref={megaMenuRef}
              className="mega-menu"
              onMouseEnter={
                handleMegaEnter
              }
              onMouseLeave={
                handleMegaLeave
              }
            >
              {/* Default layout */}

              {activeSection.layout ===
                "default" && (
                <div className="mega-menu__inner">
                  {activeSection.categories.map(
                    (cat) => (
                      <div
                        key={cat.title}
                        className="mega-menu__col"
                      >
                        <div className="mega-menu__col-header">
                          <span className="mega-menu__col-icon">
                            {MENU_ICONS[
                              cat.icon
                            ] ?? null}
                          </span>

                          <span className="mega-menu__col-title">
                            {cat.title}
                          </span>
                        </div>

                        <ul className="mega-menu__list">
                          {cat.items.map(
                            (sub) => {
                              const href =
                                categoryRoutes[
                                  sub
                                ] ?? "#";

                              return (
                                <li
                                  key={
                                    sub
                                  }
                                >
                                  <Link
                                    href={
                                      href
                                    }
                                    className="mega-menu__item"
                                  >
                                    {
                                      sub
                                    }
                                  </Link>
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Circular layout */}

              {activeSection.layout ===
                "circular" && (
                <div className="mega-menu__circular">
                  {activeSection.items.map(
                    (item) => (
                      <a
                        key={
                          item.label
                        }
                        href="#"
                        className="mega-menu__circle-item"
                      >
                        <span className="mega-menu__circle-icon">
                          {MENU_ICONS[
                            item.icon
                          ] ?? null}
                        </span>

                        <span className="mega-menu__circle-label">
                          {
                            item.label
                          }
                        </span>
                      </a>
                    )
                  )}
                </div>
              )}
            </div>
          )}
      </header>

      {/* ======================================================
          SEARCH DIM
      ====================================================== */}

      {searchOpen && (
        <div
          className="search-dim"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 39,
            background:
              "rgba(0,0,0,0.4)",
            marginTop: 106,
          }}
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        />
      )}

      {/* ======================================================
          MEGA MENU BACKDROP
      ====================================================== */}

      {activeNav && (
        <div
          className="mega-menu-dim"
          onClick={() =>
            setActiveNav(null)
          }
        />
      )}

      {/* ======================================================
          AUTH MODAL
      ====================================================== */}

      <AuthModal
        key={`${authView}-${
          authOpen
            ? "open"
            : "closed"
        }`}
        isOpen={authOpen}
        onClose={() =>
          setAuthOpen(false)
        }
        initialView={authView}
      />
    </>
  );
}
