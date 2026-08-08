import {
  createCategory,
  toggleCategoryDeleted,
  updateCategory,
} from "@/app/admin/actions";
import { AdminPageHeader, EmptyBlock, StatusBadge } from "@/components/admin/AdminUi";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCategoriesData() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      parent: {
        select: { id: true, name: true },
      },
      children: {
        select: { id: true },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  return {
    categories,
    activeCategories: categories.filter((category) => !category.deletedAt),
  };
}

export default async function AdminCategoriesPage() {
  const { categories, activeCategories } = await getCategoriesData();

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Quản lý danh mục"
        description="Tạo, chỉnh sửa, sắp xếp, phân cấp và ẩn/khôi phục danh mục sản phẩm trong admin."
      />

      <section className="admin-form-grid admin-form-grid--compact">
        <form action={createCategory} className="admin-form-card">
          <div className="admin-form-card__header">
            <h3>Thêm danh mục</h3>
            <span>{activeCategories.length} đang dùng</span>
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
              Danh mục cha
              <select name="parentId" defaultValue="">
                <option value="">Không có</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Icon URL
              <input name="iconUrl" placeholder="/icon-washing-machine.svg" />
            </label>
            <label>
              Thứ tự hiển thị
              <input name="order" type="number" defaultValue="0" />
            </label>
            <button className="admin-primary-button" type="submit">
              Tạo danh mục
            </button>
          </div>
        </form>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Tổng quan</p>
              <h2>{categories.length} danh mục</h2>
            </div>
          </div>
          <div className="admin-list">
            <article className="admin-list-item">
              <div>
                <h3>Đang hoạt động</h3>
                <p>Danh mục chưa bị ẩn khỏi hệ thống</p>
              </div>
              <div className="admin-list-item__meta">
                <strong>{activeCategories.length}</strong>
                <span>danh mục</span>
              </div>
            </article>
            <article className="admin-list-item">
              <div>
                <h3>Đang ẩn</h3>
                <p>Có thể khôi phục lại bất cứ lúc nào</p>
              </div>
              <div className="admin-list-item__meta">
                <strong>{categories.length - activeCategories.length}</strong>
                <span>danh mục</span>
              </div>
            </article>
          </div>
        </section>
      </section>

      <section className="admin-records">
        <div className="admin-panel__header admin-panel__header--loose">
          <div>
            <p className="admin-eyebrow">Danh sách</p>
            <h2>Chỉnh sửa danh mục</h2>
          </div>
        </div>

        {categories.length === 0 ? (
          <EmptyBlock>Chưa có danh mục nào trong hệ thống.</EmptyBlock>
        ) : (
          categories.map((category) => (
            <article className="admin-record-card" key={category.id}>
              <div className="admin-record-card__header">
                <div>
                  <p className="admin-eyebrow">
                    {category.parent ? `Thuộc ${category.parent.name}` : "Danh mục gốc"}
                  </p>
                  <h3>{category.name}</h3>
                  <span>
                    /{category.slug} - {category._count.products} sản phẩm - {category.children.length} danh mục con
                  </span>
                </div>
                <StatusBadge
                  value={category.deletedAt ? "cancelled" : "completed"}
                  labels={{
                    completed: "Đang dùng",
                    cancelled: "Đã ẩn",
                  }}
                />
              </div>

              <form action={updateCategory} className="admin-edit-grid">
                <input name="id" type="hidden" value={category.id} />
                <label>
                  Tên danh mục
                  <input name="name" required defaultValue={category.name} />
                </label>
                <label>
                  Slug
                  <input name="slug" defaultValue={category.slug} />
                </label>
                <label>
                  Danh mục cha
                  <select name="parentId" defaultValue={category.parent?.id ?? ""}>
                    <option value="">Không có</option>
                    {activeCategories
                      .filter((option) => option.id !== category.id)
                      .map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Icon URL
                  <input name="iconUrl" defaultValue={category.iconUrl ?? ""} />
                </label>
                <label>
                  Thứ tự
                  <input name="order" type="number" defaultValue={category.order} />
                </label>
                <button className="admin-primary-button" type="submit">
                  Lưu danh mục
                </button>
              </form>

              <div className="admin-record-card__body">
                <div className="admin-record-actions">
                  <form action={toggleCategoryDeleted}>
                    <input name="id" type="hidden" value={category.id} />
                    <input
                      name="mode"
                      type="hidden"
                      value={category.deletedAt ? "restore" : "delete"}
                    />
                    <button
                      className={
                        category.deletedAt
                          ? "admin-secondary-button"
                          : "admin-danger-button"
                      }
                      type="submit"
                    >
                      {category.deletedAt ? "Khôi phục danh mục" : "Ẩn danh mục"}
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
