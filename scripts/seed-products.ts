import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as categoriesData from "../src/data/categories";
import type { CategoryPageData } from "../src/data/categories";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../.env") });
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSeedCategory(value: unknown): value is CategoryPageData {
  return (
    isRecord(value) &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.products)
  );
}

async function main() {
  console.log("🚀 Bắt đầu seed dữ liệu sản phẩm...");
  
  // Filter out any non-category objects (like categoryRoutes)
  const categoriesToSeed = Object.values(categoriesData).filter(isSeedCategory);

  const skuToVariantIdMap: Record<string, string> = {};
  let totalProducts = 0;

  for (const cat of categoriesToSeed) {
    console.log(`\n📂 Đang xử lý danh mục: ${cat.name} (${cat.slug})`);
    
    const categoryRecord = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug, order: 0 },
    });

    for (const prod of cat.products) {
      const productRecord = await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {
          name: prod.name,
          categoryId: categoryRecord.id,
          freeShipping: prod.freeShipping || false,
          freeInstallation: prod.freeInstallation || false,
          installment0Percent: prod.installment0Percent || false,
        },
        create: {
          name: prod.name,
          slug: prod.slug,
          categoryId: categoryRecord.id,
          freeShipping: prod.freeShipping || false,
          freeInstallation: prod.freeInstallation || false,
          installment0Percent: prod.installment0Percent || false,
          isActive: true,
        },
      });

      const variantRecord = await prisma.productVariant.upsert({
        where: { sku: prod.sku },
        update: {
          variantName: "Mặc định",
          price: prod.price,
          discountPercentage: prod.oldPrice ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100) : 0,
          stockQuantity: 100, // Fixed stock for dev
        },
        create: {
          productId: productRecord.id,
          sku: prod.sku,
          variantName: "Mặc định",
          price: prod.price,
          discountPercentage: prod.oldPrice ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100) : 0,
          stockQuantity: 100,
        },
      });

      // Upsert Image
      const existingImages = await prisma.productImage.findMany({ where: { productId: productRecord.id } });
      if (existingImages.length === 0 && prod.img) {
        await prisma.productImage.create({
          data: {
            productId: productRecord.id,
            url: prod.img,
            order: 0
          }
        });
      }

      console.log(`  ✅ Đã seed sản phẩm: ${prod.sku} -> VariantID: ${variantRecord.id}`);
      skuToVariantIdMap[prod.sku] = variantRecord.id;
      totalProducts++;
    }
  }

  console.log(`\nTổng số sản phẩm đã xử lý: ${totalProducts}`);
  console.log("📝 Đang cập nhật file categories.ts với các VariantID thật...");
  
  const filePath = path.resolve(__dirname, "../src/data/categories.ts");
  let content = fs.readFileSync(filePath, "utf-8");
  let replacedCount = 0;

  for (const [sku, variantId] of Object.entries(skuToVariantIdMap)) {
    // Regex safely replaces id: "..." that precedes sku: "SKU_VALUE" within the same block
    const regex = new RegExp(`(id:\\s*")[^"]+("\\s*,[^}]*?sku:\\s*"${sku}")`, "g");
    
    const initialContent = content;
    content = content.replace(regex, `$1${variantId}$2`);
    
    if (initialContent !== content) {
      replacedCount++;
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Đã thay thế thành công ID cho ${replacedCount}/${totalProducts} sản phẩm trong categories.ts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
