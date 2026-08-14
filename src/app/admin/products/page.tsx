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
import { formatDate } from "@/lib/admin-format";
import { prisma } from "@/lib/prisma";
import type { ProductWhereInput } from "@/generated/prisma/models/Product";

export const dynamic = "force-dynamic";

type ProductSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type ProductFilters = {
  q: string;
  categoryId: string;
  status: string;
  stock: string;
};

function getParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function buildProductWhere(filters: ProductFilters): ProductWhereInput {
  const andFilters: ProductWhereInput[] = [{ deletedAt: null }];

  if (filters.q) {
    andFilters.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { slug: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        {
          category: {
            name: { contains: filters.q, mode: "insensitive" },
          },
        },
        {
          brand: {
            name: { contains: filters.q, mode: "insensitive" },
          },
        },
        {
          variants: {
            some: {
              OR: [
                { sku: { contains: filters.q, mode: "insensitive" } },
                {
                  variantName: {
                    contains: filters.q,
                    mode: "insensitive",
                  },
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

async function getProductsData(filters: ProductFilters) {
  const where = buildProductWhere(filters);

  const [products, totalProducts, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 80,
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
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { products, totalProducts, categories, brands };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: ProductSearchParams;
}) {
  const params = await searchParams;
  const filters = {
    q: getParam(params, "q").trim(),
    categoryId: getParam(params, "categoryId"),
    status: getParam(params, "status"),
    stock: getParam(params, "stock"),
  };
  const { products, totalProducts, categories, brands } =
    await getProductsData(filters);
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
            Tìm / lọc
          </button>
          <Link className="admin-secondary-button" href="/admin/products">
            Xóa lọc
          </Link>
        </form>
      </section>

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

      <section className="admin-records">
        <div className="admin-panel__header admin-panel__header--loose">
          <div>
            <p className="admin-eyebrow">Danh sách</p>
            <h2>
              {isFiltering
                ? `${totalProducts} kết quả phù hợp`
                : `${totalProducts} sản phẩm gần nhất`}
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
          products.map((product) => {
            const stock = product.variants.reduce(
              (total, variant) => total + variant.stockQuantity,
              0
            );

            return (
              <article className="admin-record-card" key={product.id}>
                <div className="admin-record-card__header">
                  <div>
                    <p className="admin-eyebrow">
                      {product.category.name}
                      {product.brand ? ` - ${product.brand.name}` : ""}
                    </p>
                    <h3>{product.name}</h3>
                    <span>
                      Tạo ngày {formatDate(product.createdAt)} - {product.variants.length} SKU - {stock} tồn kho
                    </span>
                  </div>
                  <StatusBadge
                    value={product.isActive ? "completed" : "cancelled"}
                    labels={{ completed: "Đang bán", cancelled: "Tạm ẩn" }}
                  />
                </div>

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
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
