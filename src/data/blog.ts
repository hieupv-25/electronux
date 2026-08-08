import { STORAGE_URL } from "./siteData";

export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  readTime: string;
  author: string;
  featured?: boolean;
  tags: string[];
  sections: {
    heading: string;
    body: string[];
  }[];
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "cham-soc-quan-ao",
    name: "Chăm sóc quần áo",
    description: "Mẹo giặt, sấy và giữ phom vải bền đẹp hơn mỗi ngày.",
  },
  {
    slug: "nha-bep",
    name: "Nhà bếp",
    description: "Cách bảo quản thực phẩm, nấu nướng và tối ưu thiết bị bếp.",
  },
  {
    slug: "khong-gian-song",
    name: "Không gian sống",
    description: "Gợi ý vận hành thiết bị gia dụng tiết kiệm và tiện nghi.",
  },
  {
    slug: "huong-dan-mua-sam",
    name: "Hướng dẫn mua sắm",
    description: "Kinh nghiệm chọn sản phẩm phù hợp với nhu cầu gia đình.",
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "giat-do-mua-am-khong-bi-mui",
    title: "Giặt đồ mùa ẩm: cách giữ quần áo thơm tho và khô nhanh hơn",
    excerpt:
      "Những bước nhỏ trong phân loại, chọn chương trình giặt và sấy giúp quần áo hạn chế mùi ẩm, đồng thời bền màu hơn.",
    category: "cham-soc-quan-ao",
    coverImage: `${STORAGE_URL}/banners/ultimatecare.png`,
    publishedAt: "2026-07-18",
    readTime: "6 phút đọc",
    author: "Electrolux Care Team",
    featured: true,
    tags: ["Máy giặt", "Máy sấy", "Chăm sóc vải"],
    sections: [
      {
        heading: "Phân loại theo chất liệu trước khi giặt",
        body: [
          "Quần áo cotton, đồ thể thao và vải mỏng nên được giặt theo nhóm riêng để chọn tốc độ vắt, nhiệt độ nước và lượng chất giặt phù hợp.",
          "Với đồ dễ bám mùi, hãy tránh nhồi quá đầy lồng giặt. Không gian chuyển động đủ rộng giúp nước và chất giặt đi qua sợi vải tốt hơn.",
        ],
      },
      {
        heading: "Ưu tiên chương trình giặt nhanh khi đồ ít bẩn",
        body: [
          "Nếu quần áo chỉ bám mồ hôi nhẹ, chương trình giặt nhanh giúp giảm thời gian ẩm trong lồng giặt mà vẫn làm sạch hiệu quả.",
          "Sau khi giặt xong, nên lấy đồ ra ngay. Đây là thói quen đơn giản nhưng giảm đáng kể mùi ẩm trong những ngày mưa kéo dài.",
        ],
      },
      {
        heading: "Sấy đúng mức để giữ phom vải",
        body: [
          "Chọn chế độ sấy cảm biến cho đồ mặc hằng ngày để máy tự điều chỉnh thời gian theo độ ẩm thực tế.",
          "Với đồ len, lụa hoặc trang phục có chi tiết trang trí, hãy đọc nhãn chăm sóc trước khi dùng máy sấy.",
        ],
      },
    ],
  },
  {
    slug: "bao-quan-thuc-pham-tuoi-lau-trong-tu-lanh",
    title: "Bảo quản thực phẩm tươi lâu hơn trong tủ lạnh gia đình",
    excerpt:
      "Sắp xếp thực phẩm theo vùng nhiệt, giữ luồng khí lạnh thông thoáng và dùng hộp kín đúng cách để giảm lãng phí.",
    category: "nha-bep",
    coverImage: `${STORAGE_URL}/banners/refrigerators.jpg`,
    publishedAt: "2026-07-11",
    readTime: "5 phút đọc",
    author: "Electrolux Kitchen Lab",
    featured: true,
    tags: ["Tủ lạnh", "Bảo quản thực phẩm", "Nhà bếp"],
    sections: [
      {
        heading: "Đặt thực phẩm đúng vùng nhiệt",
        body: [
          "Thực phẩm tươi sống nên ở ngăn mát sâu hoặc ngăn chuyên biệt, trong khi đồ ăn đã nấu chín cần được đậy kín trước khi cho vào tủ.",
          "Cánh tủ thường dao động nhiệt nhiều hơn, phù hợp với gia vị, nước uống và các sản phẩm ít nhạy cảm với nhiệt độ.",
        ],
      },
      {
        heading: "Đừng chặn luồng khí lạnh",
        body: [
          "Tủ lạnh hoạt động hiệu quả hơn khi có khoảng trống giữa các hộp thực phẩm. Việc xếp quá dày khiến hơi lạnh khó lưu thông.",
          "Nên kiểm tra định kỳ thực phẩm gần hết hạn để ưu tiên sử dụng trước và giữ tủ luôn gọn.",
        ],
      },
      {
        heading: "Dùng hộp kín để giữ ẩm và mùi",
        body: [
          "Hộp kín giúp rau củ ít mất nước và hạn chế mùi từ thực phẩm mạnh như hải sản, phô mai hoặc món đã tẩm gia vị.",
          "Khi cất đồ nóng, hãy để nguội bớt trước khi cho vào tủ để tránh làm tăng nhiệt độ bên trong.",
        ],
      },
    ],
  },
  {
    slug: "chon-may-loc-khong-khi-cho-can-ho",
    title: "Chọn máy lọc không khí cho căn hộ: nên nhìn vào chỉ số nào?",
    excerpt:
      "Diện tích phòng, tốc độ làm sạch và độ ồn là ba yếu tố quan trọng khi chọn máy lọc không khí cho gia đình.",
    category: "khong-gian-song",
    coverImage: `${STORAGE_URL}/heroes/hero-banner-3.jpg`,
    publishedAt: "2026-06-28",
    readTime: "7 phút đọc",
    author: "Electrolux Home Expert",
    tags: ["Máy lọc không khí", "Căn hộ", "Sức khỏe"],
    sections: [
      {
        heading: "Bắt đầu từ diện tích phòng",
        body: [
          "Một máy lọc phù hợp cần có công suất tương thích với diện tích phòng thực tế. Phòng khách mở thường cần mức lưu lượng khí cao hơn phòng ngủ.",
          "Nếu phòng có nhiều bụi mịn hoặc gần đường lớn, hãy chọn thiết bị có nhiều cấp tốc độ để linh hoạt theo từng thời điểm trong ngày.",
        ],
      },
      {
        heading: "Độ ồn quan trọng với phòng ngủ",
        body: [
          "Chế độ ngủ yên tĩnh giúp máy vận hành xuyên đêm mà ít ảnh hưởng đến giấc ngủ.",
          "Bạn cũng nên đặt máy ở vị trí thoáng, tránh ép sát tường hoặc bị rèm che kín cửa hút gió.",
        ],
      },
      {
        heading: "Bảo dưỡng bộ lọc đúng lịch",
        body: [
          "Bộ lọc bẩn làm giảm hiệu quả lọc và khiến máy phải hoạt động mạnh hơn.",
          "Hãy theo dõi cảnh báo thay lọc hoặc ghi chú lịch kiểm tra định kỳ dựa trên mức độ sử dụng thực tế.",
        ],
      },
    ],
  },
  {
    slug: "may-giat-9kg-hay-10kg",
    title: "Gia đình 3-4 người nên chọn máy giặt 9kg hay 10kg?",
    excerpt:
      "Khối lượng giặt phù hợp phụ thuộc vào số người, tần suất giặt và thói quen giặt chăn ga, đồ dày.",
    category: "huong-dan-mua-sam",
    coverImage: `${STORAGE_URL}/items/product-1.jpg`,
    publishedAt: "2026-06-20",
    readTime: "4 phút đọc",
    author: "Electrolux Buying Guide",
    tags: ["Máy giặt", "Hướng dẫn mua", "Gia đình"],
    sections: [
      {
        heading: "Máy 9kg phù hợp với nhu cầu hằng ngày",
        body: [
          "Nếu gia đình giặt thường xuyên và chủ yếu là quần áo mặc hằng ngày, máy giặt 9kg thường đã đủ thoải mái.",
          "Lựa chọn này giúp tiết kiệm diện tích hơn, đặc biệt với căn hộ có khu giặt nhỏ.",
        ],
      },
      {
        heading: "Máy 10kg linh hoạt hơn cho đồ dày",
        body: [
          "Nếu bạn thường giặt khăn lớn, chăn mỏng hoặc gom đồ vài ngày mới giặt, thêm 1kg sức chứa sẽ tạo ra khác biệt rõ.",
          "Khoảng trống trong lồng giặt cũng giúp đồ chuyển động tốt hơn, tránh bị xoắn chặt.",
        ],
      },
      {
        heading: "Đừng chỉ nhìn vào số kg",
        body: [
          "Hãy cân nhắc thêm kích thước máy, chương trình giặt nhanh, tính năng hơi nước và khả năng tiết kiệm điện nước.",
          "Một chiếc máy phù hợp là chiếc máy hòa vào nhịp sinh hoạt của gia đình, không chỉ lớn hơn trên thông số.",
        ],
      },
    ],
  },
  {
    slug: "ve-sinh-may-say-dung-cach",
    title: "Vệ sinh máy sấy đúng cách để máy chạy êm và bền hơn",
    excerpt:
      "Làm sạch lưới lọc xơ vải, kiểm tra khoang sấy và giữ đường thoát khí thông thoáng giúp máy sấy ổn định hơn.",
    category: "cham-soc-quan-ao",
    coverImage: `${STORAGE_URL}/items/product-4.jpg`,
    publishedAt: "2026-06-05",
    readTime: "5 phút đọc",
    author: "Electrolux Care Team",
    tags: ["Máy sấy", "Bảo dưỡng", "Chăm sóc thiết bị"],
    sections: [
      {
        heading: "Làm sạch lưới lọc sau mỗi lần sấy",
        body: [
          "Xơ vải tích tụ làm luồng khí nóng lưu thông kém, khiến thời gian sấy kéo dài và máy tiêu thụ nhiều điện hơn.",
          "Sau mỗi mẻ sấy, hãy lấy lưới lọc ra, gom xơ vải và lắp lại đúng vị trí.",
        ],
      },
      {
        heading: "Kiểm tra đồ sót trong khoang sấy",
        body: [
          "Tiền xu, kẹp tóc hoặc vật nhỏ có thể gây tiếng ồn và làm xước lồng sấy.",
          "Thói quen kiểm tra túi áo quần trước khi giặt sấy sẽ giúp bảo vệ cả quần áo lẫn thiết bị.",
        ],
      },
      {
        heading: "Đặt máy ở nơi thông thoáng",
        body: [
          "Không gian xung quanh máy cần đủ thoáng để nhiệt thoát ra ổn định.",
          "Nếu máy báo lỗi hoặc thời gian sấy tăng bất thường, hãy kiểm tra lọc, tải trọng và liên hệ trung tâm hỗ trợ khi cần.",
        ],
      },
    ],
  },
  {
    slug: "toi-uu-dien-nang-khi-dung-bep-tu",
    title: "Tối ưu điện năng khi dùng bếp từ trong bữa ăn hằng ngày",
    excerpt:
      "Chọn đúng đáy nồi, mức nhiệt và thói quen nấu giúp bếp từ vận hành hiệu quả mà vẫn giữ món ăn ngon.",
    category: "nha-bep",
    coverImage: `${STORAGE_URL}/banners/blog-banner.jpg`,
    publishedAt: "2026-05-26",
    readTime: "4 phút đọc",
    author: "Electrolux Kitchen Lab",
    tags: ["Bếp từ", "Tiết kiệm điện", "Nấu ăn"],
    sections: [
      {
        heading: "Dùng nồi có đáy phẳng và đúng kích thước",
        body: [
          "Đáy nồi tiếp xúc tốt với vùng nấu giúp truyền nhiệt nhanh và đều hơn.",
          "Nếu nồi quá nhỏ so với vùng nấu, hiệu quả gia nhiệt có thể giảm và thời gian nấu kéo dài.",
        ],
      },
      {
        heading: "Tăng nhiệt nhanh, sau đó hạ mức phù hợp",
        body: [
          "Bếp từ phản hồi nhiệt nhanh, vì vậy bạn có thể dùng mức cao lúc đầu rồi hạ nhiệt khi món ăn đã đạt trạng thái mong muốn.",
          "Đậy nắp khi đun nước hoặc hầm món cũng là cách đơn giản để tiết kiệm thời gian.",
        ],
      },
      {
        heading: "Giữ mặt bếp sạch sau khi nấu",
        body: [
          "Mặt bếp sạch giúp nồi tiếp xúc ổn định hơn và hạn chế vết bám cháy khó vệ sinh.",
          "Nên lau khi bếp đã nguội, dùng khăn mềm và dung dịch phù hợp với mặt kính.",
        ],
      },
    ],
  },
];

export function getBlogCategory(slug: string) {
  return blogCategories.find((category) => category.slug === slug);
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(post: BlogPost) {
  return blogPosts
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 3);
}
