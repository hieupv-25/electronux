import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, STORAGE_BUCKETS } from "@/lib/supabase";
import { auth } from "@/auth";

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
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    if (session.user.role !== "admin") return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "";
    const requestedBucket = formData.get("bucket");
    const bucket = requestedBucket === STORAGE_BUCKETS.SERVICES
      ? STORAGE_BUCKETS.SERVICES
      : STORAGE_BUCKETS.PRODUCTS;
    const supabaseAdmin = createSupabaseAdminClient();

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file trong request" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Chỉ chấp nhận ảnh có dung lượng tối đa 5 MB" }, { status: 400 });
    }

    // Tạo tên file unique để tránh trùng
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = folder
      ? `${folder}/${timestamp}-${safeName}`
      : `${timestamp}-${safeName}`;

    // Upload lên Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
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
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
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
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    if (session.user.role !== "admin") return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

    const { paths, bucket: requestedBucket } = await request.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: "Cần cung cấp mảng paths để xóa" },
        { status: 400 }
      );
    }

    const bucket = requestedBucket === STORAGE_BUCKETS.SERVICES
      ? STORAGE_BUCKETS.SERVICES
      : STORAGE_BUCKETS.PRODUCTS;
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
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
