"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { CategoryPageData } from "@/data/categories";

type SortOption = "featured" | "price-asc" | "price-desc" | "name";

type CategoryListingProps = {
  data: CategoryPageData;
};

export default function CategoryListing({ data }: CategoryListingProps) {
  const [activeFilter, setActiveFilter] = useState(data.defaultFilter ?? "all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    type: true,
    features: true,
    colors: true,
    capacities: true,
    widths: false,
    energies: false,
    installations: false,
    zones: false,
    deals: false,
    prices: false,
  });

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.quickFilters.forEach((filter) => {
      counts[filter.id] = 0;
    });
    counts.all = data.products.length;

    data.products.forEach((product) => {
      product.filters.forEach((filterId) => {
        if (counts[filterId] !== undefined) {
          counts[filterId] += 1;
        }
      });
    });

    return counts;
  }, [data.quickFilters, data.products]);

  const filteredProducts = useMemo(() => {
    let result = [...data.products];

    if (activeFilter !== "all") {
      result = result.filter((p) => p.filters.includes(activeFilter));
    }

    if (selectedFeatures.length > 0) {
      result = result.filter((p) =>
        selectedFeatures.every((f) => {
          if (f === "hygienic") return p.features.some((feat) => feat.includes("HygienicCare"));
          if (f === "quick45") return p.features.some((feat) => feat.includes("45 phút"));
          return true;
        })
      );
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) => p.color && selectedColors.includes(p.color));
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
      default:
        break;
    }

    return result;
  }, [data.products, activeFilter, selectedFeatures, selectedColors, sortBy]);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleColor = (id: string) => {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setActiveFilter("all");
    setSelectedFeatures([]);
    setSelectedColors([]);
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="plp">
      {/* Quick filter pills */}
      <div className="plp-quick-filters">
        <div className="plp-quick-filters__inner">
          {data.quickFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`plp-quick-filters__btn ${activeFilter === filter.id ? "plp-quick-filters__btn--active" : ""}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              <strong>
                {filter.label} ({filterCounts[filter.id] ?? 0})
              </strong>
            </button>
          ))}
        </div>
      </div>

      <div className="plp-layout">
        {/* Mobile filter toggle */}
        <button
          type="button"
          className="plp-filter-toggle"
          onClick={() => setSidebarOpen(true)}
        >
          Bộ lọc
        </button>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div className="plp-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`plp-sidebar ${sidebarOpen ? "plp-sidebar--open" : ""}`}>
          <div className="plp-sidebar__header">
            <span className="plp-sidebar__title">Bộ lọc</span>
            <button
              type="button"
              className="plp-sidebar__clear"
              onClick={clearAllFilters}
            >
              Xóa tất cả
            </button>
            <button
              type="button"
              className="plp-sidebar__close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Đóng bộ lọc"
            >
              ×
            </button>
          </div>

          <div className="plp-sidebar__body">
            {/* TYPE */}
            <div className="plp-filter-group">
              <button
                type="button"
                className="plp-filter-group__title"
                onClick={() => toggleSection("type")}
              >
                TYPE
                <span>{expandedSections.type ? "−" : "+"}</span>
              </button>
              {expandedSections.type && (
                <ul className="plp-filter-group__list">
                  {data.sidebarFilters.type.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`plp-filter-group__link ${activeFilter === item.id ? "plp-filter-group__link--active" : ""}`}
                        onClick={() => setActiveFilter(item.id)}
                      >
                        {item.label} ({filterCounts[item.id] ?? 0})
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Features */}
            <div className="plp-filter-group">
              <button
                type="button"
                className="plp-filter-group__title"
                onClick={() => toggleSection("features")}
              >
                Tính năng
                <span>{expandedSections.features ? "−" : "+"}</span>
              </button>
              {expandedSections.features && (
                <ul className="plp-filter-group__list plp-filter-group__list--checkbox">
                  {data.sidebarFilters.features.map((item) => (
                    <li key={item.id}>
                      <label className="plp-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(item.id)}
                          onChange={() => toggleFeature(item.id)}
                        />
                        <span className="plp-checkbox__mark" />
                        <span>{item.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Colors */}
            <div className="plp-filter-group">
              <button
                type="button"
                className="plp-filter-group__title"
                onClick={() => toggleSection("colors")}
              >
                Màu sắc
                <span>{expandedSections.colors ? "−" : "+"}</span>
              </button>
              {expandedSections.colors && (
                <ul className="plp-filter-group__list plp-filter-group__list--checkbox">
                  {data.sidebarFilters.colors.map((item) => (
                    <li key={item.id}>
                      <label className="plp-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(item.id)}
                          onChange={() => toggleColor(item.id)}
                        />
                        <span className="plp-checkbox__mark" />
                        <span>
                          {item.label} ({item.count})
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Capacities */}
            <div className="plp-filter-group">
              <button
                type="button"
                className="plp-filter-group__title"
                onClick={() => toggleSection("capacities")}
              >
                Số vùng nấu
                <span>{expandedSections.capacities ? "−" : "+"}</span>
              </button>
              {expandedSections.capacities && (
                <ul className="plp-filter-group__list plp-filter-group__list--checkbox">
                  {data.sidebarFilters.capacities.map((item) => (
                    <li key={item.id}>
                      <label className="plp-checkbox plp-checkbox--disabled">
                        <input type="checkbox" disabled />
                        <span className="plp-checkbox__mark" />
                        <span>
                          {item.label} ({item.count})
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="plp-main">
          <div className="plp-toolbar">
            <p className="plp-toolbar__count">
              <strong>{filteredProducts.length}</strong> sản phẩm
            </p>
            <div className="plp-toolbar__sort">
              <label htmlFor="sort-select">Sắp xếp theo:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="plp-toolbar__select"
              >
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="plp-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} categorySlug={data.slug} />
              ))}
            </div>
          ) : (
            <div className="plp-empty">
              <p>Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
              <button type="button" className="cta-btn" onClick={clearAllFilters}>
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
