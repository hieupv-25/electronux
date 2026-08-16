export type Promotion = {
  id: string;
  slug: string;
  title: string;
  period: string;
  startDate: string;
  endDate: string;
  image: string;
  description: string;
  highlights: string[];
  terms?: string[];
};

export const promotionsData: Promotion[] = [
  {
    id: "promo-birthday",
    slug: "uu-dai-thang-sinh-nhat",
    title: "Ưu Đãi Tháng Sinh Nhật Ngập Tràn",
    period: "Thời gian áp dụng: 01/08/2026 - 31/08/2026",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    image: "/promotions/promo1_hd.png",
    description:
      "Mừng tháng sinh nhật Electrolux, giảm giá cực sốc lên đến 40% cho các dòng sản phẩm máy giặt, máy sấy, tủ lạnh và máy hút bụi. Trợ giá đổi mới thêm 5%, miễn phí giao hàng & lắp đặt tận nơi cùng chương trình MUA 1 TẶNG 1 siêu giá trị.",
    highlights: [
      "Trợ giá đổi mới giảm thêm 5%",
      "Ưu đãi giá trực tiếp lên đến 40%",
      "Miễn phí 100% giao hàng & lắp đặt tận nhà",
      "Chương trình MUA 1 TẶNG 1 quà tặng gia dụng hấp dẫn",
    ],
    terms: [
      "Áp dụng cho tất cả khách hàng mua hàng trực tuyến hoặc tại showroom chính thức.",
      "Không áp dụng đồng thời với các chương trình khuyến mại xả kho khác.",
      "Quà tặng MUA 1 TẶNG 1 có số lượng giới hạn theo từng dòng sản phẩm.",
    ],
  },
  {
    id: "promo-induction-installation",
    slug: "cat-da-lap-dat-mien-phi-bep-tu",
    title: "Chương trình Cắt đá và Lắp đặt miễn phí sản phẩm Bếp Từ Electrolux",
    period: "Thời gian áp dụng: 01/04/2026 - 31/12/2026",
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    image: "/promotions/promo2_hd.png",
    description:
      "Nâng cấp căn bếp sang trọng với dòng Bếp Từ Electrolux cao cấp. Khách hàng khi mua sản phẩm bếp từ Electrolux sẽ nhận ngay gói quà tặng miễn phí khảo sát, hỗ trợ cắt đá mặt bếp chuẩn kích thước và 100% phí lắp đặt bởi đội ngũ kỹ thuật viên chuyên nghiệp.",
    highlights: [
      "Miễn phí khảo sát không gian bếp tận nhà",
      "Miễn phí 100% công cắt đá theo chuẩn kỹ thuật",
      "Miễn phí lắp đặt và kết nối điện an toàn",
      "Bảo hành chính hãng 24 tháng tại nhà",
    ],
    terms: [
      "Chương trình áp dụng cho tất cả mã sản phẩm Bếp Từ Electrolux.",
      "Kỹ thuật viên sẽ liên hệ hẹn giờ khảo sát và thi công trong vòng 24h - 48h.",
      "Dịch vụ cắt đá áp dụng cho chất liệu đá tự nhiên và đá nhân tạo tiêu chuẩn.",
    ],
  },
];
