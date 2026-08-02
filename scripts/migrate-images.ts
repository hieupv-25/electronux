/**
 * Script migrate ảnh từ public/ lên Supabase Storage bucket "products"
 *
 * Chạy: npx tsx scripts/migrate-images.ts
 *
 * Ảnh sẽ được tổ chức theo folder:
 *   - heroes/     → hero banners
 *   - items/      → product images
 *   - banners/    → promotional banners
 *
 * Ảnh tĩnh UI (logo, icons SVG) sẽ giữ lại ở public/
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ── Config ──
const SUPABASE_URL = "https://ekgozxcqkjzzamrgiyal.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZ296eGNxa2p6emFtcmdpeWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTcwNzMsImV4cCI6MjEwMDI5MzA3M30.dHLWw52EqX4G6z10VJS-_Cw8qlJdJaIDFJnjFQWbAhY";
const BUCKET = "products";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Danh sách ảnh cần migrate (ảnh nội dung, KHÔNG bao gồm icons/logo) ──
const imagesToMigrate: { localFile: string; remotePath: string }[] = [
  // Hero banners
  { localFile: "hero-banner-1.jpg", remotePath: "heroes/hero-banner-1.jpg" },
  { localFile: "hero-banner-2.jpg", remotePath: "heroes/hero-banner-2.jpg" },
  { localFile: "hero-banner-3.jpg", remotePath: "heroes/hero-banner-3.jpg" },
  { localFile: "hero-banner-4.png", remotePath: "heroes/hero-banner-4.png" },
  { localFile: "hero-banner-5.png", remotePath: "heroes/hero-banner-5.png" },
  { localFile: "hero-banner-6.jpg", remotePath: "heroes/hero-banner-6.jpg" },

  // Product images
  { localFile: "product-1.jpg", remotePath: "items/product-1.jpg" },
  { localFile: "product-2.jpg", remotePath: "items/product-2.jpg" },
  { localFile: "product-3.jpg", remotePath: "items/product-3.jpg" },
  { localFile: "product-4.jpg", remotePath: "items/product-4.jpg" },
  { localFile: "product-5.jpg", remotePath: "items/product-5.jpg" },

  // Promotional banners
  { localFile: "ultimatecare.png", remotePath: "banners/ultimatecare.png" },
  { localFile: "refrigerators.jpg", remotePath: "banners/refrigerators.jpg" },
  { localFile: "warranty.jpg", remotePath: "banners/warranty.jpg" },
  { localFile: "blog-banner.jpg", remotePath: "banners/blog-banner.jpg" },
];

// ── MIME types ──
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".gif": "image/gif",
  };
  return mimeMap[ext] || "application/octet-stream";
}

// ── Main ──
async function main() {
  const publicDir = path.resolve(__dirname, "../public");

  console.log("🚀 Bắt đầu migrate ảnh lên Supabase Storage...");
  console.log(`📂 Bucket: ${BUCKET}`);
  console.log(`📁 Thư mục nguồn: ${publicDir}`);
  console.log(`📷 Tổng số ảnh: ${imagesToMigrate.length}`);
  console.log("─".repeat(50));

  let success = 0;
  let failed = 0;

  for (const img of imagesToMigrate) {
    const localPath = path.join(publicDir, img.localFile);

    // Kiểm tra file tồn tại
    if (!fs.existsSync(localPath)) {
      console.log(`⚠️  SKIP: ${img.localFile} (không tìm thấy file)`);
      failed++;
      continue;
    }

    // Đọc file
    const fileBuffer = fs.readFileSync(localPath);
    const contentType = getMimeType(img.localFile);

    // Upload lên Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(img.remotePath, fileBuffer, {
        contentType,
        upsert: true, // Ghi đè nếu đã tồn tại
      });

    if (error) {
      console.log(`❌ FAIL: ${img.localFile} → ${error.message}`);
      failed++;
    } else {
      // Lấy public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

      console.log(`✅ OK:   ${img.localFile} → ${img.remotePath}`);
      console.log(`   URL:  ${urlData.publicUrl}`);
      success++;
    }
  }

  console.log("─".repeat(50));
  console.log(`🏁 Hoàn tất! Thành công: ${success}/${imagesToMigrate.length}, Thất bại: ${failed}`);

  if (success > 0) {
    console.log("\n📋 Các URL ảnh trên Supabase:");
    for (const img of imagesToMigrate) {
      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(img.remotePath);
      console.log(`   ${img.remotePath} → ${data.publicUrl}`);
    }
  }
}

main().catch(console.error);
