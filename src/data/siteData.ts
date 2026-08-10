/* ── Supabase Storage base URL ── */
export const STORAGE_URL =
  "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products";

/* ── Hero slider data ── */
export const heroSlides = [
  {
    img: `${STORAGE_URL}/heroes/hero-banner-1.jpg`,
    title: "SALE LỚN GIỮA NĂM\nNÂNG TẦM TỔ ẤM",
    desc: "Số lượng ưu đãi có hạn",
    cta: "Mua Ngay",
    href: "#",
  },
  {
    img: `${STORAGE_URL}/heroes/hero-banner-2.jpg`,
    title: "Wash life balance",
    desc: "Máy giặt Electrolux mới giúp bạn giặt sạch cả tủ quần áo nhanh hơn",
    cta: "Khám phá ngay",
    href: "#",
  },
  {
    img: `${STORAGE_URL}/heroes/hero-banner-3.jpg`,
    title: "Tủ lạnh AI AutoSense",
    desc: "Tiết kiệm điện đến 10%",
    cta: "KHÁM PHÁ NGAY",
    href: "#",
  },
  {
    img: `${STORAGE_URL}/heroes/hero-banner-4.png`,
    title: "SẤY KHÔ HIỆU QUẢ\nGẤP 3 LẦN",
    desc: "Bộ sưu tập Máy rửa bát UltimateCare 300",
    cta: "Khám phá ngay",
    href: "#",
  },
  {
    img: `${STORAGE_URL}/heroes/hero-banner-5.png`,
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
  { icon: "/icon-washing-machine.svg", name: "Máy giặt" },
  { icon: "/icon-dryer.svg", name: "Máy sấy quần áo" },
  { icon: "/icon-fridge.svg", name: "Tủ lạnh" },
  { icon: "/icon-hob.svg", name: "Bếp nấu" },
  { icon: "/icon-air-purifier.svg", name: "Máy lọc không khí" },
  { icon: "/icon-dehumidifier.svg", name: "Máy hút ẩm" },
  { icon: "/icon-vacuum.svg", name: "Máy hút bụi" },
  { icon: "/icon-dishwasher.svg", name: "Máy rửa bát" },
  { icon: "/icon-oven.svg", name: "Lò nướng" },
  { icon: "/icon-hood.svg", name: "Máy hút mùi" },
  { icon: "/icon-rice-cooker.svg", name: "Nồi cơm điện" },
  { icon: "/icon-kettle.svg", name: "Bình đun siêu tốc" },
  { icon: "/icon-blender.svg", name: "Máy xay sinh tố" },
  { icon: "/icon-water-dispenser.svg", name: "Cây nước nóng lạnh" },
  { icon: "/icon-iron.svg", name: "Bàn ủi" },
  { icon: "/icon-water-heater.svg", name: "Máy nước nóng" },
];

/* ── Best-seller products ── */
export const products = [
  {
    variantId: "bdd9f65d-b6f8-4dac-9e90-e8df342452e0",
    img: `${STORAGE_URL}/items/product-1.jpg`,
    name: "Máy giặt cửa trước 10kg UltimateCare 300",
    sku: "EWF1023P5WC",
    price: "9.990.000₫",
    oldPrice: "12.990.000₫",
    badge: "GIẢM 23%",
  },
  {
    variantId: "77d21379-3912-46e1-a807-70265907814b",
    img: `${STORAGE_URL}/items/product-2.jpg`,
    name: "Máy giặt cửa trước 9kg UltimateCare 500",
    sku: "EWF9023P5WC",
    price: "11.490.000₫",
    oldPrice: "14.490.000₫",
    badge: "GIẢM 21%",
  },
  {
    variantId: "504826ae-ab11-4ccf-ac52-55a7e7115a6e",
    img: `${STORAGE_URL}/items/product-3.jpg`,
    name: "Máy giặt cửa trước 9kg UltimateCare 500",
    sku: "EWF9023P5SC",
    price: "12.990.000₫",
    oldPrice: "15.990.000₫",
    badge: "GIẢM 19%",
  },
  {
    variantId: "d4a794c0-8505-4c2c-b374-a84f54e962e1",
    img: `${STORAGE_URL}/items/product-4.jpg`,
    name: "Máy sấy cửa trước 8kg UltimateCare 300",
    sku: "EDV804H3WC",
    price: "8.990.000₫",
    oldPrice: "11.490.000₫",
    badge: "GIẢM 22%",
  },
];

/* ── Header navigation items ── */
export const navItems = ["Sản phẩm", "Dịch vụ", "Hỗ trợ", "Khuyến mại", "Blog"];

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
      img: `${STORAGE_URL}/banners/ultimatecare.png`,
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
      img: `${STORAGE_URL}/banners/warranty.jpg`,
      title: "Đăng ký bảo hành điện tử",
      desc:
        "Đăng ký bảo hành cho thiết bị Electrolux của bạn ngay hôm nay để được hỗ trợ nhanh chóng, tận hưởng dịch vụ chăm sóc khách hàng tận tình cùng nhiều ưu đãi hấp dẫn.",
      cta: "Đăng ký bảo hành ngay",
      href: "#",
    },
    {
      img: `${STORAGE_URL}/banners/refrigerators.jpg`,
      title: "Giải pháp bảo quản thực phẩm chuyên nghiệp",
      desc:
        "Giữ thực phẩm tươi ngon lâu hơn với công nghệ làm lạnh tiên tiến từ tủ lạnh Electrolux, luôn sẵn sàng cho những bữa ăn ngon.",
      cta: "Xem thêm",
      href: "#",
    },
  ],
  // Hàng 3: 1 ảnh full-width
  row3: {
    img: `${STORAGE_URL}/banners/blog-banner.jpg`,
    title: "Gói đăng ký định kỳ hiện đã có",
    desc:
      "Tận hưởng những lợi ích của Gói đăng ký hiện tại: giao hàng miễn phí và giảm giá cho các sản phẩm được chọn.",
    cta: "Tìm hiểu thêm",
    href: "#",
  },
};