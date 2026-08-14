UPDATE "ProductImage"
SET "url" = '/dichvubaoduong.jpg'
WHERE "productId" IN (
  SELECT "id"
  FROM "Product"
  WHERE "categoryId" = (
    SELECT "id" FROM "Category" WHERE "slug" = 'dich-vu-bao-duong'
  )
);
