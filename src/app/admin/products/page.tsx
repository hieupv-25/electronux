import { AdminPageHeader, EmptyBlock, StatusBadge } from "@/components/admin/AdminUi";
import {
  createBrand,
  createCategory,
  createProduct,
  createVariant,
  softDeleteProduct,
  toggleProductActive,
  updateVariant,
} from "@/app/admin/actions";
import { formatDate } from "@/lib/admin-format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getProductsData() {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 60,
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
  ]);

  return { products, categories, brands };
}

export default async function AdminProductsPage() {
  const { products, categories, brands } = await getProductsData();

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Quản lý sản phẩm"
        description="Tạo danh mục, thương hiệu, sản phẩm, SKU và cập nhật tồn kho trực tiếp từ admin."
      />

      <section className="admin-form-grid">
        <form action={createProduct} className="admin-form-card admin-form-card--wide">
          <div className="admin-form-card__header">
            <h3>Thêm sản phẩm</h3>
            <span>{categories.length} danh mục</span>
          </div>
          {categories.length === 0 ? (
            <EmptyBlock>Hãy tạo ít nhất một danh mục trước khi thêm sản phẩm.</EmptyBlock>
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

        <form action={createCategory} className="admin-form-card">
          <div className="admin-form-card__header">
            <h3>Danh mục</h3>
            <span>{categories.length}</span>
          </div>
          <div className="admin-form-fields">
            <label>
              Tên danh mục
              <input name="name" required placeholder="Máy giặt" />
            </label>
            <label>
              Slug
              <input name="slug" placeholder="may-giat" />
            </label>
            <label>
              Icon URL
              <input name="iconUrl" placeholder="/icon-washing-machine.svg" />
            </label>
            <label>
              Thứ tự
              <input name="order" type="number" defaultValue="0" />
            </label>
            <button className="admin-secondary-button" type="submit">
              Thêm danh mục
            </button>
          </div>
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
            <h2>{products.length} sản phẩm gần nhất</h2>
          </div>
        </div>
        {products.length === 0 ? (
          <EmptyBlock>Chưa có sản phẩm nào trong hệ thống.</EmptyBlock>
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
