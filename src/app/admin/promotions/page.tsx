import {
  createCoupon,
  createPromotion,
  deletePromotion,
  toggleCouponActive,
  togglePromotionActive,
  updatePromotion,
} from "@/app/admin/actions";
import { AdminPageHeader, EmptyTable, StatusBadge } from "@/components/admin/AdminUi";
import {
  formatCurrency,
  formatDate,
  toDateInputValue,
} from "@/lib/admin-format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const todayInput = new Date().toISOString().slice(0, 10);

async function getPromotionsData() {
  const [coupons, promotions] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        minOrderAmount: true,
        maxDiscountAmount: true,
        usageLimit: true,
        usageLimitPerUser: true,
        usedCount: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    }),
    prisma.promotion.findMany({
      orderBy: { startDate: "desc" },
      take: 60,
      select: {
        id: true,
        slug: true,
        title: true,
        discountPercentage: true,
        description: true,
        highlights: true,
        terms: true,
        startDate: true,
        endDate: true,
        bannerImageUrl: true,
        linkUrl: true,
        isActive: true,
      },
    }),
  ]);

  return { coupons, promotions };
}

function discountLabel(type: string, value: unknown) {
  if (type === "percentage") return `${Number(value)}%`;
  if (type === "free_shipping") return "Miễn phí vận chuyển";
  return formatCurrency(value);
}

function jsonListToText(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : "";
}

export default async function AdminPromotionsPage() {
  const { coupons, promotions } = await getPromotionsData();

  return (
    <>
      <AdminPageHeader
        eyebrow="Marketing"
        title="Quản lý khuyến mãi"
        description="Tạo coupon, bật/tắt mã giảm giá và theo dõi các chiến dịch đang chạy."
      />

      <section className="admin-form-grid">
        <form action={createCoupon} className="admin-form-card admin-form-card--wide">
          <div className="admin-form-card__header">
            <h3>Tạo coupon</h3>
            <span>{coupons.length} mã</span>
          </div>
          <div className="admin-form-fields admin-form-fields--two">
            <label>
              Mã coupon
              <input name="code" required placeholder="SALE50K" />
            </label>
            <label>
              Loại giảm
              <select name="discountType" defaultValue="percentage">
                <option value="percentage">Phần trăm</option>
                <option value="fixed_amount">Số tiền cố định</option>
                <option value="free_shipping">Miễn phí vận chuyển</option>
              </select>
            </label>
            <label>
              Giá trị giảm
              <input name="discountValue" inputMode="numeric" required placeholder="10 hoặc 50000" />
            </label>
            <label>
              Đơn tối thiểu
              <input name="minOrderAmount" inputMode="numeric" placeholder="1000000" />
            </label>
            <label>
              Giảm tối đa
              <input name="maxDiscountAmount" inputMode="numeric" placeholder="500000" />
            </label>
            <label>
              Tổng lượt dùng
              <input name="usageLimit" type="number" min="0" placeholder="100" />
            </label>
            <label>
              Lượt dùng / khách
              <input name="usageLimitPerUser" type="number" min="1" defaultValue="1" />
            </label>
            <label>
              Ngày bắt đầu
              <input name="startDate" type="date" defaultValue={todayInput} />
            </label>
            <label>
              Ngày kết thúc
              <input name="endDate" type="date" defaultValue={todayInput} />
            </label>
            <label className="admin-checkbox-inline">
              <input name="isActive" type="checkbox" defaultChecked />
              Kích hoạt ngay
            </label>
            <button className="admin-primary-button admin-field-span" type="submit">
              Tạo coupon
            </button>
          </div>
        </form>

        <form action={createPromotion} className="admin-form-card">
          <div className="admin-form-card__header">
            <h3>Chiến dịch</h3>
            <span>{promotions.length}</span>
          </div>
          <div className="admin-form-fields">
            <label>
              Tên chiến dịch
              <input name="title" required placeholder="Sale lớn giữa năm" />
            </label>
            <label>
              Slug
              <input name="slug" placeholder="sale-lon-giua-nam" />
            </label>
            <label>
              Giảm giá %
              <input name="discountPercentage" type="number" min="0" max="100" defaultValue="10" />
            </label>
            <label>
              Mô tả
              <textarea name="description" rows={4} placeholder="Nội dung chi tiết của chiến dịch" />
            </label>
            <label>
              Đặc quyền
              <textarea name="highlights" rows={4} placeholder="Mỗi dòng là một đặc quyền" />
            </label>
            <label>
              Điều khoản
              <textarea name="terms" rows={4} placeholder="Mỗi dòng là một điều khoản" />
            </label>
            <label>
              Ngày bắt đầu
              <input name="startDate" type="date" defaultValue={todayInput} />
            </label>
            <label>
              Ngày kết thúc
              <input name="endDate" type="date" defaultValue={todayInput} />
            </label>
            <label>
              Banner URL
              <input name="bannerImageUrl" placeholder="https://..." />
            </label>
            <label>
              Link mua sắm
              <input name="linkUrl" placeholder="/thiet-bi/may-giat" />
            </label>
            <label className="admin-checkbox-inline">
              <input name="isActive" type="checkbox" defaultChecked />
              Hiển thị trên web
            </label>
            <button className="admin-secondary-button" type="submit">
              Tạo chiến dịch
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel admin-section-gap">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Coupon</p>
            <h2>Mã giảm giá</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Giảm</th>
                <th>Điều kiện</th>
                <th>Lượt dùng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <EmptyTable columns={7} label="Chưa có coupon nào." />
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="admin-table__strong">{coupon.code}</td>
                    <td>{discountLabel(coupon.discountType, coupon.discountValue)}</td>
                    <td>
                      <span className="admin-table__primary">
                        Tối thiểu {formatCurrency(coupon.minOrderAmount)}
                      </span>
                      <span className="admin-table__secondary">
                        Tối đa {coupon.maxDiscountAmount ? formatCurrency(coupon.maxDiscountAmount) : "không giới hạn"}
                      </span>
                    </td>
                    <td>
                      <span className="admin-table__primary">
                        {coupon.usedCount}/{coupon.usageLimit ?? "∞"}
                      </span>
                      <span className="admin-table__secondary">
                        {coupon.usageLimitPerUser ?? 1} lượt / khách
                      </span>
                    </td>
                    <td>
                      {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                    </td>
                    <td>
                      <StatusBadge
                        value={coupon.isActive ? "completed" : "cancelled"}
                        labels={{
                          completed: "Đang bật",
                          cancelled: "Đã tắt",
                        }}
                      />
                    </td>
                    <td>
                      <form action={toggleCouponActive}>
                        <input name="id" type="hidden" value={coupon.id} />
                        <input
                          name="currentValue"
                          type="hidden"
                          value={String(coupon.isActive)}
                        />
                        <button className="admin-secondary-button" type="submit">
                          {coupon.isActive ? "Tắt" : "Bật"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel admin-section-gap">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Campaign</p>
            <h2>Chiến dịch khuyến mãi</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr>
                <th>Nội dung chiến dịch</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <EmptyTable columns={3} label="Chưa có chiến dịch nào." />
              ) : (
                promotions.map((promotion) => (
                  <tr key={promotion.id}>
                    <td>
                      <form action={updatePromotion} className="admin-form-fields admin-form-fields--two">
                        <input name="id" type="hidden" value={promotion.id} />
                        <label>
                          Tên chiến dịch
                          <input name="title" required defaultValue={promotion.title} />
                        </label>
                        <label>
                          Slug
                          <input name="slug" defaultValue={promotion.slug} />
                        </label>
                        <label>
                          Giảm %
                          <input
                            name="discountPercentage"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={promotion.discountPercentage}
                          />
                        </label>
                        <label>
                          Link mua sắm
                          <input name="linkUrl" defaultValue={promotion.linkUrl ?? ""} />
                        </label>
                        <label>
                          Ngày bắt đầu
                          <input name="startDate" type="date" defaultValue={toDateInputValue(promotion.startDate)} />
                        </label>
                        <label>
                          Ngày kết thúc
                          <input name="endDate" type="date" defaultValue={toDateInputValue(promotion.endDate)} />
                        </label>
                        <label className="admin-field-span">
                          Banner URL
                          <input name="bannerImageUrl" defaultValue={promotion.bannerImageUrl ?? ""} />
                        </label>
                        <label className="admin-field-span">
                          Mô tả
                          <textarea name="description" rows={3} defaultValue={promotion.description ?? ""} />
                        </label>
                        <label>
                          Đặc quyền
                          <textarea name="highlights" rows={4} defaultValue={jsonListToText(promotion.highlights)} />
                        </label>
                        <label>
                          Điều khoản
                          <textarea name="terms" rows={4} defaultValue={jsonListToText(promotion.terms)} />
                        </label>
                        <label className="admin-checkbox-inline">
                          <input name="isActive" type="checkbox" defaultChecked={promotion.isActive} />
                          Hiển thị
                        </label>
                        <button className="admin-primary-button" type="submit">
                          Lưu thay đổi
                        </button>
                      </form>
                    </td>
                    <td>
                      <StatusBadge
                        value={promotion.isActive ? "completed" : "cancelled"}
                        labels={{
                          completed: "Đang hiển thị",
                          cancelled: "Đã ẩn",
                        }}
                      />
                      <span className="admin-table__secondary">
                        {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-status-stack">
                        <form action={togglePromotionActive}>
                          <input name="id" type="hidden" value={promotion.id} />
                          <input name="currentValue" type="hidden" value={String(promotion.isActive)} />
                          <button className="admin-secondary-button" type="submit">
                            {promotion.isActive ? "Ẩn" : "Hiện"}
                          </button>
                        </form>
                        <form action={deletePromotion}>
                          <input name="id" type="hidden" value={promotion.id} />
                          <button className="admin-danger-button" type="submit">
                            Xóa
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
