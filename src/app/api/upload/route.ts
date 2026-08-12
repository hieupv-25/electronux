import { NextRequest, NextResponse } from "next/server";
import { supabase, STORAGE_BUCKETS } from "@/lib/supabase";

/**
 * POST /api/upload
 * Upload file lên Supabase Storage bucket "products"
 *
 * Body: FormData với:
 *   - file: File cần upload
 *   - folder: (optional) tên folder đích, VD: "heroes", "items", "banners"
 *
 * Response: { url: string } - public URL của file đã upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file trong request" },
        { status: 400 }
      );
    }

    // Tạo tên file unique để tránh trùng
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = folder
      ? `${folder}/${timestamp}-${safeName}`
      : `${timestamp}-${safeName}`;

    // Upload lên Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PRODUCTS)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: `Upload thất bại: ${error.message}` },
        { status: 500 }
      );
    }

    // Lấy public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.PRODUCTS)
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: "Lỗi server khi upload file" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Xóa file khỏi Supabase Storage
 *
 * Body: { paths: string[] } - mảng đường dẫn file cần xóa
 */
export async function DELETE(request: NextRequest) {
  try {
    const { paths } = await request.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: "Cần cung cấp mảng paths để xóa" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PRODUCTS)
      .remove(paths);

    if (error) {
      return NextResponse.json(
        { error: `Xóa thất bại: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: data });
  } catch (err) {
    console.error("Delete API error:", err);
    return NextResponse.json(
      { error: "Lỗi server khi xóa file" },
      { status: 500 }
    );
  }
}
