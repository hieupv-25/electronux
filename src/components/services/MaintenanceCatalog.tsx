"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";
import { maintenanceGroups } from "@/data/maintenanceCatalog";
import type { MaintenanceServiceItem } from "@/data/maintenanceServices";

const benefits = [
  "Kỹ thuật viên của chúng tôi đến tận nơi để chăm sóc thiết bị của bạn.",
  "Chăm sóc thiết bị theo đúng quy chuẩn cần thiết, và tư vấn các phương pháp để bạn có thể tự chăm sóc sản phẩm tại nhà.",
  "Làm sạch và bảo dưỡng thiết bị cho hiệu suất vận hành bền lâu.",
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
}

export default function MaintenanceCatalog({ services }: { services: MaintenanceServiceItem[] }) {
  const { addToCart, adding } = useCart();
  const [activeGroup, setActiveGroup] = useState("all");
  const [activeProductType, setActiveProductType] = useState("all");
  const [sort, setSort] = useState("default");

  const availableTypes = useMemo(
    () =>
      Array.from(
        new Set(
          services
            .filter((item) => activeGroup === "all" || item.group === activeGroup)
            .map((item) => item.productType)
        )
      ),
    [activeGroup, services]
  );

  const visible = useMemo(() => {
    const items = services.filter(
      (item) =>
        (activeGroup === "all" || item.group === activeGroup) &&
        (activeProductType === "all" || item.productType === activeProductType)
    );
    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    return items;
  }, [activeGroup, activeProductType, services, sort]);

  function chooseGroup(value: string) {
    setActiveGroup(value);
    setActiveProductType("all");
  }

  return (
    <section className="catalog">
      <div className="tabs">
        <button className={activeGroup === "all" ? "active" : ""} onClick={() => chooseGroup("all")}>
          Tất cả ({services.length})
        </button>
        {maintenanceGroups.map((group) => {
          const count = services.filter((item) => item.group === group.value).length;
          return (
            <button
              key={group.value}
              className={activeGroup === group.value ? "active" : ""}
              onClick={() => chooseGroup(group.value)}
            >
              {group.label} ({count})
            </button>
          );
        })}
      </div>
      <div className="layout">
        <aside>
          <h2>Bộ lọc</h2>
          <h3>Nhóm bảo dưỡng</h3>
          <label>
            <input
              type="radio"
              name="group-filter"
              checked={activeGroup === "all"}
              onChange={() => chooseGroup("all")}
            />
            <span>Tất cả dịch vụ</span>
          </label>
          {maintenanceGroups.map((group) => (
            <label key={group.value}>
              <input
                type="radio"
                name="group-filter"
                checked={activeGroup === group.value}
                onChange={() => chooseGroup(group.value)}
              />
              <span>{group.label}</span>
            </label>
          ))}
          <h3>Loại sản phẩm</h3>
          <label>
            <input
              type="radio"
              name="product-filter"
              checked={activeProductType === "all"}
              onChange={() => setActiveProductType("all")}
            />
            <span>Tất cả sản phẩm</span>
          </label>
          {availableTypes.map((type) => (
            <label key={type}>
              <input
                type="radio"
                name="product-filter"
                checked={activeProductType === type}
                onChange={() => setActiveProductType(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </aside>
        <div className="listing">
          <div className="toolbar">
            <strong>{visible.length} dịch vụ</strong>
            <label>
              Sắp xếp theo:{" "}
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="default">Tự động</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </label>
          </div>
          <div className="grid">
            {visible.map((service) => {
              const isAdding = adding === service.variantId;
              return (
                <article key={service.variantId}>
                  <Link
                    className="card-link"
                    href={`/services/maintenance/${service.slug}`}
                    aria-label={`Xem chi tiết ${service.name}`}
                  >
                    <div className="image">
                      <Image src={service.imageUrl} alt={service.name} width={240} height={210} />
                    </div>
                    <span className="sku">{service.sku}</span>
                    <h2>{service.name}</h2>
                    <ul className="benefits">
                      {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
                    </ul>
                    <strong className="price">{formatPrice(service.price)}</strong>
                  </Link>
                  <button
                    className="add"
                    disabled={isAdding}
                    onClick={() => void addToCart(service.variantId)}
                    aria-label={`Thêm ${service.name} vào giỏ hàng`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="9" cy="20" r="1" />
                      <circle cx="18" cy="20" r="1" />
                      <path d="M2 3h3l2.2 11h10.8l2-7H6" />
                      <path d="M12 8v5M9.5 10.5h5" />
                    </svg>
                    {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
                  </button>
                </article>
              );
            })}
          </div>
          {!visible.length && <p className="empty">Không có dịch vụ phù hợp với bộ lọc.</p>}
        </div>
      </div>
      <style jsx>{`
        .catalog {
          background: #fff;
        }
        .tabs {
          max-width: 1180px;
          margin: auto;
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-bottom: 1px solid #dce2e8;
          overflow: auto;
        }
        .tabs button {
          padding: 12px 22px;
          border: 1px solid #011e41;
          background: #fff;
          color: #011e41;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          border-radius: 4px;
        }
        .tabs .active {
          background: #011e41;
          color: #fff;
        }
        .layout {
          max-width: 1180px;
          margin: auto;
          display: grid;
          grid-template-columns: 230px 1fr;
          gap: 35px;
          padding: 38px 24px 70px;
        }
        aside h2 {
          text-transform: uppercase;
          font-size: 1.15rem;
          color: #011e41;
        }
        aside h3 {
          text-transform: uppercase;
          font-size: 0.78rem;
          line-height: 1.4;
          color: #011e41;
          margin-top: 28px;
        }
        aside label {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 7px 0;
          color: #263c52;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 30px;
          color: #011e41;
        }
        .toolbar select {
          border: 0;
          color: #011e41;
          font: inherit;
          font-weight: 700;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          column-gap: 32px;
          row-gap: 66px;
          align-items: stretch;
        }
        article {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-width: 0;
          background: #fff;
        }
        .card-link {
          display: flex;
          flex: 1;
          flex-direction: column;
          color: inherit;
          text-decoration: none;
        }
        .card-link:hover {
          opacity: 1;
        }
        .image {
          width: calc(100% - 64px);
          max-width: 200px;
          aspect-ratio: 1;
          background: #f4f6f8;
          overflow: hidden;
          margin: 0 auto 16px;
        }
        .image :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sku {
          font-size: 0.78rem;
          line-height: 1.5;
          color: #011e41;
          font-weight: 700;
        }
        article h2 {
          font-size: 1.15rem;
          line-height: 1.45;
          color: #011e41;
          min-height: 56px;
          margin: 8px 0;
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .benefits {
          flex: 1;
          margin: 0;
          padding-left: 16px;
          list-style: circle outside;
          color: #334b64;
          line-height: 1.6;
          font-size: 0.9rem;
        }
        .benefits li {
          display: list-item;
          padding-left: 2px;
          margin-bottom: 2px;
        }
        .benefits li::marker {
          color: #011e41;
          font-size: 0.75em;
        }
        .price {
          display: block;
          color: #011e41;
          font-size: 1.35rem;
          margin: 14px 0 12px;
          text-align: left;
        }
        .add {
          width: 100%;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 2px;
          background: #011e41;
          color: white;
          padding: 13px;
          font-weight: 750;
          text-transform: uppercase;
          cursor: pointer;
        }
        .add:hover {
          background: #011e41;
        }
        .add:disabled {
          opacity: 0.65;
          cursor: wait;
        }
        .empty {
          text-align: center;
          color: #6a7785;
          padding: 60px;
        }
        @media (max-width: 950px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 700px) {
          .layout {
            grid-template-columns: 1fr;
          }
          .grid {
            grid-template-columns: 1fr;
          }
          .toolbar {
            align-items: flex-start;
            flex-direction: column;
          }
          aside {
            border-bottom: 1px solid #dce2e8;
            padding-bottom: 10px;
          }
        }
      `}</style>
    </section>
  );
}
