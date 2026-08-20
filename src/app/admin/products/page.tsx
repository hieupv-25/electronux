import Link from "next/link";
import {
  createBrand,
  createProduct,
  createVariant,
  softDeleteProduct,
  toggleProductActive,
  updateVariant,
} from "@/app/admin/actions";
import { AdminPageHeader, EmptyBlock, StatusBadge } from "@/components/admin/AdminUi";
import type { ProductWhereInput } from "@/generated/prisma/models/Product";
import { formatDate } from "@/lib/admin-format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const productPageSize = 10;

type ProductSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type ProductFilters = {
  q: string;
  categoryId: string;
  status: string;
  stock: string;
  page: number;
};

function getParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalizePage(value: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function buildProductWhere(filters: ProductFilters): ProductWhereInput {
  const andFilters: ProductWhereInput[] = [{ deletedAt: null }];

  if (filters.q) {
    const stringFilter = {
      contains: filters.q,
      mode: "insensitive" as const,
    };

    andFilters.push({
      OR: [
        { name: stringFilter },
        { slug: stringFilter },
        { description: stringFilter },
        {
          category: {
            name: stringFilter,
          },
        },
        {
          brand: {
            name: stringFilter,
          },
        },
        {
          variants: {
            some: {
              OR: [
                { sku: stringFilter },
                {
                  variantName: stringFilter,
                },
              ],
            },
          },
        },
      ],
    });
  }

  if (filters.categoryId) {
    andFilters.push({ categoryId: filters.categoryId });
  }

  if (filters.status === "active") {
    andFilters.push({ isActive: true });
  }

  if (filters.status === "hidden") {
    andFilters.push({ isActive: false });
  }

  if (filters.stock === "low") {
    andFilters.push({
      variants: { some: { stockQuantity: { lte: 5 } } },
    });
  }

  if (filters.stock === "out") {
    andFilters.push({
      variants: { some: { stockQuantity: 0 } },
    });
  }

  return andFilters.length === 1 ? andFilters[0] : { AND: andFilters };
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

async function getProductsData(filters: ProductFilters) {
  const where = buildProductWhere(filters);
  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalProducts / productPageSize));
  const currentPage = Math.min(filters.page, totalPages);

  const [products, categories, brands, summary] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * productPageSize,
      take: productPageSize,
      include: {
        category: {
          select: { id: true, name: true },
        },
        brand: {
          select: { id: true, name: true },
        },
        variants: {
          orderBy: { sku: "asc" },
          select: {
            id: true,
            sku: true,
            variantName: true,
            price: true,
            discountPercentage: true,
            stockQuantity: true,
            isActive: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
          take: 1,
          select: { url: true },
        },
        _count: {
          select: { reviews: true, wishlistItems: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      prisma.product.count({ where: { deletedAt: null, isActive: false } }),
      prisma.product.count({
        where: {
          deletedAt: null,
          variants: { some: { stockQuantity: { lte: 5 } } },
        },
      }),
      prisma.product.count({
        where: {
          deletedAt: null,
          variants: { some: { stockQuantity: 0 } },
        },
      }),
    ]),
  ]);

  return {
    products,
    totalProducts,
    totalPages,
    currentPage,
    categories,
    brands,
    summary: {
      all: summary[0],
      active: summary[1],
      hidden: summary[2],
      lowStock: summary[3],
      outStock: summary[4],
    },
  };
}

function ProductFilterBar({
  filters,
  categories,
}: {
  filters: ProductFilters;
  categories: Awaited<ReturnType<typeof getProductsData>>["categories"];
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
  summary: Awaited<ReturnType<typeof getProductsData>>["summary"];
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

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: ProductSearchParams;
}) {
  const params = await searchParams;
  const filters: ProductFilters = {
    q: getParam(params, "q").trim(),
    categoryId: getParam(params, "categoryId"),
    status: getParam(params, "status"),
    stock: getParam(params, "stock"),
    page: normalizePage(getParam(params, "page")),
  };
  const {
    products,
    totalProducts,
    totalPages,
    currentPage,
    categories,
    brands,
    summary,
  } = await getProductsData(filters);
  const isFiltering =
    Boolean(filters.q) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.status) ||
    Boolean(filters.stock);

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Quản lý sản phẩm"
        description="Tạo sản phẩm, SKU, cập nhật tồn kho và tìm kiếm nhanh theo tên, slug, SKU, biến thể, hãng hoặc danh mục."
        actions={
          <Link className="admin-ghost-link" href="/admin/categories">
            Quản lý danh mục
          </Link>
        }
      />

      <ProductFilterBar filters={filters} categories={categories} />
      <ProductSummary totalProducts={totalProducts} summary={summary} />

      <section className="admin-form-grid">
        <form action={createProduct} className="admin-form-card admin-form-card--wide">
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
                <select name="categoryId" required>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Thương hiệu
                <select name="brandId">
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
              <label>
                Ảnh sản phẩm
                <input name="imageUrl" placeholder="https://..." />
              </label>
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

        <form action={createBrand} className="admin-form-card">
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

                <div className="admin-record-card__body">
                  <div className="admin-mini-stats">
                    <span>Yêu thích: {product._count.wishlistItems}</span>
                    <span>Đánh giá: {product._count.reviews}</span>
                    <span>Ảnh: {product.images.length}</span>
                  </div>

                  <div className="admin-record-actions">
                    <form action={toggleProductActive}>
                      <input name="id" type="hidden" value={product.id} />
                      <input
                        name="currentValue"
                        type="hidden"
                        value={String(product.isActive)}
                      />
                      <button className="admin-secondary-button" type="submit">
                        {product.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                      </button>
                    </form>
                    <form action={softDeleteProduct}>
                      <input name="id" type="hidden" value={product.id} />
                      <button className="admin-danger-button" type="submit">
                        Xóa mềm
                      </button>
                    </form>
                  </div>

                  <div className="admin-variant-list">
                    {product.variants.map((variant) => (
                      <form
                        action={updateVariant}
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

                    <form action={createVariant} className="admin-variant-row admin-variant-row--new">
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
    </>
  );
}
