import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminUi";
import {
  analyticsMetrics,
  formatAnalyticsValue,
  getAdminAnalyticsData,
  getAnalyticsYears,
  normalizeAnalyticsMetric,
  normalizeAnalyticsMonth,
  normalizeAnalyticsPeriod,
  normalizeAnalyticsYear,
  type AnalyticsMetric,
  type AnalyticsPeriod,
  type AnalyticsPoint,
} from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

type AdminAnalyticsPageProps = {
  searchParams?: Promise<{
    metric?: string | string[];
    period?: string | string[];
    year?: string | string[];
    month?: string | string[];
  }>;
};

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const metricOptions = Object.entries(analyticsMetrics) as Array<
  [AnalyticsMetric, (typeof analyticsMetrics)[AnalyticsMetric]]
>;

function getPercentLabel(value: number | null) {
  if (value === null) return "Chưa có dữ liệu kỳ trước";
  const rounded = Math.abs(value).toFixed(1).replace(".", ",");
  if (value > 0) return `Tăng ${rounded}% so với kỳ trước`;
  if (value < 0) return `Giảm ${rounded}% so với kỳ trước`;
  return "Không đổi so với kỳ trước";
}

function AnalyticsBars({
  points,
  metric,
}: {
  points: AnalyticsPoint[];
  metric: AnalyticsMetric;
}) {
  const meta = analyticsMetrics[metric];
  const maxValue = Math.max(...points.map((point) => point.value), 0);

  return (
    <div className="admin-chart" role="img" aria-label={`Biểu đồ ${meta.shortLabel}`}>
      <div className="admin-chart__plot">
        {points.map((point) => {
          const height = maxValue > 0 ? Math.max(4, Math.round((point.value / maxValue) * 100)) : 0;

          return (
            <div className="admin-chart__bar" key={point.key}>
              <span>{formatAnalyticsValue(point.value, meta.unit)}</span>
              <i
                style={{
                  height: `${height}%`,
                  backgroundColor: meta.accent,
                }}
              />
              <strong>{point.label}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsFilters({
  metric,
  period,
  year,
  month,
}: {
  metric: AnalyticsMetric;
  period: AnalyticsPeriod;
  year: number;
  month: number;
}) {
  return (
    <form className="admin-filter-bar admin-analytics-filter" method="get">
      <label>
        Chỉ số
        <select name="metric" defaultValue={metric}>
          {metricOptions.map(([key, meta]) => (
            <option value={key} key={key}>
              {meta.shortLabel}
            </option>
          ))}
        </select>
      </label>

      <label>
        Kiểu thống kê
        <select name="period" defaultValue={period}>
          <option value="month">Theo tháng</option>
          <option value="year">Theo năm</option>
        </select>
      </label>

      <label>
        Tháng
        <select name="month" defaultValue={month}>
          {monthOptions.map((value) => (
            <option value={value} key={value}>
              Tháng {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Năm
        <select name="year" defaultValue={year}>
          {getAnalyticsYears().map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <button className="admin-primary-button" type="submit">
        Cập nhật
      </button>
    </form>
  );
}

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const params = await searchParams;
  const metric = normalizeAnalyticsMetric(params?.metric);
  const period = normalizeAnalyticsPeriod(params?.period);
  const year = normalizeAnalyticsYear(params?.year);
  const month = normalizeAnalyticsMonth(params?.month);
  const meta = analyticsMetrics[metric];
  const data = await getAdminAnalyticsData({ metric, period, year, month });
  const activePointLabel = period === "year" ? "tháng" : "ngày";

  return (
    <>
      <AdminPageHeader
        eyebrow="Thống kê"
        title={`Thống kê ${meta.shortLabel.toLowerCase()}`}
        description={`${meta.description} Có thể xem theo từng tháng hoặc cả năm.`}
        actions={
          <Link className="admin-secondary-button" href="/admin">
            Quay lại dashboard
          </Link>
        }
      />

      <AnalyticsFilters metric={metric} period={period} year={year} month={month} />

      <section className="admin-analytics-layout">
        <div className="admin-panel admin-analytics-chart-panel">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">{data.rangeLabel}</p>
              <h2>{meta.label}</h2>
            </div>
            <span className="admin-analytics-change">{getPercentLabel(data.changePercent)}</span>
          </div>
          <AnalyticsBars points={data.points} metric={metric} />
        </div>

        <aside className="admin-analytics-summary" aria-label="Tóm tắt thống kê">
          <article className="admin-panel admin-analytics-kpi">
            <span>Tổng cộng</span>
            <strong>{formatAnalyticsValue(data.total, meta.unit)}</strong>
            <p>{data.rangeLabel}</p>
          </article>
          <article className="admin-panel admin-analytics-kpi">
            <span>Trung bình</span>
            <strong>{formatAnalyticsValue(data.average, meta.unit)}</strong>
            <p>Trung bình theo mỗi {activePointLabel}</p>
          </article>
          <article className="admin-panel admin-analytics-kpi">
            <span>Cao nhất</span>
            <strong>{formatAnalyticsValue(data.peak.value, meta.unit)}</strong>
            <p>
              {period === "year" ? "Tháng" : "Ngày"} {data.peak.label || "-"}
            </p>
          </article>
          <article className="admin-panel admin-analytics-kpi">
            <span>Có phát sinh</span>
            <strong>{data.activePoints.length.toLocaleString("vi-VN")}</strong>
            <p>Số {activePointLabel} có dữ liệu</p>
          </article>
        </aside>
      </section>

      <section className="admin-panel admin-section-gap">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Chi tiết</p>
            <h2>Bảng dữ liệu theo {activePointLabel}</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{period === "year" ? "Tháng" : "Ngày"}</th>
                <th>{meta.shortLabel}</th>
                <th>Tỷ trọng</th>
              </tr>
            </thead>
            <tbody>
              {data.points.map((point) => {
                const percent = data.total > 0 ? (point.value / data.total) * 100 : 0;

                return (
                  <tr key={point.key}>
                    <td className="admin-table__strong">{point.label}</td>
                    <td>{formatAnalyticsValue(point.value, meta.unit)}</td>
                    <td>{percent.toFixed(1).replace(".", ",")}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
