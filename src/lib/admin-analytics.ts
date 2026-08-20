import { prisma } from "@/lib/prisma";

export type AnalyticsMetric = "revenue" | "orders" | "products" | "customers" | "services";
export type AnalyticsPeriod = "month" | "year";
export type AnalyticsUnit = "currency" | "count";

export type AnalyticsPoint = {
  key: string;
  label: string;
  value: number;
};

export const analyticsMetrics: Record<
  AnalyticsMetric,
  {
    label: string;
    shortLabel: string;
    description: string;
    unit: AnalyticsUnit;
    accent: string;
  }
> = {
  revenue: {
    label: "Doanh thu đã thanh toán",
    shortLabel: "Doanh thu",
    description: "Tổng giá trị các đơn hàng có trạng thái thanh toán paid.",
    unit: "currency",
    accent: "#0f766e",
  },
  orders: {
    label: "Đơn hàng",
    shortLabel: "Đơn hàng",
    description: "Số đơn hàng được tạo trong khoảng thời gian đã chọn.",
    unit: "count",
    accent: "#e30613",
  },
  products: {
    label: "Sản phẩm mới",
    shortLabel: "Sản phẩm",
    description: "Số sản phẩm được thêm vào hệ thống trong khoảng thời gian đã chọn.",
    unit: "count",
    accent: "#2563eb",
  },
  customers: {
    label: "Khách hàng mới",
    shortLabel: "Khách hàng",
    description: "Số tài khoản customer mới trong khoảng thời gian đã chọn.",
    unit: "count",
    accent: "#7c3aed",
  },
  services: {
    label: "Yêu cầu dịch vụ",
    shortLabel: "Dịch vụ",
    description: "Số lịch hẹn/yêu cầu bảo hành được gửi trong khoảng thời gian đã chọn.",
    unit: "count",
    accent: "#ca8a04",
  },
};

const metricKeys = Object.keys(analyticsMetrics) as AnalyticsMetric[];

export function normalizeAnalyticsMetric(value?: string | string[] | null): AnalyticsMetric {
  const metric = Array.isArray(value) ? value[0] : value;
  return metricKeys.includes(metric as AnalyticsMetric) ? (metric as AnalyticsMetric) : "revenue";
}

export function normalizeAnalyticsPeriod(value?: string | string[] | null): AnalyticsPeriod {
  const period = Array.isArray(value) ? value[0] : value;
  return period === "year" ? "year" : "month";
}

export function normalizeAnalyticsYear(value?: string | string[] | null) {
  const currentYear = new Date().getFullYear();
  const raw = Array.isArray(value) ? value[0] : value;
  const year = Number(raw);
  return Number.isInteger(year) && year >= 2020 && year <= currentYear + 1 ? year : currentYear;
}

export function normalizeAnalyticsMonth(value?: string | string[] | null) {
  const currentMonth = new Date().getMonth() + 1;
  const raw = Array.isArray(value) ? value[0] : value;
  const month = Number(raw);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : currentMonth;
}

export function getAnalyticsYears() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => currentYear - index);
}

export function formatAnalyticsValue(value: number, unit: AnalyticsUnit) {
  if (unit === "currency") {
    return new Intl.NumberFormat("vi-VN").format(Math.round(value)) + " đ";
  }

  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

function getMonthRange(year: number, month: number) {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 1),
  };
}

function getYearRange(year: number) {
  return {
    start: new Date(year, 0, 1),
    end: new Date(year + 1, 0, 1),
  };
}

function getPreviousRange(period: AnalyticsPeriod, year: number, month: number) {
  if (period === "year") return getYearRange(year - 1);

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return getMonthRange(previousYear, previousMonth);
}

function getRange(period: AnalyticsPeriod, year: number, month: number) {
  return period === "year" ? getYearRange(year) : getMonthRange(year, month);
}

function createPoints(period: AnalyticsPeriod, year: number, month: number): AnalyticsPoint[] {
  if (period === "year") {
    return Array.from({ length: 12 }, (_, index) => ({
      key: `${year}-${String(index + 1).padStart(2, "0")}`,
      label: `T${index + 1}`,
      value: 0,
    }));
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => ({
    key: `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
    label: String(index + 1).padStart(2, "0"),
    value: 0,
  }));
}

function getPointIndex(date: Date, period: AnalyticsPeriod) {
  return period === "year" ? date.getMonth() : date.getDate() - 1;
}

async function fillMetricPoints({
  metric,
  period,
  start,
  end,
  points,
}: {
  metric: AnalyticsMetric;
  period: AnalyticsPeriod;
  start: Date;
  end: Date;
  points: AnalyticsPoint[];
}) {
  if (metric === "revenue" || metric === "orders") {
    const orders = await prisma.order.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: start, lt: end },
        ...(metric === "revenue" ? { paymentStatus: "paid" as const } : {}),
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    for (const order of orders) {
      const index = getPointIndex(order.createdAt, period);
      if (points[index]) {
        points[index].value += metric === "revenue" ? Number(order.totalAmount) : 1;
      }
    }

    return;
  }

  if (metric === "customers") {
    const customers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        role: "customer",
        createdAt: { gte: start, lt: end },
      },
      select: { createdAt: true },
    });

    for (const customer of customers) {
      const index = getPointIndex(customer.createdAt, period);
      if (points[index]) points[index].value += 1;
    }

    return;
  }

  if (metric === "products") {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: start, lt: end },
      },
      select: { createdAt: true },
    });

    for (const product of products) {
      const index = getPointIndex(product.createdAt, period);
      if (points[index]) points[index].value += 1;
    }

    return;
  }

  const services = await prisma.warrantyAppointment.findMany({
    where: {
      createdAt: { gte: start, lt: end },
    },
    select: { createdAt: true },
  });

  for (const service of services) {
    const index = getPointIndex(service.createdAt, period);
    if (points[index]) points[index].value += 1;
  }
}

async function getMetricTotal(metric: AnalyticsMetric, start: Date, end: Date) {
  if (metric === "revenue") {
    const aggregate = await prisma.order.aggregate({
      where: {
        deletedAt: null,
        paymentStatus: "paid",
        createdAt: { gte: start, lt: end },
      },
      _sum: { totalAmount: true },
    });

    return Number(aggregate._sum.totalAmount ?? 0);
  }

  if (metric === "orders") {
    return prisma.order.count({
      where: {
        deletedAt: null,
        createdAt: { gte: start, lt: end },
      },
    });
  }

  if (metric === "customers") {
    return prisma.user.count({
      where: {
        deletedAt: null,
        role: "customer",
        createdAt: { gte: start, lt: end },
      },
    });
  }

  if (metric === "products") {
    return prisma.product.count({
      where: {
        deletedAt: null,
        createdAt: { gte: start, lt: end },
      },
    });
  }

  return prisma.warrantyAppointment.count({
    where: {
      createdAt: { gte: start, lt: end },
    },
  });
}

export async function getAdminAnalyticsData({
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
  const { start, end } = getRange(period, year, month);
  const previous = getPreviousRange(period, year, month);
  const points = createPoints(period, year, month);

  await fillMetricPoints({ metric, period, start, end, points });
  const [total, previousTotal] = await Promise.all([
    getMetricTotal(metric, start, end),
    getMetricTotal(metric, previous.start, previous.end),
  ]);

  const peak = points.reduce(
    (best, point) => (point.value > best.value ? point : best),
    points[0] ?? { key: "", label: "", value: 0 },
  );
  const activePoints = points.filter((point) => point.value > 0);
  const average = points.length > 0 ? total / points.length : 0;
  const changePercent =
    previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null;

  return {
    points,
    total,
    previousTotal,
    average,
    peak,
    activePoints,
    changePercent,
    rangeLabel:
      period === "year"
        ? `Năm ${year}`
        : `Tháng ${String(month).padStart(2, "0")}/${year}`,
  };
}

function recentMonthStarts(length: number) {
  const now = new Date();
  const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return Array.from({ length }, (_, index) => {
    const date = new Date(firstThisMonth);
    date.setMonth(firstThisMonth.getMonth() - (length - 1 - index));
    return date;
  });
}

export async function getDashboardMetricTrends(length = 6) {
  const starts = recentMonthStarts(length);
  const start = starts[0];
  const end = new Date(starts[starts.length - 1]);
  end.setMonth(end.getMonth() + 1);

  const createSeries = () =>
    starts.map((date) => ({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: `T${date.getMonth() + 1}`,
      value: 0,
    }));

  const trends: Record<AnalyticsMetric, AnalyticsPoint[]> = {
    revenue: createSeries(),
    orders: createSeries(),
    products: createSeries(),
    customers: createSeries(),
    services: createSeries(),
  };

  const [orders, customers, products, services] = await Promise.all([
    prisma.order.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: start, lt: end },
      },
      select: {
        createdAt: true,
        paymentStatus: true,
        totalAmount: true,
      },
    }),
    prisma.user.findMany({
      where: {
        deletedAt: null,
        role: "customer",
        createdAt: { gte: start, lt: end },
      },
      select: { createdAt: true },
    }),
    prisma.product.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: start, lt: end },
      },
      select: { createdAt: true },
    }),
    prisma.warrantyAppointment.findMany({
      where: {
        createdAt: { gte: start, lt: end },
      },
      select: { createdAt: true },
    }),
  ]);

  const monthOffset = (date: Date) =>
    (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();

  for (const order of orders) {
    const index = monthOffset(order.createdAt);
    if (!trends.orders[index]) continue;
    trends.orders[index].value += 1;
    if (order.paymentStatus === "paid") {
      trends.revenue[index].value += Number(order.totalAmount);
    }
  }

  for (const customer of customers) {
    const index = monthOffset(customer.createdAt);
    if (trends.customers[index]) trends.customers[index].value += 1;
  }

  for (const product of products) {
    const index = monthOffset(product.createdAt);
    if (trends.products[index]) trends.products[index].value += 1;
  }

  for (const service of services) {
    const index = monthOffset(service.createdAt);
    if (trends.services[index]) trends.services[index].value += 1;
  }

  return trends;
}
