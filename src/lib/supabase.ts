import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Client đặc quyền chỉ dành cho API/server đã tự kiểm tra quyền quản trị.
 * Không export key này qua biến NEXT_PUBLIC_* hoặc dùng trong Client Component.
 */
export function createSupabaseAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey) {
    throw new Error("Thiếu SUPABASE_SECRET_KEY hoặc SUPABASE_SERVICE_ROLE_KEY trên server");
  }

  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Storage Bucket Names ──
export const STORAGE_BUCKETS = {
  PRODUCTS: "products",
  SERVICES: "services",
} as const;

// ── Storage Helpers ──

/**
 * Lấy public URL của file trong Supabase Storage
 * @param bucket - tên bucket (VD: "products")
 * @param path - đường dẫn file trong bucket (VD: "heroes/hero-banner-1.jpg")
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload file lên Supabase Storage
 * @param bucket - tên bucket
 * @param path - đường dẫn đích trong bucket
 * @param file - File hoặc Blob cần upload
 * @param options - tùy chọn (contentType, upsert, ...)
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob | Buffer,
  options?: { contentType?: string; upsert?: boolean }
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? true, // Mặc định ghi đè nếu trùng tên
    });

  if (error) throw error;
  return data;
}

/**
 * Xóa file khỏi Supabase Storage
 * @param bucket - tên bucket
 * @param paths - mảng đường dẫn file cần xóa
 */
export async function deleteFiles(bucket: string, paths: string[]) {
  const { data, error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
  return data;
}

/**
 * Liệt kê files trong folder
 * @param bucket - tên bucket
 * @param folder - đường dẫn folder (VD: "heroes")
 */
export async function listFiles(bucket: string, folder?: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 100, sortBy: { column: "name", order: "asc" } });

  if (error) throw error;
  return data;
}

/**
 * Tạo URL ảnh sản phẩm từ Supabase Storage
 * Shortcut tiện dụng cho team
 */
export function getProductImageUrl(path: string): string {
  return getPublicUrl(STORAGE_BUCKETS.PRODUCTS, path);
}
