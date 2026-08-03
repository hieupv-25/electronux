import Image from "next/image";
import { promoBento } from "@/data/siteData";

export default function PromoBentoGrid() {
    const { row1, row2, row3 } = promoBento;

    return (
        <section style={{ width: "100%" }}>
            {/* ── Hàng 1: ảnh + thẻ chữ nền tối, dính liền nhau, không gap ── */}
            <div className="promo-bento__row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                    <Image
                        src={row1.image.img}
                        alt={row1.image.alt}
                        width={900}
                        height={680}
                        style={{ width: "100%", height: 340, objectFit: "cover" }}
                    />
                </div>
                <div className="promo-bento__dark-card">
                    <h3>{row1.dark.title}</h3>
                    <p>{row1.dark.desc}</p>
                    <a href={row1.dark.href} className="cta-btn cta-btn--white" style={{ width: "fit-content" }}>
                        {row1.dark.cta}
                    </a>
                </div>
            </div>

            {/* ── Hàng 2: 2 ảnh có chữ, tăng chiều cao để không mất chữ ── */}
            <div className="promo-bento__row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                {row2.map((tile, i) => (
                    <a key={i} href={tile.href} className="promo-banner promo-banner--flush">
                        <Image
                            src={tile.img}
                            alt={tile.title}
                            width={900}
                            height={560}
                            style={{ width: "100%", height: 280, objectFit: "cover" }}
                        />
                        <div className="promo-banner__overlay" />
                        <div className="promo-banner__content">
                            <h3>{tile.title}</h3>
                            <p>{tile.desc}</p>
                            <span className="cta-btn cta-btn--white">{tile.cta}</span>
                        </div>
                    </a>
                ))}
            </div>

            {/* ── Hàng 3: 1 ảnh full-width ── */}
            <a href={row3.href} className="promo-banner promo-banner--flush" style={{ display: "block" }}>
                <Image
                    src={row3.img}
                    alt={row3.title}
                    width={1920}
                    height={640}
                    style={{ width: "100%", height: 320, objectFit: "cover" }}
                />
                <div className="promo-banner__overlay" />
                <div className="promo-banner__content">
                    <h3>{row3.title}</h3>
                    <p>{row3.desc}</p>
                    <span className="cta-btn cta-btn--white">{row3.cta}</span>
                </div>
            </a>
        </section>
    );
}
