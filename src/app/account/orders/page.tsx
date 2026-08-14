import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "Lịch sử mua hàng | MyElectrolux",
  description: "Trang theo dõi và quản lý lịch sử mua hàng MyElectrolux.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
