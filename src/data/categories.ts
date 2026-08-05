import { STORAGE_URL } from "./siteData";

export const categoryRoutes: Record<string, string> = {
  "Máy giặt": "/thiet-bi/may-giat",
  "Máy sấy quần áo": "/thiet-bi/may-say",
  "Tủ lạnh": "/thiet-bi/tu-lanh",
  "Bếp nấu": "/thiet-bi/bep-nau",
  "Máy lọc không khí": "/thiet-bi/may-loc-khong-khi",
  "Máy hút bụi": "/thiet-bi/may-hut-bui",
};

export type CategoryFilter = {
  id: string;
  label: string;
  count: number;
};

export type CategoryProduct = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  img: string;
  price: number;
  oldPrice: number;
  features: string[];
  filters: string[];
  color?: string;
  capacity?: number;
  freeShipping?: boolean;
  freeInstallation?: boolean;
  installment0Percent?: boolean;
};

export type CategoryPageData = {
  slug: string;
  name: string;
  title: string;
  description: string;
  heroImage: string;
  heroImageMobile?: string;
  quickFilters: CategoryFilter[];
  sidebarFilters: {
    type: CategoryFilter[];
    features: { id: string; label: string }[];
    colors: { id: string; label: string; count: number }[];
    capacities: { id: string; label: string; count: number }[];
  };
  products: CategoryProduct[];
};

export const washingMachineCategory: CategoryPageData = {
  slug: "may-giat",
  name: "Máy giặt",
  title: "Mua Máy Giặt Electrolux Chính Hãng Giá Tốt 2026 Trả Góp 0%",
  description:
    "Khám phá dòng máy giặt Electrolux UltimateCare mới với công nghệ đột phá, giặt sạch 13kg quần áo chỉ trong 45 phút ở 30°C, nhanh chóng và tiết kiệm điện nước tối đa.",
  heroImage: "/plp/hero-may-giat.jpg",
  quickFilters: [
    { id: "all", label: "Tất cả", count: 12 },
    { id: "may-giat-10kg", label: "Máy giặt 10kg", count: 3 },
    { id: "may-giat-11kg", label: "Máy giặt 11kg", count: 2 },
    { id: "may-giat-cua-ngang", label: "Máy giặt cửa ngang", count: 7 },
    { id: "may-giat-cua-tren", label: "Máy giặt cửa trên", count: 1 },
    { id: "may-giat-say", label: "Máy giặt sấy", count: 3 },
  ],
  sidebarFilters: {
    type: [
      { id: "all", label: "Tất cả", count: 12 },
      { id: "may-giat-10kg", label: "Máy giặt 10kg", count: 3 },
      { id: "may-giat-11kg", label: "Máy giặt 11kg", count: 2 },
      { id: "may-giat-cua-ngang", label: "Máy giặt cửa ngang", count: 7 },
      { id: "may-giat-cua-tren", label: "Máy giặt cửa trên", count: 1 },
      { id: "may-giat-say", label: "Máy giặt sấy", count: 3 },
    ],
    features: [
      { id: "hygienic", label: "Giặt hơi nước HygienicCare diệt khuẩn" },
      { id: "quick45", label: "Giặt nhanh đầy tải 45 phút" },
    ],
    colors: [
      { id: "trang", label: "Trắng", count: 7 },
      { id: "xam-den", label: "Xám đen", count: 5 },
    ],
    capacities: [
      { id: "8-10", label: "Từ 8 tới 10 kg", count: 5 },
      { id: "11", label: "11 kg", count: 2 },
      { id: "13", label: "13 kg", count: 3 },
    ],
  },
  products: [
    {
      id: "1",
      slug: "eww9024p3wc",
      name: "Máy giặt sấy Electrolux giặt 9kg + sấy 6kg UltimateCare 300",
      sku: "EWW9024P3WC",
      img: "/plp/eww9024p3wc.jpg",
      price: 11990000,
      oldPrice: 14717455,
      features: ["Giặt hơi nước HygienicCare diệt khuẩn", "Giặt nhanh đầy tải 45 phút"],
      filters: ["may-giat-say", "may-giat-cua-ngang"],
      color: "trang",
      capacity: 9,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "2",
      slug: "eww1343r7wc",
      name: "Máy giặt sấy Electrolux giặt 13kg + sấy 9kg UltimateCare 700",
      sku: "EWW1343R7WC",
      img: "/plp/eww1343r7wc.jpg",
      price: 22990000,
      oldPrice: 25517455,
      features: ["Giặt hơi nước HygienicCare diệt khuẩn", "Giặt nhanh đầy tải 45 phút"],
      filters: ["may-giat-say", "may-giat-cua-ngang"],
      color: "trang",
      capacity: 13,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "3",
      slug: "eww1343p5sc",
      name: "Máy giặt sấy Electrolux giặt 13kg + sấy 7kg UltimateCare 500",
      sku: "EWW1343P5SC",
      img: "/plp/eww1343p5sc.jpg",
      price: 19990000,
      oldPrice: 23990000,
      features: ["Giặt hơi nước HygienicCare diệt khuẩn"],
      filters: ["may-giat-say", "may-giat-cua-ngang"],
      color: "xam-den",
      capacity: 13,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "4",
      slug: "ewf1023p5wc",
      name: "Máy giặt cửa trước 10kg UltimateCare 300",
      sku: "EWF1023P5WC",
      img: `${STORAGE_URL}/items/product-1.jpg`,
      price: 9990000,
      oldPrice: 12990000,
      features: ["Giặt nhanh đầy tải 45 phút"],
      filters: ["may-giat-10kg", "may-giat-cua-ngang"],
      color: "trang",
      capacity: 10,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "5",
      slug: "ewf9023p5wc",
      name: "Máy giặt cửa trước 9kg UltimateCare 500",
      sku: "EWF9023P5WC",
      img: `${STORAGE_URL}/items/product-2.jpg`,
      price: 11490000,
      oldPrice: 14490000,
      features: ["Giặt hơi nước HygienicCare diệt khuẩn"],
      filters: ["may-giat-cua-ngang"],
      color: "trang",
      capacity: 9,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "6",
      slug: "ewf9023p5sc",
      name: "Máy giặt cửa trước 9kg UltimateCare 500 SteamCare",
      sku: "EWF9023P5SC",
      img: `${STORAGE_URL}/items/product-3.jpg`,
      price: 12990000,
      oldPrice: 15990000,
      features: ["Giặt hơi nước HygienicCare diệt khuẩn", "Giặt nhanh đầy tải 45 phút"],
      filters: ["may-giat-cua-ngang"],
      color: "xam-den",
      capacity: 9,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "7",
      slug: "ewf1123p5wc",
      name: "Máy giặt cửa trước 11kg UltimateCare 500",
      sku: "EWF1123P5WC",
      img: `${STORAGE_URL}/items/product-1.jpg`,
      price: 13490000,
      oldPrice: 16490000,
      features: ["Giặt nhanh đầy tải 45 phút"],
      filters: ["may-giat-11kg", "may-giat-cua-ngang"],
      color: "trang",
      capacity: 11,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "8",
      slug: "ewf1123p5sc",
      name: "Máy giặt cửa trước 11kg UltimateCare 700 SteamCare",
      sku: "EWF1123P5SC",
      img: `${STORAGE_URL}/items/product-2.jpg`,
      price: 14990000,
      oldPrice: 17990000,
      features: ["Giặt hơi nước HygienicCare diệt khuẩn"],
      filters: ["may-giat-11kg", "may-giat-cua-ngang"],
      color: "xam-den",
      capacity: 11,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "9",
      slug: "ewf1023p5sc",
      name: "Máy giặt cửa trước 10kg UltimateCare 500 SteamCare",
      sku: "EWF1023P5SC",
      img: `${STORAGE_URL}/items/product-3.jpg`,
      price: 11990000,
      oldPrice: 14990000,
      features: ["Giặt hơi nước HygienicCare diệt khuẩn", "Giặt nhanh đầy tải 45 phút"],
      filters: ["may-giat-10kg", "may-giat-cua-ngang"],
      color: "xam-den",
      capacity: 10,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "10",
      slug: "ewf8023p5wc",
      name: "Máy giặt cửa trước 8kg UltimateCare 300",
      sku: "EWF8023P5WC",
      img: `${STORAGE_URL}/items/product-1.jpg`,
      price: 8990000,
      oldPrice: 10990000,
      features: ["Giặt nhanh đầy tải 45 phút"],
      filters: ["may-giat-cua-ngang"],
      color: "trang",
      capacity: 8,
      freeShipping: true,
      freeInstallation: false,
      installment0Percent: true,
    },
    {
      id: "11",
      slug: "ewt1023p5wc",
      name: "Máy giặt cửa trên 10kg UltimateCare 300",
      sku: "EWT1023P5WC",
      img: `${STORAGE_URL}/items/product-2.jpg`,
      price: 9490000,
      oldPrice: 11990000,
      features: [],
      filters: ["may-giat-10kg", "may-giat-cua-tren"],
      color: "trang",
      capacity: 10,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
    {
      id: "12",
      slug: "ewf1323p5wc",
      name: "Máy giặt cửa trước 13kg UltimateCare 700",
      sku: "EWF1323P5WC",
      img: `${STORAGE_URL}/items/product-3.jpg`,
      price: 16990000,
      oldPrice: 19990000,
      features: ["Giặt hơi nước HygienicCare diệt khuẩn", "Giặt nhanh đầy tải 45 phút"],
      filters: ["may-giat-cua-ngang"],
      color: "xam-den",
      capacity: 13,
      freeShipping: true,
      freeInstallation: true,
      installment0Percent: true,
    },
  ],
};
