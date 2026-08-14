"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";
import type { MaintenanceServiceItem } from "@/data/maintenanceServices";

const benefits = [
  "Kỹ thuật viên đến tận nơi để chăm sóc thiết bị của bạn.",
  "Chăm sóc thiết bị theo đúng quy chuẩn và hướng dẫn cách sử dụng phù hợp.",
  "Làm sạch và bảo dưỡng thiết bị để duy trì hiệu suất vận hành bền lâu.",
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
}

export default function MaintenanceCatalog({ services }: { services: MaintenanceServiceItem[] }) {
  const { addToCart, adding } = useCart();
  const [enabled, setEnabled] = useState(true);
  const [sort, setSort] = useState("default");
  const visible = useMemo(() => {
    if (!enabled) return [];
    const items = [...services];
    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    return items;
  }, [enabled, services, sort]);

  return <section className="catalog">
    <div className="tabs"><button className="active">Tất cả ({services.length})</button><button>Chăm sóc trang phục ({services.length})</button></div>
    <div className="layout">
      <aside><h2>Bộ lọc</h2><h3>Chọn loại thiết bị để tìm dịch vụ phù hợp</h3><label><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /><span>Chăm sóc trang phục ({services.length})</span></label></aside>
      <div className="listing">
        <div className="toolbar"><strong>{visible.length} dịch vụ</strong><label>Sắp xếp theo: <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="default">Tự động</option><option value="price-asc">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option></select></label></div>
        <div className="grid">{visible.map((service) => {
          const isAdding = adding === service.variantId;
          return <article key={service.variantId}>
            <div className="image"><Image src={service.imageUrl} alt={service.name} width={240} height={210} /></div>
            <span className="sku">{service.sku}</span>
            <h2>{service.name}</h2>
            <ul>{benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
            <strong className="price">{formatPrice(service.price)}</strong>
            <button className="add" disabled={isAdding} onClick={() => void addToCart(service.variantId)} aria-label={`Thêm ${service.name} vào giỏ hàng`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h3l2.2 11h10.8l2-7H6"/><path d="M12 8v5M9.5 10.5h5"/></svg>
              {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>
          </article>;
        })}</div>
        {!visible.length && <p className="empty">Không có dịch vụ phù hợp với bộ lọc.</p>}
      </div>
    </div>
    <style jsx>{`
      .catalog{background:#fff}.tabs{max-width:1180px;margin:auto;display:flex;gap:12px;padding:20px 24px;border-bottom:1px solid #dce2e8}.tabs button{padding:12px 28px;border:1px solid #011e41;background:#fff;color:#011e41;font-weight:700}.tabs .active{background:#011e41;color:#fff}.layout{max-width:1180px;margin:auto;display:grid;grid-template-columns:230px 1fr;gap:35px;padding:38px 24px 70px}aside h2{text-transform:uppercase;font-size:1.15rem;color:#011e41}aside h3{text-transform:uppercase;font-size:.78rem;line-height:1.4;color:#011e41;margin-top:28px}aside label{display:flex;gap:10px;align-items:flex-start;border-bottom:1px solid #dce2e8;padding:4px 0 24px;color:#263c52}.toolbar{display:flex;justify-content:space-between;gap:20px;margin-bottom:30px;color:#011e41}.toolbar select{border:0;color:#011e41;font:inherit;font-weight:700}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px}article{display:flex;flex-direction:column;min-width:0}.image{height:210px;background:#f4f6f8;display:grid;place-items:center;margin-bottom:16px}.image :global(img){width:75%;height:75%;object-fit:contain}.sku{font-size:.8rem;color:#334b64;font-weight:700}article h2{font-size:1.15rem;line-height:1.45;color:#011e41;min-height:53px;margin:8px 0}ul{padding-left:18px;color:#334b64;line-height:1.55;font-size:.88rem;flex:1}li{margin-bottom:7px}.price{display:block;color:#011e41;font-size:1.35rem;margin:12px 0}.add{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;border:0;background:#011e41;color:white;padding:13px;font-weight:750;text-transform:uppercase;cursor:pointer}.add:disabled{opacity:.65;cursor:wait}.empty{text-align:center;color:#6a7785;padding:60px}.tabs button,.add{border-radius:2px}@media(max-width:950px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.layout{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.toolbar{align-items:flex-start;flex-direction:column}.tabs{overflow:auto}.tabs button{white-space:nowrap}aside{border-bottom:1px solid #dce2e8;padding-bottom:10px}}
    `}</style>
  </section>;
}
