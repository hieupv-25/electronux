"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createBrand,
  createProduct,
  createVariant,
  softDeleteProduct,
  toggleProductActive,
  updateProduct,
  updateVariant,
} from "@/app/admin/actions";
import { AdminPageHeader, EmptyBlock, StatusBadge } from "@/components/admin/AdminUi";
import AdminImageUploadInput from "@/components/admin/AdminImageUploadInput";
import { formatDate } from "@/lib/admin-format";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

type BrandItem = {
  id: string;
  name: string;
};

type VariantItem = {
  id: string;
  sku: string;
  variantName: string;
  price: number;
  discountPercentage: number;
  stockQuantity: number;
  isActive: boolean;
};

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: unknown;
  isActive: boolean;
  isFeatured: boolean;
  freeShipping: boolean;
  freeInstallation: boolean;
  installment0Percent: boolean;
  createdAt: Date | string;
  category: { id: string; name: string };
  brand: { id: string; name: string } | null;
  variants: VariantItem[];
  images: { url: string }[];
  _count: { reviews: number; wishlistItems: number };
};

type ProductFilters = {
  q: string;
  categoryId: string;
  status: string;
  stock: string;
  page: number;
};

type ProductSummaryData = {
  all: number;
  active: number;
  hidden: number;
  lowStock: number;
  outStock: number;
};

type AdminProductsClientProps = {
  products: ProductItem[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  categories: CategoryItem[];
  brands: BrandItem[];
  summary: ProductSummaryData;
  filters: ProductFilters;
  isFiltering: boolean;
};

function stringifySpecifications(value: unknown) {
  if (!value) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function buildProductsHref(filters: ProductFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.status) params.set("status", filters.status);
  if (filters.stock) params.set("stock", filters.stock);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

function ProductFilterBar({
  filters,
  categories,
}: {
  filters: ProductFilters;
  categories: CategoryItem[];
}) {
  return (
    <section className="admin-panel admin-section-gap">
      <form className="admin-filter-bar" method="get">
        <label>
          Tìm kiếm
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Tên sản phẩm, SKU, biến thể, hãng, danh mục..."
          />
        </label>
        <label>
          Danh mục
          <select name="categoryId" defaultValue={filters.categoryId}>
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select name="status" defaultValue={filters.status}>
            <option value="">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="hidden">Tạm ẩn</option>
          </select>
        </label>
        <label>
          Tồn kho
          <select name="stock" defaultValue={filters.stock}>
            <option value="">Tất cả</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Hết hàng</option>
          </select>
        </label>
        <button className="admin-primary-button" type="submit">
          Tìm kiếm
        </button>
        <Link className="admin-secondary-button" href="/admin/products">
          Đặt lại
        </Link>
      </form>
    </section>
  );
}

function ProductSummary({
  totalProducts,
  summary,
}: {
  totalProducts: number;
  summary: ProductSummaryData;
}) {
  return (
    <section className="admin-management-summary" aria-label="Tóm tắt sản phẩm">
      <article>
        <span>Kết quả đang xem</span>
        <strong>{totalProducts.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Tổng sản phẩm</span>
        <strong>{summary.all.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Đang bán</span>
        <strong>{summary.active.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Tạm ẩn</span>
        <strong>{summary.hidden.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Sắp hết hàng</span>
        <strong>{summary.lowStock.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Hết hàng</span>
        <strong>{summary.outStock.toLocaleString("vi-VN")}</strong>
      </article>
    </section>
  );
}

function ProductsPagination({
  filters,
  currentPage,
  totalPages,
}: {
  filters: ProductFilters;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="admin-pagination" aria-label="Phân trang sản phẩm">
      <Link
        className={
          currentPage <= 1
            ? "admin-pagination__link admin-pagination__link--disabled"
            : "admin-pagination__link"
        }
        href={buildProductsHref(filters, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage <= 1}
      >
        Trước
      </Link>
      <span>
        Trang {currentPage.toLocaleString("vi-VN")} /{" "}
        {totalPages.toLocaleString("vi-VN")}
      </span>
      <Link
        className={
          currentPage >= totalPages
            ? "admin-pagination__link admin-pagination__link--disabled"
            : "admin-pagination__link"
        }
        href={buildProductsHref(filters, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage >= totalPages}
      >
        Sau
      </Link>
    </nav>
  );
}

type ConfirmActionState = {
  type: "hide" | "show" | "delete";
  productId: string;
  productName: string;
  currentActiveValue?: boolean;
} | null;

export default function AdminProductsClient({
  products,
  totalProducts,
  totalPages,
  currentPage,
  categories,
  brands,
  summary,
  filters,
  isFiltering,
}: AdminProductsClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Quản lý sản phẩm"
        description="Tạo sản phẩm, SKU, cập nhật tồn kho và tìm kiếm nhanh theo tên, slug, SKU, biến thể, hãng hoặc danh mục."
        actions={
          <button
            type="button"
            className="admin-ghost-link"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? "Đóng form" : "Thêm sản phẩm"}
          </button>
        }
      />

      <ProductFilterBar filters={filters} categories={categories} />
      <ProductSummary totalProducts={totalProducts} summary={summary} />

      {isFormOpen && (
        <section className="admin-form-grid">
          <form
            action={async (formData) => {
              try {
                await createProduct(formData);
                showToast("Tạo sản phẩm mới thành công!");
                setIsFormOpen(false);
              } catch {
                showToast("Tạo sản phẩm thất bại", "error");
              }
            }}
            className="admin-form-card admin-form-card--wide"
          >
            <div className="admin-form-card__header">
              <h3>Thêm sản phẩm</h3>
              <span>{categories.length} danh mục</span>
            </div>
            {categories.length === 0 ? (
              <EmptyBlock>
                Hãy tạo ít nhất một danh mục ở trang quản lý danh mục trước khi thêm sản phẩm.
              </EmptyBlock>
            ) : (
              <div className="admin-form-fields admin-form-fields--two">
                <label>
                  Tên sản phẩm
                  <input name="name" required placeholder="Máy giặt UltimateCare 500" />
                </label>
                <label>
                  Slug
                  <input name="slug" placeholder="Tự tạo nếu bỏ trống" />
                </label>
                <label>
                  Danh mục
                  <select name="categoryId" required defaultValue={categories[0]?.id}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Thương hiệu
                  <select name="brandId" defaultValue="">
                    <option value="">Không chọn</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field-span">
                  Mô tả
                  <textarea name="description" rows={3} placeholder="Mô tả ngắn cho storefront" />
                </label>
                <label className="admin-field-span">
                  Thông số JSON
                  <textarea
                    name="specifications"
                    rows={3}
                    placeholder='{"dungTich":"450L","congSuat":"150W"}'
                  />
                </label>
                <label>
                  SKU đầu tiên
                  <input name="sku" placeholder="EWF9023P5WC" />
                </label>
                <label>
                  Tên biến thể
                  <input name="variantName" placeholder="Màu trắng - 9kg" />
                </label>
                <label>
                  Giá bán
                  <input name="price" inputMode="numeric" placeholder="11990000" />
                </label>
                <label>
                  Tồn kho
                  <input name="stockQuantity" type="number" min="0" defaultValue="0" />
                </label>
                <label>
                  Giảm giá %
                  <input name="discountPercentage" type="number" min="0" max="100" defaultValue="0" />
                </label>
                <AdminImageUploadInput
                  name="imageUrl"
                  label="Ảnh sản phẩm"
                  folder="items"
                />
                <div className="admin-check-grid admin-field-span">
                  <label>
                    <input name="isActive" type="checkbox" defaultChecked />
                    Đang bán
                  </label>
                  <label>
                    <input name="isFeatured" type="checkbox" />
                    Nổi bật
                  </label>
                  <label>
                    <input name="freeShipping" type="checkbox" defaultChecked />
                    Miễn phí vận chuyển
                  </label>
                  <label>
                    <input name="freeInstallation" type="checkbox" />
                    Miễn phí lắp đặt
                  </label>
                  <label>
                    <input name="installment0Percent" type="checkbox" />
                    Trả góp 0%
                  </label>
                </div>
                <button className="admin-primary-button admin-field-span" type="submit">
                  Tạo sản phẩm
                </button>
              </div>
            )}
          </form>

          <form
            action={async (formData) => {
              try {
                await createBrand(formData);
                showToast("Thêm thương hiệu thành công!");
              } catch {
                showToast("Thêm thương hiệu thất bại", "error");
              }
            }}
            className="admin-form-card"
          >
            <div className="admin-form-card__header">
              <h3>Thương hiệu</h3>
              <span>{brands.length}</span>
            </div>
            <div className="admin-form-fields">
              <label>
                Tên thương hiệu
                <input name="name" required placeholder="Electrolux" />
              </label>
              <label>
                Logo URL
                <input name="logoUrl" placeholder="https://..." />
              </label>
              <button className="admin-secondary-button" type="submit">
                Thêm thương hiệu
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-records admin-compact-list">
        <div className="admin-panel__header admin-panel__header--loose">
          <div>
            <p className="admin-eyebrow">Danh sách</p>
            <h2>
              {isFiltering
                ? `${totalProducts} kết quả phù hợp`
                : `${totalProducts} sản phẩm đang quản lý`}
            </h2>
          </div>
        </div>
        {products.length === 0 ? (
          <EmptyBlock>
            {isFiltering
              ? "Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại."
              : "Chưa có sản phẩm nào trong hệ thống."}
          </EmptyBlock>
        ) : (
          products.map((product, index) => {
            const stock = product.variants.reduce(
              (total, variant) => total + variant.stockQuantity,
              0
            );
            const primarySku = product.variants[0]?.sku ?? "Chưa có SKU";

            return (
              <details
                className="admin-record-card admin-compact-row admin-product-row"
                key={product.id}
                open={products.length === 1 && index === 0}
              >
                <summary className="admin-compact-row__summary">
                  <div className="admin-compact-row__main">
                    <p className="admin-eyebrow">
                      {product.category.name}
                      {product.brand ? ` - ${product.brand.name}` : ""}
                    </p>
                    <h3>{product.name}</h3>
                    <span>Tạo ngày {formatDate(product.createdAt)} - {primarySku}</span>
                  </div>
                  <div className="admin-compact-row__meta">
                    <span>
                      <small>SKU</small>
                      <strong>{product.variants.length}</strong>
                    </span>
                    <span>
                      <small>Tồn kho</small>
                      <strong>{stock}</strong>
                    </span>
                    <span>
                      <small>Ảnh / đánh giá</small>
                      <strong>
                        {product.images.length} / {product._count.reviews}
                      </strong>
                    </span>
                  </div>
                  <div className="admin-status-stack">
                    <StatusBadge
                      value={product.isActive ? "completed" : "cancelled"}
                      labels={{ completed: "Đang bán", cancelled: "Tạm ẩn" }}
                    />
                    <span className="admin-compact-row__hint">Chi tiết</span>
                  </div>
                </summary>

                <form
                  action={async (formData) => {
                    try {
                      await updateProduct(formData);
                      showToast(`Lưu thông tin sản phẩm "${product.name}" thành công!`);
                    } catch {
                      showToast("Lưu thông tin sản phẩm thất bại", "error");
                    }
                  }}
                  className="admin-edit-grid admin-product-edit-form"
                >
                  <input name="id" type="hidden" value={product.id} />
                  <label>
                    Tên sản phẩm
                    <input name="name" required defaultValue={product.name} />
                  </label>
                  <label>
                    Slug
                    <input name="slug" defaultValue={product.slug} />
                  </label>
                  <label>
                    Danh mục
                    <select name="categoryId" defaultValue={product.category.id}>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Thương hiệu
                    <select name="brandId" defaultValue={product.brand?.id ?? ""}>
                      <option value="">Không chọn</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field-span">
                    Mô tả
                    <textarea name="description" rows={3} defaultValue={product.description ?? ""} />
                  </label>
                  <label className="admin-field-span">
                    Thông số JSON
                    <textarea
                      name="specifications"
                      rows={3}
                      defaultValue={stringifySpecifications(product.specifications)}
                    />
                  </label>
                  <AdminImageUploadInput
                    name="imageUrl"
                    label="Ảnh sản phẩm"
                    defaultValue={product.images[0]?.url}
                    folder={`items/${product.slug}`}
                  />
                  <div className="admin-check-grid admin-field-span">
                    <label>
                      <input name="isActive" type="checkbox" defaultChecked={product.isActive} />
                      Đang bán
                    </label>
                    <label>
                      <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />
                      Nổi bật
                    </label>
                    <label>
                      <input name="freeShipping" type="checkbox" defaultChecked={product.freeShipping} />
                      Miễn phí vận chuyển
                    </label>
                    <label>
                      <input name="freeInstallation" type="checkbox" defaultChecked={product.freeInstallation} />
                      Miễn phí lắp đặt
                    </label>
                    <label>
                      <input
                        name="installment0Percent"
                        type="checkbox"
                        defaultChecked={product.installment0Percent}
                      />
                      Trả góp 0%
                    </label>
                  </div>
                  <button className="admin-primary-button" type="submit">
                    Lưu thông tin sản phẩm
                  </button>
                </form>

                <div className="admin-record-card__body">
                  <div className="admin-mini-stats">
                    <span>Yêu thích: {product._count.wishlistItems}</span>
                    <span>Đánh giá: {product._count.reviews}</span>
                    <span>Ảnh: {product.images.length}</span>
                  </div>

                  <div className="admin-record-actions">
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={() =>
                        setConfirmAction({
                          type: product.isActive ? "hide" : "show",
                          productId: product.id,
                          productName: product.name,
                          currentActiveValue: product.isActive,
                        })
                      }
                    >
                      {product.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                    </button>
                    <button
                      type="button"
                      className="admin-danger-button"
                      onClick={() =>
                        setConfirmAction({
                          type: "delete",
                          productId: product.id,
                          productName: product.name,
                        })
                      }
                    >
                      Xóa mềm
                    </button>
                  </div>

                  <div className="admin-variant-list">
                    {product.variants.map((variant) => (
                      <form
                        action={async (formData) => {
                          try {
                            await updateVariant(formData);
                            showToast(`Lưu SKU "${variant.sku}" thành công!`);
                          } catch {
                            showToast("Lưu SKU thất bại", "error");
                          }
                        }}
                        className="admin-variant-row"
                        key={variant.id}
                      >
                        <input name="id" type="hidden" value={variant.id} />
                        <div>
                          <strong>{variant.sku}</strong>
                          <span>{variant.variantName}</span>
                        </div>
                        <label>
                          Giá
                          <input
                            name="price"
                            inputMode="numeric"
                            defaultValue={Number(variant.price)}
                          />
                        </label>
                        <label>
                          Giảm %
                          <input
                            name="discountPercentage"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={variant.discountPercentage}
                          />
                        </label>
                        <label>
                          Kho
                          <input
                            name="stockQuantity"
                            type="number"
                            min="0"
                            defaultValue={variant.stockQuantity}
                          />
                        </label>
                        <label className="admin-checkbox-inline">
                          <input
                            name="isActive"
                            type="checkbox"
                            defaultChecked={variant.isActive}
                          />
                          Bán
                        </label>
                        <button className="admin-secondary-button" type="submit">
                          Lưu SKU
                        </button>
                      </form>
                    ))}

                    <form
                      action={async (formData) => {
                        try {
                          await createVariant(formData);
                          showToast("Thêm SKU mới thành công!");
                        } catch {
                          showToast("Thêm SKU thất bại", "error");
                        }
                      }}
                      className="admin-variant-row admin-variant-row--new"
                    >
                      <input name="productId" type="hidden" value={product.id} />
                      <div>
                        <strong>Thêm SKU</strong>
                        <span>{product.name}</span>
                      </div>
                      <label>
                        SKU
                        <input name="sku" required placeholder="SKU" />
                      </label>
                      <label>
                        Biến thể
                        <input name="variantName" placeholder="Màu / dung tích" />
                      </label>
                      <label>
                        Giá
                        <input name="price" inputMode="numeric" placeholder="0" />
                      </label>
                      <label>
                        Kho
                        <input name="stockQuantity" type="number" min="0" defaultValue="0" />
                      </label>
                      <button className="admin-secondary-button" type="submit">
                        Thêm SKU
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            );
          })
        )}
      </section>

      <ProductsPagination
        filters={filters}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 10000,
            background: toast.type === "error" ? "#ef4444" : "#10b981",
            color: "#ffffff",
            padding: "14px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
        >
          <span>{toast.type === "error" ? "❌" : "✅"}</span>
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              marginLeft: "10px",
              fontSize: "1rem",
              fontWeight: "700",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {confirmAction && (
        <div
          className="auth-overlay"
          style={{
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="admin-form-card"
            style={{
              maxWidth: "460px",
              width: "90%",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.3)",
              background: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <div
              className="admin-form-card__header"
              style={{ marginBottom: "14px" }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>
                {confirmAction.type === "delete"
                  ? "Xác nhận xóa sản phẩm"
                  : confirmAction.type === "hide"
                  ? "Xác nhận ẩn sản phẩm"
                  : "Xác nhận hiện sản phẩm"}
              </h3>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "#657584",
                }}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                fontSize: "0.95rem",
                color: "#415464",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              {confirmAction.type === "delete"
                ? `Bạn có chắc chắn muốn xóa mềm sản phẩm "${confirmAction.productName}"? Sản phẩm sẽ bị chuyển vào danh sách đã xóa.`
                : confirmAction.type === "hide"
                ? `Bạn có chắc chắn muốn ẩn sản phẩm "${confirmAction.productName}" khỏi storefront? Khách hàng sẽ không nhìn thấy sản phẩm này nữa.`
                : `Bạn có chắc chắn muốn cho hiển thị lại sản phẩm "${confirmAction.productName}" trên storefront?`}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setConfirmAction(null)}
              >
                Hủy bỏ
              </button>

              {confirmAction.type === "delete" ? (
                <form
                  action={async (formData) => {
                    try {
                      await softDeleteProduct(formData);
                      showToast(`Đã xóa sản phẩm "${confirmAction.productName}" thành công!`);
                    } catch {
                      showToast("Xóa sản phẩm thất bại", "error");
                    } finally {
                      setConfirmAction(null);
                    }
                  }}
                >
                  <input name="id" type="hidden" value={confirmAction.productId} />
                  <button className="admin-danger-button" type="submit">
                    Xác nhận xóa
                  </button>
                </form>
              ) : (
                <form
                  action={async (formData) => {
                    try {
                      await toggleProductActive(formData);
                      showToast(
                        confirmAction.type === "hide"
                          ? `Đã ẩn sản phẩm "${confirmAction.productName}" thành công!`
                          : `Đã hiện sản phẩm "${confirmAction.productName}" thành công!`
                      );
                    } catch {
                      showToast("Cập nhật trạng thái thất bại", "error");
                    } finally {
                      setConfirmAction(null);
                    }
                  }}
                >
                  <input name="id" type="hidden" value={confirmAction.productId} />
                  <input
                    name="currentValue"
                    type="hidden"
                    value={String(confirmAction.currentActiveValue)}
                  />
                  <button className="admin-primary-button" type="submit">
                    {confirmAction.type === "hide"
                      ? "Xác nhận ẩn"
                      : "Xác nhận hiện"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
