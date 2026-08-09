import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
  title: "Tài khoản MyElectrolux | Electrolux Vietnam",
  description: "Trang quản lý chi tiết thông tin cá nhân và tài khoản MyElectrolux.",
};

export default function AccountPage() {
  return <AccountClient />;
}
