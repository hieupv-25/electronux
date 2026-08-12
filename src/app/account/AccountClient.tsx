"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { useToast } from "@/components/Toast";
import { navItems, footerSections } from "@/data/siteData";

type Address = {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  isDefault: boolean;
};

export default function AccountClient() {
  const { data: session, update: updateSession } = useSession();
  const { showToast } = useToast();

  // Loading state
  const [loading, setLoading] = useState(true);

  // User Profile State
  const [firstName, setFirstName] = useState(session?.user?.firstName || "viv");
  const [lastName, setLastName] = useState(session?.user?.lastName || "vietttishnl");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(session?.user?.email || "xyzpokef@gmail.com");

  // Address List State
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Modals / Edit Mode States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newAddressPhone, setNewAddressPhone] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newCity, setNewCity] = useState("Hồ Chí Minh");
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Marketing subscription checkboxes state
  const [promoEmail, setPromoEmail] = useState(false);
  const [promoPhone, setPromoPhone] = useState(false);
  const [promoSMS, setPromoSMS] = useState(false);
  const [promoMail, setPromoMail] = useState(false);
  const [promoOptIn, setPromoOptIn] = useState(false);

  // Fetch initial profile & addresses from database
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setFirstName(data.user.firstName || "");
            setLastName(data.user.lastName || "");
            setPhone(data.user.phone || "");
            setEmail(data.user.email || "");
            setAddresses(data.user.addresses || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  // Handler 1: Update Profile
  const handleOpenEditProfile = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setEditPhone(phone);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-profile",
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Cập nhật thất bại", "error");
        return;
      }

      setFirstName(data.user.firstName);
      setLastName(data.user.lastName);
      setPhone(data.user.phone || "");
      setIsEditingProfile(false);
      await updateSession();
      showToast("Cập nhật thông tin thành công!", "success");
    } catch (err) {
      showToast("Đã xảy ra lỗi kết nối.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handler 2: Change Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      showToast("Mật khẩu mới phải có ít nhất 8 ký tự.", "error");
      return;
    }

    if (currentPassword === newPassword) {
      showToast("Mật khẩu mới không được trùng với mật khẩu hiện tại.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp.", "error");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Đổi mật khẩu thất bại", "error");
        return;
      }

      showToast("Đổi mật khẩu thành công!", "success");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast("Đã xảy ra lỗi kết nối.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  // Handler 3: Add New Address
  const handleOpenAddAddress = () => {
    setNewRecipientName(`${firstName} ${lastName}`.trim());
    setNewAddressPhone(phone);
    setNewAddressLine("");
    setNewCity("Hà Nội");
    setNewIsDefault(addresses.length === 0);
    setIsAddingAddress(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRecipientName.trim() || !newAddressPhone.trim() || !newAddressLine.trim()) {
      showToast("Vui lòng điền đầy đủ các thông tin địa chỉ.", "error");
      return;
    }

    setSavingAddress(true);

    try {
      const res = await fetch("/api/account/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: newRecipientName,
          phone: newAddressPhone,
          addressLine: newAddressLine,
          city: newCity,
          isDefault: newIsDefault,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Thêm địa chỉ thất bại.", "error");
        return;
      }

      if (newIsDefault) {
        setAddresses((prev) =>
          prev.map((addr) => ({ ...addr, isDefault: false }))
        );
      }

      setAddresses((prev) => [data.address, ...prev]);
      setIsAddingAddress(false);
      showToast("Đã thêm địa chỉ giao hàng mới!", "success");
    } catch (err) {
      showToast("Đã xảy ra lỗi kết nối.", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  // Handler 4: Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      const res = await fetch(`/api/account/address?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Xóa thất bại.", "error");
        return;
      }

      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      showToast("Đã xóa địa chỉ thành công.", "info");
    } catch (err) {
      showToast("Đã xảy ra lỗi kết nối.", "error");
    }
  };

  return (
    <>
      <Header navItems={navItems} />

      <main className="account-container">
        <h1 className="account-heading">Tài khoản MyElectrolux</h1>

        <div className="account-layout">
          {/* ====== SIDEBAR ====== */}
          <AccountSidebar activeHref="/account" />

          {/* ====== CONTENT AREA ====== */}
          <div className="account-content">
            {/* 1. THÔNG TIN CÁ NHÂN */}
            <section className="account-card">
              <div className="account-card__header">
                <h2>Thông tin cá nhân</h2>
                {!isEditingProfile && (
                  <button className="account-card__edit-btn" onClick={handleOpenEditProfile}>
                    SỬA
                  </button>
                )}
              </div>
              <div className="account-card__body">
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="account-form">
                    <div className="account-form-row">
                      <label>Tên</label>
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="account-form-row">
                      <label>Họ</label>
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="account-form-row">
                      <label>Số điện thoại</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Nhập số điện thoại của bạn"
                      />
                    </div>
                    <div className="account-form-actions">
                      <button type="submit" className="account-btn-solid" disabled={savingProfile}>
                        {savingProfile ? "Đang lưu..." : "LƯU THAY ĐỔI"}
                      </button>
                      <button
                        type="button"
                        className="account-btn-outline"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        HỦY
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="account-field-grid">
                      <div className="account-field__label">Tên</div>
                      <div className="account-field__value">{firstName}</div>

                      <div className="account-field__label">Họ</div>
                      <div className="account-field__value">{lastName}</div>

                      <div className="account-field__label">Số điện thoại</div>
                      <div className="account-field__value">{phone || "Chưa cập nhật"}</div>

                      <div className="account-field__label">Email</div>
                      <div className="account-field__value">{email}</div>
                    </div>

                    <div className="account-card__action">
                      <button
                        className="account-btn-outline"
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                      >
                        {isChangingPassword ? "ĐÓNG FORM ĐỔI MẬT KHẨU" : "ĐỔI MẬT KHẨU"}
                      </button>
                    </div>
                  </>
                )}

                {/* FORM ĐỔI MẬT KHẨU */}
                {isChangingPassword && !isEditingProfile && (
                  <form onSubmit={handleSavePassword} className="account-form account-form--password">
                    <h3 className="account-form__title">Đổi mật khẩu</h3>
                    <div className="account-form-row">
                      <label>Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="account-form-row">
                      <label>Mật khẩu mới</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự, có chữ hoa, thường & số"
                        required
                      />
                    </div>
                    <div className="account-form-row">
                      <label>Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="account-form-actions">
                      <button type="submit" className="account-btn-solid" disabled={savingPassword}>
                        {savingPassword ? "Đang xử lý..." : "CẬP NHẬT MẬT KHẨU"}
                      </button>
                      <button
                        type="button"
                        className="account-btn-outline"
                        onClick={() => setIsChangingPassword(false)}
                      >
                        HỦY
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* 2. ĐỊA CHỈ GIAO HÀNG */}
            <section className="account-card">
              <div className="account-card__header">
                <h2>Địa chỉ giao hàng</h2>
              </div>
              <div className="account-card__body">
                {addresses.length > 0 ? (
                  <div className="account-address-list">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="account-address-item">
                        <div className="account-address-item__main">
                          <div className="account-address-item__name">
                            <strong>{addr.recipientName}</strong> ({addr.phone})
                            {addr.isDefault && <span className="account-badge">Mặc định</span>}
                          </div>
                          <div className="account-address-item__text">
                            {addr.addressLine}, {addr.city}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="account-address-item__delete"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="account-card__desc">
                    Vui lòng thêm và lưu lại địa chỉ giao hàng của bạn để thao tác thanh toán nhanh hơn{" "}
                    <button type="button" onClick={handleOpenAddAddress} className="account-card__link-btn">
                      Thêm địa chỉ mới
                    </button>
                  </p>
                )}

                {isAddingAddress ? (
                  <form onSubmit={handleSaveAddress} className="account-form account-form--address">
                    <h3 className="account-form__title">Thêm địa chỉ giao hàng mới</h3>
                    <div className="account-form-row">
                      <label>Tên người nhận</label>
                      <input
                        type="text"
                        value={newRecipientName}
                        onChange={(e) => setNewRecipientName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="account-form-row">
                      <label>Số điện thoại</label>
                      <input
                        type="text"
                        value={newAddressPhone}
                        onChange={(e) => setNewAddressPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="account-form-row">
                      <label>Địa chỉ chi tiết (Số nhà, Tên đường, Phường/Xã)</label>
                      <input
                        type="text"
                        value={newAddressLine}
                        onChange={(e) => setNewAddressLine(e.target.value)}
                        placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Phường 2"
                        required
                      />
                    </div>
                    <div className="account-form-row">
                      <label>Tỉnh / Thành phố</label>
                      <select value={newCity} onChange={(e) => setNewCity(e.target.value)}>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Hải Phòng">Hải Phòng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div className="account-form-row account-form-row--checkbox">
                      <label className="account-checkbox">
                        <input
                          type="checkbox"
                          checked={newIsDefault}
                          onChange={(e) => setNewIsDefault(e.target.checked)}
                        />
                        <span className="account-checkbox__checkmark" />
                        Đặt làm địa chỉ giao hàng mặc định
                      </label>
                    </div>
                    <div className="account-form-actions">
                      <button type="submit" className="account-btn-solid" disabled={savingAddress}>
                        {savingAddress ? "Đang lưu..." : "THÊM ĐỊA CHỈ"}
                      </button>
                      <button
                        type="button"
                        className="account-btn-outline"
                        onClick={() => setIsAddingAddress(false)}
                      >
                        HỦY
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="account-card__action">
                    <button className="account-btn-outline" onClick={handleOpenAddAddress}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 300, lineHeight: 1 }}>+</span> THÊM ĐỊA CHỈ MỚI
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 3. CHI TIẾT THANH TOÁN THẺ */}
            <section className="account-card">
              <div className="account-card__header">
                <h2>Chi tiết thanh toán thẻ</h2>
              </div>
              <div className="account-card__body">
                <div className="account-card__action">
                  <button
                    className="account-btn-outline"
                    onClick={() => showToast("Chức năng đang được cập nhật", "info")}
                  >
                    THÊM THẺ MỚI
                  </button>
                </div>
              </div>
            </section>

            {/* 4. ĐĂNG KÝ NHẬN THÔNG TIN QUẢNG CÁO */}
            <section className="account-card">
              <div className="account-card__header">
                <h2>Đăng ký nhận thông tin quảng cáo</h2>
                <button
                  className="account-card__edit-btn"
                  onClick={() => showToast("Cấu hình thông báo đã được lưu.", "success")}
                >
                  LƯU
                </button>
              </div>
              <div className="account-card__body">
                <div className="account-toggle-row">
                  <button
                    type="button"
                    className={`account-switch ${promoOptIn ? "account-switch--on" : ""}`}
                    onClick={() => setPromoOptIn(!promoOptIn)}
                  >
                    <span className="account-switch__handle" />
                  </button>
                  <p className="account-toggle-text">
                    Đừng bỏ lỡ thông tin về sản phẩm mới, ưu đãi và khuyến mãi đặc biệt. Bằng cách chọn "Có", bạn đồng ý nhận những thông tin nói trên.
                  </p>
                </div>

                <div className="account-checkbox-group">
                  <label className="account-checkbox">
                    <input
                      type="checkbox"
                      checked={promoEmail}
                      onChange={(e) => setPromoEmail(e.target.checked)}
                    />
                    <span className="account-checkbox__checkmark" />
                    Qua Email
                  </label>

                  <label className="account-checkbox">
                    <input
                      type="checkbox"
                      checked={promoPhone}
                      onChange={(e) => setPromoPhone(e.target.checked)}
                    />
                    <span className="account-checkbox__checkmark" />
                    Qua Điện thoại
                  </label>

                  <label className="account-checkbox">
                    <input
                      type="checkbox"
                      checked={promoSMS}
                      onChange={(e) => setPromoSMS(e.target.checked)}
                    />
                    <span className="account-checkbox__checkmark" />
                    Qua tin nhắn
                  </label>

                  <label className="account-checkbox">
                    <input
                      type="checkbox"
                      checked={promoMail}
                      onChange={(e) => setPromoMail(e.target.checked)}
                    />
                    <span className="account-checkbox__checkmark" />
                    Qua bưu điện
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}
