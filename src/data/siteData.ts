export const STORAGE_URL =
  "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products";

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

export const services = [
  { icon: "/icon-free-shipping.svg", text: "Miễn phí vận chuyển" },
  { icon: "/icon-free-install.svg", text: "Miễn phí lắp đặt" },
  { icon: "/icon-installment.svg", text: "Trả góp 0%" },
];

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
  { icon: "/icon-blender.svg", name: "Máy xay sinh tố", href: "/thiet-bi/may-xay-sinh-to" },
  { icon: "/icon-water-dispenser.svg", name: "Cây nước nóng lạnh", href: "#" },
  { icon: "/icon-iron.svg", name: "Bàn ủi", href: "#" },
  { icon: "/icon-water-heater.svg", name: "Máy nước nóng", href: "/thiet-bi/may-nuoc-nong" },
];

export const featuredProducts = [
  {
    id: "home-1",
    variantId: "demo-variant-1",
    slug: "ewf1023p5wc",
    img: `${STORAGE_URL}/items/product-1.jpg`,
    name: "Máy giặt cửa trước 10kg UltimateCare 300",
    sku: "EWF1023P5WC",
    price: 9990000,
    oldPrice: 12990000,
    features: ["Giặt nhanh 45 phút", "Công nghệ HygienicCare"],
    filters: ["may-giat-10kg"],
    color: "trang",
    capacity: 10,
    freeShipping: true,
    freeInstallation: true,
    installment0Percent: true,
  },
  {
    id: "home-2",
    variantId: "demo-variant-2",
    slug: "ewf9023p5wc",
    img: `${STORAGE_URL}/items/product-2.jpg`,
    name: "Máy giặt cửa trước 9kg UltimateCare 500",
    sku: "EWF9023P5WC",
    price: 11490000,
    oldPrice: 14490000,
    features: ["AI SensorWash", "Giặt hơi nước VapourCare"],
    filters: ["may-giat-9kg"],
    color: "trang",
    capacity: 9,
    freeShipping: true,
    freeInstallation: true,
    installment0Percent: true,
  },
  {
    id: "home-3",
    variantId: "demo-variant-3",
    slug: "ewf9023p5sc",
    img: `${STORAGE_URL}/items/product-3.jpg`,
    name: "Máy giặt cửa trước 9kg UltimateCare 500",
    sku: "EWF9023P5SC",
    price: 12990000,
    oldPrice: 15990000,
    features: ["UltraMix hòa tan chất giặt", "Lồng giặt Lily"],
    filters: ["may-giat-9kg"],
    color: "xam-den",
    capacity: 9,
    freeShipping: true,
    freeInstallation: true,
    installment0Percent: true,
  },
  {
    id: "home-4",
    variantId: "demo-variant-4",
    slug: "edv804h3wc",
    img: `${STORAGE_URL}/items/product-4.jpg`,
    name: "Máy sấy cửa trước 8kg UltimateCare 300",
    sku: "EDV804H3WC",
    price: 8990000,
    oldPrice: 11490000,
    features: ["Sấy cảm biến Smart Sensor", "Chống nhăn Easy Iron"],
    filters: ["may-say-8kg"],
    color: "trang",
    capacity: 8,
    freeShipping: true,
    freeInstallation: true,
    installment0Percent: true,
  },
];

export const products = featuredProducts;

export const navItems = ["Sản phẩm", "Dịch vụ", "Hỗ trợ", "Khuyến mại", "Blog"];

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

export const popularSearchTags = [
  "tủ lạnh",
  "máy giặt",
  "máy lọc không khí",
  "nồi chiên không dầu",
  "bếp từ",
  "lò vi sóng",
  "máy sấy quần áo",
];

export const promoBento = {
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
  row3: {
    img: `${STORAGE_URL}/banners/blog-banner.jpg`,
    title: "Gói đăng ký định kỳ hiện đã có",
    desc:
      "Tận hưởng những lợi ích của Gói đăng ký hiện tại: giao hàng miễn phí và giảm giá cho các sản phẩm được chọn.",
    cta: "Tìm hiểu thêm",
    href: "#",
  },
};

type MegaMenuCategory = {
  title: string;
  icon: string;
  items: string[];
};

type MegaMenuCircleItem = {
  label: string;
  icon: string;
};

type MegaMenuSection =
  | {
      layout: "default";
      categories: MegaMenuCategory[];
    }
  | {
      layout: "circular";
      items: MegaMenuCircleItem[];
    };

export const megaMenu: Record<string, MegaMenuSection> = {
  "Sản phẩm": {
    layout: "default",
    categories: [
      {
        title: "Chăm sóc quần áo",
        icon: "shirt",
        items: ["Máy giặt", "Máy sấy quần áo", "Máy giặt sấy"],
      },
      {
        title: "Thiết bị nhà bếp",
        icon: "kitchen",
        items: ["Tủ lạnh", "Bếp nấu", "Máy rửa bát", "Lò nướng", "Máy hút mùi"],
      },
      {
        title: "Gia dụng nhỏ",
        icon: "blender",
        items: ["Nồi cơm điện", "Bình đun siêu tốc", "Máy xay sinh tố"],
      },
      {
        title: "Không khí và nước",
        icon: "airPurifier",
        items: ["Máy lọc không khí", "Máy hút ẩm", "Máy hút bụi", "Máy nước nóng"],
      },
    ],
  },
  "Dịch vụ": {
    layout: "circular",
    items: [
      { label: "Đặt lịch sửa chữa", icon: "calendar" },
      { label: "Đăng ký sản phẩm", icon: "clipboard" },
      { label: "Gia hạn bảo hành", icon: "shield" },
      { label: "Tư vấn mua hàng", icon: "phoneCircle" },
    ],
  },
  "Hỗ trợ": {
    layout: "circular",
    items: [
      { label: "Trung tâm hỗ trợ", icon: "tools" },
      { label: "Chính sách bảo hành", icon: "doc" },
      { label: "Câu hỏi thường gặp", icon: "toolbox" },
      { label: "Liên hệ", icon: "phoneCircle" },
    ],
  },
  "Khuyến mại": {
    layout: "circular",
    items: [
      { label: "Ưu đãi đang diễn ra", icon: "tag" },
      { label: "Quà tặng", icon: "gift" },
      { label: "Trả góp 0%", icon: "clipboard" },
    ],
  },
};
