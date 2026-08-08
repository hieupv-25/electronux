/* ── Public asset base path for local images ── */
export const STORAGE_URL = "";

/* ── Hero slider data ── */
export const heroSlides = [
  {
    img: "/hero-banner-1.jpg",
    title: "SALE LỚN GIỮA NĂM\nNÂNG TẦM TỔ ẤM",
    desc: "Số lượng ưu đãi có hạn",
    cta: "Mua Ngay",
    href: "#",
  },
  {
    img: "/hero-banner-2.jpg",
    title: "Wash life balance",
    desc: "Máy giặt Electrolux mới giúp bạn giặt sạch cả tủ quần áo nhanh hơn",
    cta: "Khám phá ngay",
    href: "#",
  },
  {
    img: "/hero-banner-3.jpg",
    title: "Tủ lạnh AI AutoSense",
    desc: "Tiết kiệm điện đến 10%",
    cta: "KHÁM PHÁ NGAY",
    href: "#",
  },
  {
    img: "/hero-banner-4.png",
    title: "SẤY KHÔ HIỆU QUẢ\nGẤP 3 LẦN",
    desc: "Bộ sưu tập Máy rửa bát UltimateCare 300",
    cta: "Khám phá ngay",
    href: "#",
  },
  {
    img: "/hero-banner-5.png",
    title: "Thu cũ đổi mới dễ dàng\nGiảm thêm 5%",
    desc: "Khi sắm thiết bị mới",
    cta: "Khám phá ngay!",
    href: "#",
  },
];

/* ── Service banner (below header) ── */
export const services = [
  { icon: "/icon-free-shipping.svg", text: "Miễn phí vận chuyển" },
  { icon: "/icon-free-install.svg", text: "Miễn phí lắp đặt" },
  { icon: "/icon-installment.svg", text: "Trả góp 0%" },
];

/* ── Product categories ── */
export const categories = [
  { icon: "/icon-washing-machine.svg", name: "Máy giặt", href: "/thiet-bi/may-giat" },
  { icon: "/icon-dryer.svg", name: "Máy sấy quần áo", href: "/thiet-bi/may-say" },
  { icon: "/icon-fridge.svg", name: "Tủ lạnh", href: "/thiet-bi/tu-lanh" },
  { icon: "/icon-hob.svg", name: "Bếp nấu", href: "/thiet-bi/bep-nau" },
  { icon: "/icon-air-purifier.svg", name: "Máy lọc không khí", href: "/thiet-bi/may-loc-khong-khi" },
  { icon: "/icon-dehumidifier.svg", name: "Máy hút ẩm", href: "/thiet-bi/may-hut-am" },
  { icon: "/icon-vacuum.svg", name: "Máy hút bụi", href: "/thiet-bi/may-hut-bui" },
  { icon: "/icon-dishwasher.svg", name: "Máy rửa bát", href: "#" },
  { icon: "/icon-oven.svg", name: "Lò nướng", href: "#" },
  { icon: "/icon-hood.svg", name: "Máy hút mùi", href: "#" },
  { icon: "/icon-rice-cooker.svg", name: "Nồi cơm điện", href: "/thiet-bi/noi-com-dien" },
  { icon: "/icon-kettle.svg", name: "Bình đun siêu tốc", href: "#" },
  { icon: "/icon-blender.svg", name: "Máy xay sinh tố", href: "#" },
  { icon: "/icon-water-dispenser.svg", name: "Cây nước nóng lạnh", href: "#" },
  { icon: "/icon-iron.svg", name: "Bàn ủi", href: "#" },
  { icon: "/icon-water-heater.svg", name: "Máy nước nóng", href: "/thiet-bi/may-nuoc-nong" },
];

/* ── Best-seller products ── */
export const products = [
  {
    img: "/product-1.jpg",
    name: "Máy giặt cửa trước 10kg UltimateCare 300",
    sku: "EWF1023P5WC",
    price: "9.990.000₫",
    oldPrice: "12.990.000₫",
    badge: "GIẢM 23%",
  },
  {
    img: "/product-2.jpg",
    name: "Máy giặt cửa trước 9kg UltimateCare 500",
    sku: "EWF9023P5WC",
    price: "11.490.000₫",
    oldPrice: "14.490.000₫",
    badge: "GIẢM 21%",
  },
  {
    img: "/product-3.jpg",
    name: "Máy giặt cửa trước 9kg UltimateCare 500",
    sku: "EWF9023P5SC",
    price: "12.990.000₫",
    oldPrice: "15.990.000₫",
    badge: "GIẢM 19%",
  },
  {
    img: "/product-4.jpg",
    name: "Máy sấy cửa trước 8kg UltimateCare 300",
    sku: "EDV804H3WC",
    price: "8.990.000₫",
    oldPrice: "11.490.000₫",
    badge: "GIẢM 22%",
  },
];

/* ── Header navigation items ── */
export const navItems = ["Sản phẩm", "Dịch vụ", "Hỗ trợ", "Khuyến mại", "Blog"];

/* ── Mega menu data ── */
export type MegaCategory = {
  icon: string; // key maps to SVG icon in MenuIcons.tsx
  title: string;
  items: string[];
};

export type MegaCircularItem = {
  icon: string;
  label: string;
};

export type MegaMenuSection =
  | { layout: "default"; categories: MegaCategory[] }
  | { layout: "circular"; items: MegaCircularItem[] };

export type MegaMenuData = {
  [navItem: string]: MegaMenuSection;
};

export const megaMenu: MegaMenuData = {
  "Sản phẩm": {
    layout: "default",
    categories: [
      {
        icon: "shirt",
        title: "Chăm sóc trang phục",
        items: ["Máy giặt", "Máy sấy quần áo"],
      },
      {
        icon: "kitchen",
        title: "Sản phẩm nhà bếp",
        items: ["Tủ lạnh", "Bếp nấu"],
      },
      {
        icon: "blender",
        title: "Gia dụng nhỏ",
        items: ["Nồi cơm điện", "Máy xay sinh tố"],
      },
      {
        icon: "airpurifier",
        title: "Giải pháp không khí",
        items: ["Máy lọc không khí", "Máy hút ẩm"],
      },
      {
        icon: "bathtub",
        title: "Thiết bị phòng tắm",
        items: ["Máy nước nóng trực tiếp", "Máy nước nóng gián tiếp"],
      },
    ],
  },
  "Dịch vụ": {
    layout: "default",
    categories: [
      {
        icon: "tools",
        title: "Dịch vụ thu phí",
        items: ["Dịch vụ bảo dưỡng", "Sửa chữa giá cố định"],
      },
      {
        icon: "shield",
        title: "Gia hạn bảo hành",
        items: ["Gia hạn bảo hành"],
      },
    ],
  },
  "Hỗ trợ": {
    layout: "circular",
    items: [
      { icon: "phone-circle",   label: "Liên hệ chúng tôi" },
      { icon: "calendar",       label: "Đặt lịch hẹn bảo hành" },
      { icon: "clipboard",      label: "Đăng ký bảo hành điện tử" },
      { icon: "doc",            label: "Chính sách bảo hành" },
      { icon: "toolbox",        label: "Xử lý sự cố" },
    ],
  },
  "Khuyến mại": {
    layout: "default",
    categories: [
      {
        icon: "tag",
        title: "Ưu đãi đặc biệt",
        items: ["Flash Sale hàng ngày", "Mua nhiều giảm nhiều"],
      },
      {
        icon: "gift",
        title: "Quà tặng & Voucher",
        items: ["Voucher giảm giá", "Quà tặng kèm"],
      },
    ],
  },
};

/* ── Footer link sections ── */
export const footerSections = [
  {
    title: "Sản phẩm",
    links: [
      "Máy giặt",
      "Máy sấy quần áo",
      "Tủ lạnh",
      "Bếp nấu",
      "Máy lọc không khí",
      "Máy hút bụi",
    ],
  },
  {
    title: "Dịch vụ",
    links: [
      "Đặt lịch sửa chữa",
      "Đăng ký sản phẩm",
      "Gia hạn bảo hành",
      "Hỗ trợ khách hàng",
      "Câu hỏi thường gặp",
    ],
  },
  {
    title: "Về Electrolux",
    links: ["Giới thiệu", "Bền vững", "Tin tức", "Tuyển dụng", "Liên hệ"],
  },
];

/* ── Popular search tags (used in header search dropdown) ── */
export const popularSearchTags = [
  "tủ lạnh",
  "máy giặt",
  "máy lọc không khí",
  "nồi chiên không dầu",
  "bếp từ",
  "lò vi sóng",
  "máy sấy quần áo",
];

/* ── Promo bento grid (ảnh + thẻ nền tối + 2 ảnh nhỏ + 1 ảnh full-width) ── */
export const promoBento = {
  // Hàng 1: ảnh bên trái + thẻ chữ nền tối bên phải
  row1: {
    image: {
      img: "/ultimatecare.png",
      alt: "Máy giặt sấy Electrolux UltimateCare",
    },
    dark: {
      title: "Bộ sưu tập UltimateCare thế hệ mới",
      desc:
        "Giải pháp chăm sóc quần áo toàn diện, giúp quần áo của bạn luôn bền đẹp, đồng thời tiết kiệm thời gian và công sức với dòng sản phẩm giặt sấy UltimateCare thế hệ mới từ Electrolux.",
      cta: "Khám phá ngay",
      href: "#",
    },
  },
  // Hàng 2: 2 ảnh có chữ, kích thước nhỏ hơn
  row2: [
    {
      img: "/warranty.jpg",
      title: "Đăng ký bảo hành điện tử",
      desc:
        "Đăng ký bảo hành cho thiết bị Electrolux của bạn ngay hôm nay để được hỗ trợ nhanh chóng, tận hưởng dịch vụ chăm sóc khách hàng tận tình cùng nhiều ưu đãi hấp dẫn.",
      cta: "Đăng ký bảo hành ngay",
      href: "#",
    },
    {
      img: "/refrigerators.jpg",
      title: "Giải pháp bảo quản thực phẩm chuyên nghiệp",
      desc:
        "Giữ thực phẩm tươi ngon lâu hơn với công nghệ làm lạnh tiên tiến từ tủ lạnh Electrolux, luôn sẵn sàng cho những bữa ăn ngon.",
      cta: "Xem thêm",
      href: "#",
    },
  ],
  // Hàng 3: 1 ảnh full-width
  row3: {
    img: "/blog-banner.jpg",
    title: "Gói đăng ký định kỳ hiện đã có",
    desc:
      "Tận hưởng những lợi ích của Gói đăng ký hiện tại: giao hàng miễn phí và giảm giá cho các sản phẩm được chọn.",
    cta: "Tìm hiểu thêm",
    href: "#",
  },
};