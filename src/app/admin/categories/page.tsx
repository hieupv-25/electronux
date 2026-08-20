import Link from "next/link";
import {
  createCategory,
  toggleCategoryDeleted,
  updateCategory,
} from "@/app/admin/actions";
import { AdminPageHeader, EmptyBlock, StatusBadge } from "@/components/admin/AdminUi";
import type { CategoryWhereInput } from "@/generated/prisma/models/Category";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const categoryPageSize = 10;
const categoryStatuses = ["all", "active", "hidden"] as const;
const categoryParentScopes = ["all", "root", "child"] as const;

type CategorySearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type CategoryStatusFilter = (typeof categoryStatuses)[number];
type CategoryParentScope = (typeof categoryParentScopes)[number];

type CategoryFilters = {
  q: string;
  status: CategoryStatusFilter;
  parent: CategoryParentScope;
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

function normalizeCategoryStatus(value: string): CategoryStatusFilter {
  return (categoryStatuses as readonly string[]).includes(value)
    ? (value as CategoryStatusFilter)
    : "all";
}

function normalizeCategoryParent(value: string): CategoryParentScope {
  return (categoryParentScopes as readonly string[]).includes(value)
    ? (value as CategoryParentScope)
    : "all";
}

function buildCategoryWhere(filters: CategoryFilters): CategoryWhereInput {
  const andFilters: CategoryWhereInput[] = [];

  if (filters.q) {
    const stringFilter = {
      contains: filters.q,
      mode: "insensitive" as const,
    };

    andFilters.push({
      OR: [
        { name: stringFilter },
        { slug: stringFilter },
        {
          parent: {
            name: stringFilter,
          },
        },
      ],
    });
  }

  if (filters.status === "active") {
    andFilters.push({ deletedAt: null });
  }

  if (filters.status === "hidden") {
    andFilters.push({ deletedAt: { not: null } });
  }

  if (filters.parent === "root") {
    andFilters.push({ parentId: null });
  }

  if (filters.parent === "child") {
    andFilters.push({ parentId: { not: null } });
  }

  return andFilters.length === 0 ? {} : { AND: andFilters };
}

function buildCategoriesHref(filters: CategoryFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.parent !== "all") params.set("parent", filters.parent);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/categories?${query}` : "/admin/categories";
}

async function getCategoriesData(filters: CategoryFilters) {
  const where = buildCategoryWhere(filters);
  const totalCount = await prisma.category.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / categoryPageSize));
  const currentPage = Math.min(filters.page, totalPages);

  const [categories, activeCategories, summary] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      skip: (currentPage - 1) * categoryPageSize,
      take: categoryPageSize,
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
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    Promise.all([
      prisma.category.count(),
      prisma.category.count({ where: { deletedAt: null } }),
      prisma.category.count({ where: { deletedAt: { not: null } } }),
      prisma.category.count({ where: { parentId: null } }),
    ]),
  ]);

  return {
    categories,
    activeCategories,
    totalCount,
    totalPages,
    currentPage,
    summary: {
      all: summary[0],
      active: summary[1],
      hidden: summary[2],
      root: summary[3],
    },
  };
}

function CategoryFilterBar({ filters }: { filters: CategoryFilters }) {
  return (
    <section className="admin-panel admin-section-gap">
      <form className="admin-filter-bar admin-category-filter" method="get">
        <label>
          Tìm kiếm danh mục
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Tên danh mục, slug hoặc danh mục cha..."
          />
        </label>
        <label>
          Cấp danh mục
          <select name="parent" defaultValue={filters.parent}>
            <option value="all">Tất cả cấp</option>
            <option value="root">Danh mục gốc</option>
            <option value="child">Danh mục con</option>
          </select>
        </label>
        <label>
          Trạng thái
          <select name="status" defaultValue={filters.status}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang dùng</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </label>
        <button className="admin-primary-button" type="submit">
          Tìm kiếm
        </button>
        <Link className="admin-secondary-button" href="/admin/categories">
          Đặt lại
        </Link>
      </form>
    </section>
  );
}

function CategorySummary({
  totalCount,
  summary,
}: {
  totalCount: number;
  summary: Awaited<ReturnType<typeof getCategoriesData>>["summary"];
}) {
  return (
    <section className="admin-management-summary" aria-label="Tóm tắt danh mục">
      <article>
        <span>Kết quả đang xem</span>
        <strong>{totalCount.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Tổng danh mục</span>
        <strong>{summary.all.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Đang dùng</span>
        <strong>{summary.active.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Đã ẩn</span>
        <strong>{summary.hidden.toLocaleString("vi-VN")}</strong>
      </article>
      <article>
        <span>Danh mục gốc</span>
        <strong>{summary.root.toLocaleString("vi-VN")}</strong>
      </article>
    </section>
  );
}

function CategoriesPagination({
  filters,
  currentPage,
  totalPages,
}: {
  filters: CategoryFilters;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="admin-pagination" aria-label="Phân trang danh mục">
      <Link
        className={
          currentPage <= 1
            ? "admin-pagination__link admin-pagination__link--disabled"
            : "admin-pagination__link"
        }
        href={buildCategoriesHref(filters, Math.max(1, currentPage - 1))}
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
        href={buildCategoriesHref(filters, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage >= totalPages}
      >
        Sau
      </Link>
    </nav>
  );
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: CategorySearchParams;
}) {
  const params = await searchParams;
  const filters: CategoryFilters = {
    q: getParam(params, "q").trim(),
    status: normalizeCategoryStatus(getParam(params, "status")),
    parent: normalizeCategoryParent(getParam(params, "parent")),
    page: normalizePage(getParam(params, "page")),
  };
  const {
    categories,
    activeCategories,
    totalCount,
    totalPages,
    currentPage,
    summary,
  } = await getCategoriesData(filters);
  const isFiltering =
    Boolean(filters.q) ||
    filters.status !== "all" ||
    filters.parent !== "all";

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
              <h2>{summary.all} danh mục</h2>
            </div>
          </div>
          <div className="admin-list">
            <article className="admin-list-item">
              <div>
                <h3>Đang hoạt động</h3>
                <p>Danh mục chưa bị ẩn khỏi hệ thống</p>
              </div>
              <div className="admin-list-item__meta">
                <strong>{summary.active}</strong>
                <span>danh mục</span>
              </div>
            </article>
            <article className="admin-list-item">
              <div>
                <h3>Đang ẩn</h3>
                <p>Có thể khôi phục lại bất cứ lúc nào</p>
              </div>
              <div className="admin-list-item__meta">
                <strong>{summary.hidden}</strong>
                <span>danh mục</span>
              </div>
            </article>
          </div>
        </section>
      </section>

      <CategoryFilterBar filters={filters} />
      <CategorySummary totalCount={totalCount} summary={summary} />

      <section className="admin-records admin-compact-list">
        <div className="admin-panel__header admin-panel__header--loose">
          <div>
            <p className="admin-eyebrow">Danh sách</p>
            <h2>
              {isFiltering
                ? `${totalCount} kết quả phù hợp`
                : "Chỉnh sửa danh mục"}
            </h2>
          </div>
        </div>

        {categories.length === 0 ? (
          <EmptyBlock>
            {isFiltering
              ? "Không tìm thấy danh mục phù hợp với bộ lọc hiện tại."
              : "Chưa có danh mục nào trong hệ thống."}
          </EmptyBlock>
        ) : (
          categories.map((category, index) => (
            <details
              className="admin-record-card admin-compact-row"
              key={category.id}
              open={categories.length === 1 && index === 0}
            >
              <summary className="admin-compact-row__summary">
                <div className="admin-compact-row__main">
                  <p className="admin-eyebrow">
                    {category.parent ? `Thuộc ${category.parent.name}` : "Danh mục gốc"}
                  </p>
                  <h3>{category.name}</h3>
                  <span>/{category.slug}</span>
                </div>
                <div className="admin-compact-row__meta">
                  <span>
                    <small>Sản phẩm</small>
                    <strong>{category._count.products}</strong>
                  </span>
                  <span>
                    <small>Danh mục con</small>
                    <strong>{category.children.length}</strong>
                  </span>
                  <span>
                    <small>Thứ tự</small>
                    <strong>{category.order}</strong>
                  </span>
                </div>
                <div className="admin-status-stack">
                  <StatusBadge
                    value={category.deletedAt ? "cancelled" : "completed"}
                    labels={{
                      completed: "Đang dùng",
                      cancelled: "Đã ẩn",
                    }}
                  />
                  <span className="admin-compact-row__hint">Chi tiết</span>
                </div>
              </summary>

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
            </details>
          ))
        )}
      </section>

      <CategoriesPagination
        filters={filters}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  );
}
