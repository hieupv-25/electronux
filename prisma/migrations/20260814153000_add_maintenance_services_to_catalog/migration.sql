CREATE TYPE "ProductKind" AS ENUM ('physical', 'service');

ALTER TABLE "Product"
ADD COLUMN "kind" "ProductKind" NOT NULL DEFAULT 'physical';

CREATE INDEX "Product_kind_idx" ON "Product"("kind");

INSERT INTO "Category" ("id", "name", "slug", "order")
VALUES ('00000000-0000-4000-8000-000000000100', 'Dịch vụ bảo dưỡng', 'dich-vu-bao-duong', 100)
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "Product" (
  "id", "categoryId", "name", "slug", "kind", "description", "specifications",
  "isFeatured", "isActive", "freeShipping", "freeInstallation", "installment0Percent",
  "createdAt", "updatedAt"
)
VALUES
  ('00000000-0000-4000-8000-000000000201', (SELECT "id" FROM "Category" WHERE "slug" = 'dich-vu-bao-duong'), 'Vệ sinh máy giặt sấy từ 10kg tại nhà', 've-sinh-may-giat-say-tu-10kg-tai-nha', 'service', 'Dịch vụ vệ sinh và bảo dưỡng máy giặt sấy từ 10kg tại nhà.', '{"serviceGroup":"Chăm sóc trang phục","serviceType":"maintenance"}', false, true, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000202', (SELECT "id" FROM "Category" WHERE "slug" = 'dich-vu-bao-duong'), 'Vệ sinh máy giặt sấy dưới 10kg tại nhà', 've-sinh-may-giat-say-duoi-10kg-tai-nha', 'service', 'Dịch vụ vệ sinh và bảo dưỡng máy giặt sấy dưới 10kg tại nhà.', '{"serviceGroup":"Chăm sóc trang phục","serviceType":"maintenance"}', false, true, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000203', (SELECT "id" FROM "Category" WHERE "slug" = 'dich-vu-bao-duong'), 'Vệ sinh máy giặt từ 10kg tại nhà', 've-sinh-may-giat-tu-10kg-tai-nha', 'service', 'Dịch vụ vệ sinh và bảo dưỡng máy giặt từ 10kg tại nhà.', '{"serviceGroup":"Chăm sóc trang phục","serviceType":"maintenance"}', false, true, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000204', (SELECT "id" FROM "Category" WHERE "slug" = 'dich-vu-bao-duong'), 'Vệ sinh máy giặt dưới 10kg tại nhà', 've-sinh-may-giat-duoi-10kg-tai-nha', 'service', 'Dịch vụ vệ sinh và bảo dưỡng máy giặt dưới 10kg tại nhà.', '{"serviceGroup":"Chăm sóc trang phục","serviceType":"maintenance"}', false, true, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000205', (SELECT "id" FROM "Category" WHERE "slug" = 'dich-vu-bao-duong'), 'Vệ sinh máy sấy bơm nhiệt tại nhà', 've-sinh-may-say-bom-nhiet-tai-nha', 'service', 'Dịch vụ vệ sinh và bảo dưỡng máy sấy bơm nhiệt tại nhà.', '{"serviceGroup":"Chăm sóc trang phục","serviceType":"maintenance"}', false, true, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000206', (SELECT "id" FROM "Category" WHERE "slug" = 'dich-vu-bao-duong'), 'Vệ sinh máy sấy ngưng tụ tại nhà', 've-sinh-may-say-ngung-tu-tai-nha', 'service', 'Dịch vụ vệ sinh và bảo dưỡng máy sấy ngưng tụ tại nhà.', '{"serviceGroup":"Chăm sóc trang phục","serviceType":"maintenance"}', false, true, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000207', (SELECT "id" FROM "Category" WHERE "slug" = 'dich-vu-bao-duong'), 'Vệ sinh máy sấy thông hơi tại nhà', 've-sinh-may-say-thong-hoi-tai-nha', 'service', 'Dịch vụ vệ sinh và bảo dưỡng máy sấy thông hơi tại nhà.', '{"serviceGroup":"Chăm sóc trang phục","serviceType":"maintenance"}', false, true, false, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "kind" = EXCLUDED."kind",
  "description" = EXCLUDED."description",
  "specifications" = EXCLUDED."specifications",
  "isActive" = true,
  "deletedAt" = NULL,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "ProductVariant" (
  "id", "productId", "sku", "variantName", "price", "discountPercentage", "stockQuantity", "attributes", "isActive"
)
VALUES
  ('00000000-0000-4000-8000-000000000301', (SELECT "id" FROM "Product" WHERE "slug" = 've-sinh-may-giat-say-tu-10kg-tai-nha'), '23675', 'Gói tiêu chuẩn', 930000, 0, 99999, '{"serviceType":"maintenance"}', true),
  ('00000000-0000-4000-8000-000000000302', (SELECT "id" FROM "Product" WHERE "slug" = 've-sinh-may-giat-say-duoi-10kg-tai-nha'), '23674', 'Gói tiêu chuẩn', 830000, 0, 99999, '{"serviceType":"maintenance"}', true),
  ('00000000-0000-4000-8000-000000000303', (SELECT "id" FROM "Product" WHERE "slug" = 've-sinh-may-giat-tu-10kg-tai-nha'), '23673', 'Gói tiêu chuẩn', 740000, 0, 99999, '{"serviceType":"maintenance"}', true),
  ('00000000-0000-4000-8000-000000000304', (SELECT "id" FROM "Product" WHERE "slug" = 've-sinh-may-giat-duoi-10kg-tai-nha'), '23672', 'Gói tiêu chuẩn', 640000, 0, 99999, '{"serviceType":"maintenance"}', true),
  ('00000000-0000-4000-8000-000000000305', (SELECT "id" FROM "Product" WHERE "slug" = 've-sinh-may-say-bom-nhiet-tai-nha'), '23671', 'Gói tiêu chuẩn', 640000, 0, 99999, '{"serviceType":"maintenance"}', true),
  ('00000000-0000-4000-8000-000000000306', (SELECT "id" FROM "Product" WHERE "slug" = 've-sinh-may-say-ngung-tu-tai-nha'), '23670', 'Gói tiêu chuẩn', 540000, 0, 99999, '{"serviceType":"maintenance"}', true),
  ('00000000-0000-4000-8000-000000000307', (SELECT "id" FROM "Product" WHERE "slug" = 've-sinh-may-say-thong-hoi-tai-nha'), '23669', 'Gói tiêu chuẩn', 440000, 0, 99999, '{"serviceType":"maintenance"}', true)
ON CONFLICT ("sku") DO UPDATE SET
  "productId" = EXCLUDED."productId",
  "variantName" = EXCLUDED."variantName",
  "price" = EXCLUDED."price",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "attributes" = EXCLUDED."attributes",
  "isActive" = true;

INSERT INTO "ProductImage" ("id", "productId", "url", "order")
SELECT
  'service-image-' || "sku",
  "productId",
  '/icon-washing-machine.svg',
  0
FROM "ProductVariant"
WHERE "sku" IN ('23675', '23674', '23673', '23672', '23671', '23670', '23669')
ON CONFLICT ("id") DO UPDATE SET "url" = EXCLUDED."url";
