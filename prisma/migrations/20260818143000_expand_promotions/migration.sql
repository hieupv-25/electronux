ALTER TABLE "Promotion"
ADD COLUMN "slug" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "highlights" JSONB,
ADD COLUMN "terms" JSONB,
ADD COLUMN "linkUrl" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Promotion"
SET "slug" = lower(regexp_replace("id", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

ALTER TABLE "Promotion" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Promotion_slug_key" ON "Promotion"("slug");
CREATE INDEX "Promotion_isActive_startDate_endDate_idx" ON "Promotion"("isActive", "startDate", "endDate");

INSERT INTO "Promotion" (
  "id",
  "slug",
  "title",
  "discountPercentage",
  "description",
  "highlights",
  "terms",
  "startDate",
  "endDate",
  "bannerImageUrl",
  "linkUrl",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  'promo-birthday',
  'uu-dai-thang-sinh-nhat',
  'Ưu Đãi Tháng Sinh Nhật Ngập Tràn',
  40,
  'Mừng tháng sinh nhật Electrolux, giảm giá cực sốc lên đến 40% cho các dòng sản phẩm máy giặt, máy sấy, tủ lạnh và máy hút bụi. Trợ giá đổi mới thêm 5%, miễn phí giao hàng & lắp đặt tận nơi cùng chương trình MUA 1 TẶNG 1 siêu giá trị.',
  '["Trợ giá đổi mới giảm thêm 5%","Ưu đãi giá trực tiếp lên đến 40%","Miễn phí 100% giao hàng & lắp đặt tận nhà","Chương trình MUA 1 TẶNG 1 quà tặng gia dụng hấp dẫn"]'::jsonb,
  '["Áp dụng cho tất cả khách hàng mua hàng trực tuyến hoặc tại showroom chính thức.","Không áp dụng đồng thời với các chương trình khuyến mại xả kho khác.","Quà tặng MUA 1 TẶNG 1 có số lượng giới hạn theo từng dòng sản phẩm."]'::jsonb,
  '2026-08-01T00:00:00.000Z',
  '2026-08-31T00:00:00.000Z',
  '/promotions/promo1_hd.png',
  '/thiet-bi/may-giat',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Promotion" WHERE "slug" = 'uu-dai-thang-sinh-nhat'
);

INSERT INTO "Promotion" (
  "id",
  "slug",
  "title",
  "discountPercentage",
  "description",
  "highlights",
  "terms",
  "startDate",
  "endDate",
  "bannerImageUrl",
  "linkUrl",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  'promo-induction-installation',
  'cat-da-lap-dat-mien-phi-bep-tu',
  'Chương trình Cắt đá và Lắp đặt miễn phí sản phẩm Bếp Từ Electrolux',
  0,
  'Nâng cấp căn bếp sang trọng với dòng Bếp Từ Electrolux cao cấp. Khách hàng khi mua sản phẩm bếp từ Electrolux sẽ nhận ngay gói quà tặng miễn phí khảo sát, hỗ trợ cắt đá mặt bếp chuẩn kích thước và 100% phí lắp đặt bởi đội ngũ kỹ thuật viên chuyên nghiệp.',
  '["Miễn phí khảo sát không gian bếp tận nhà","Miễn phí 100% công cắt đá theo chuẩn kỹ thuật","Miễn phí lắp đặt và kết nối điện an toàn","Bảo hành chính hãng 24 tháng tại nhà"]'::jsonb,
  '["Chương trình áp dụng cho tất cả mã sản phẩm Bếp Từ Electrolux.","Kỹ thuật viên sẽ liên hệ hẹn giờ khảo sát và thi công trong vòng 24h - 48h.","Dịch vụ cắt đá áp dụng cho chất liệu đá tự nhiên và đá nhân tạo tiêu chuẩn."]'::jsonb,
  '2026-04-01T00:00:00.000Z',
  '2026-12-31T00:00:00.000Z',
  '/promotions/promo2_hd.png',
  '/thiet-bi/bep-tu',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Promotion" WHERE "slug" = 'cat-da-lap-dat-mien-phi-bep-tu'
);
