export type MaintenanceServiceItem = {
  variantId: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
};

export const maintenanceServiceFallback: MaintenanceServiceItem[] = [
  { variantId: "00000000-0000-4000-8000-000000000301", sku: "23675", name: "Vệ sinh máy giặt sấy từ 10kg tại nhà", slug: "ve-sinh-may-giat-say-tu-10kg-tai-nha", price: 930000, imageUrl: "/dichvubaoduong.jpg" },
  { variantId: "00000000-0000-4000-8000-000000000302", sku: "23674", name: "Vệ sinh máy giặt sấy dưới 10kg tại nhà", slug: "ve-sinh-may-giat-say-duoi-10kg-tai-nha", price: 830000, imageUrl: "/dichvubaoduong.jpg" },
  { variantId: "00000000-0000-4000-8000-000000000303", sku: "23673", name: "Vệ sinh máy giặt từ 10kg tại nhà", slug: "ve-sinh-may-giat-tu-10kg-tai-nha", price: 740000, imageUrl: "/dichvubaoduong.jpg" },
  { variantId: "00000000-0000-4000-8000-000000000304", sku: "23672", name: "Vệ sinh máy giặt dưới 10kg tại nhà", slug: "ve-sinh-may-giat-duoi-10kg-tai-nha", price: 640000, imageUrl: "/dichvubaoduong.jpg" },
  { variantId: "00000000-0000-4000-8000-000000000305", sku: "23671", name: "Vệ sinh máy sấy bơm nhiệt tại nhà", slug: "ve-sinh-may-say-bom-nhiet-tai-nha", price: 640000, imageUrl: "/dichvubaoduong.jpg" },
  { variantId: "00000000-0000-4000-8000-000000000306", sku: "23670", name: "Vệ sinh máy sấy ngưng tụ tại nhà", slug: "ve-sinh-may-say-ngung-tu-tai-nha", price: 540000, imageUrl: "/dichvubaoduong.jpg" },
  { variantId: "00000000-0000-4000-8000-000000000307", sku: "23669", name: "Vệ sinh máy sấy thông hơi tại nhà", slug: "ve-sinh-may-say-thong-hoi-tai-nha", price: 440000, imageUrl: "/dichvubaoduong.jpg" },
];
