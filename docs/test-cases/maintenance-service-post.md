# Test case: POST tạo dịch vụ bảo dưỡng

## TC-MAINT-POST-001: Admin tạo mới dịch vụ bảo dưỡng thành công

| Mục | Nội dung |
| --- | --- |
| Module | Admin - Dịch vụ bảo dưỡng |
| Chức năng | Thêm dịch vụ bảo dưỡng |
| Loại test | Functional test |
| Mức ưu tiên | High |
| Người thực hiện | Admin |
| Trang kiểm thử | `/admin/services/maintenance` |
| API liên quan | `POST /api/upload`, server action `createMaintenanceService` |

## Tiền điều kiện

- Admin đã đăng nhập thành công.
- Tài khoản có quyền `admin`.
- Supabase Storage có bucket `services`.
- Server có cấu hình `SUPABASE_SECRET_KEY` hoặc `SUPABASE_SERVICE_ROLE_KEY`.
- Database có danh mục sản phẩm với slug `dich-vu-bao-duong`.
- File ảnh hợp lệ có định dạng `jpg`, `png`, `webp` hoặc `avif`, dung lượng không quá 5 MB.

## Dữ liệu test

| Field | Giá trị |
| --- | --- |
| Nhóm dịch vụ | `Chăm sóc nhà cửa` |
| Loại sản phẩm | `Máy hút ẩm` |
| Tên dịch vụ | `Dịch vụ vệ sinh máy hút ẩm` |
| Mã SKU | `HA-0101-KD` |
| Slug | `dich-vu-ve-sinh-may-hut-am` |
| Giá dịch vụ | `300000` |
| Mô tả | `Dịch vụ vệ sinh và bảo dưỡng máy hút ẩm chuyên nghiệp.` |
| Ảnh dịch vụ | `may-hut-am.webp` |

## Các bước thực hiện

1. Truy cập trang `/admin/services/maintenance`.
2. Chọn nhóm dịch vụ `Chăm sóc nhà cửa`.
3. Chọn loại sản phẩm `Máy hút ẩm`.
4. Nhập tên dịch vụ, SKU, slug, giá và mô tả theo dữ liệu test.
5. Chọn ảnh dịch vụ hợp lệ.
6. Nhấn nút `Tạo dịch vụ bảo dưỡng`.
7. Chờ hệ thống upload ảnh và tạo dịch vụ.
8. Kiểm tra thông báo sau khi thêm.
9. Truy cập trang customer `/services/maintenance`.
10. Nhấn vào card dịch vụ vừa tạo để mở trang chi tiết.

## Kết quả mong đợi

- Hệ thống upload ảnh thành công vào bucket `services`, folder `Maintainance/home-care`.
- Hệ thống hiển thị thông báo ngắn: `Thêm dịch vụ thành công.`
- Dịch vụ mới xuất hiện trong danh sách quản lý admin.
- Dịch vụ mới xuất hiện ở trang customer `/services/maintenance`.
- Card dịch vụ hiển thị đúng tên, nhóm, loại sản phẩm, SKU, mô tả, ảnh và giá.
- Khi click vào card, hệ thống mở đúng trang chi tiết `/services/maintenance/dich-vu-ve-sinh-may-hut-am`.
- Trang chi tiết hiển thị đúng thông tin dịch vụ và nút `Thêm vào giỏ`.

## Kiểm tra dữ liệu trong database

| Bảng | Điều kiện kiểm tra | Kết quả mong đợi |
| --- | --- | --- |
| `Product` | `slug = "dich-vu-ve-sinh-may-hut-am"` | Có 1 bản ghi mới |
| `Product` | `kind = "service"` | Đúng |
| `Product` | `category.slug = "dich-vu-bao-duong"` | Đúng |
| `Product` | `isActive = true`, `deletedAt = null` | Đúng |
| `Product.specifications` | `serviceType = "maintenance"` | Đúng |
| `Product.specifications` | `serviceGroupKey = "home-care"` | Đúng |
| `Product.specifications` | `productType = "Máy hút ẩm"` | Đúng |
| `Variant` | `sku = "HA-0101-KD"` | Có 1 variant mới |
| `Variant` | `price = 300000` | Đúng |
| `Image` | `url` là public URL của ảnh upload | Đúng |

## Test case lỗi liên quan

| Mã test | Trường hợp | Bước test | Kết quả mong đợi |
| --- | --- | --- | --- |
| TC-MAINT-POST-002 | Không chọn ảnh | Bỏ trống ảnh và nhấn tạo | Hiển thị lỗi yêu cầu chọn ảnh |
| TC-MAINT-POST-003 | Ảnh quá dung lượng | Upload ảnh lớn hơn 5 MB | Upload thất bại, dịch vụ không được tạo |
| TC-MAINT-POST-004 | Thiếu tên dịch vụ | Bỏ trống tên dịch vụ | Form không cho submit hoặc server báo thiếu thông tin |
| TC-MAINT-POST-005 | Giá không hợp lệ | Nhập giá là chữ hoặc số âm | Form/server từ chối dữ liệu |
| TC-MAINT-POST-006 | Loại sản phẩm sai nhóm | Gửi `group = home-care`, `productType = Máy giặt` | Server báo loại sản phẩm không thuộc nhóm đã chọn |
| TC-MAINT-POST-007 | Không phải admin | Truy cập form bằng tài khoản customer | Không được phép tạo dịch vụ |
| TC-MAINT-POST-008 | Thiếu service role key | Upload ảnh khi server chưa cấu hình secret key | Upload thất bại, không tạo dịch vụ |

## Trạng thái

- Status: Ready for manual testing
- Ngày tạo: 15/08/2026
