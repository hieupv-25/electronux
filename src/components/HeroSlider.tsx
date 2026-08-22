"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

type HeroSlide = {
  img: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
};

type HeroSliderProps = {
  slides: HeroSlide[];
  /** Autoplay interval in ms (default 5000) */
  intervalMs?: number;
};

/* ── Hero Slider Component ── */
export default function HeroSlider({ slides, intervalMs = 5000 }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const len = slides.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % len), [len]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + len) % len), [len]);

  useEffect(() => {
    const t = setInterval(next, intervalMs);
    return () => clearInterval(t);
  }, [next, intervalMs]);

  return (
    <section className="hero-slider" id="hero-slider">
      <div
        className="hero-slider__track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div className="hero-slider__slide" key={i}>
            <Link href={s.href} className="hero-slider__slide-link" aria-label={s.title} />
            <Image
              src={s.img}
              alt={s.title}
              fill
              sizes="100vw"
              quality={100}
              className="hero-slider__image"
              priority={i === 0}
              unoptimized
            />
            <div className="hero-slider__overlay" />
            <div className="hero-slider__content">
              <h1 style={{ whiteSpace: "pre-line" }}>{s.title}</h1>
              <p>{s.desc}</p>
              <div>
                <Link href={s.href} className="cta-btn cta-btn--white">
                  {s.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="hero-slider__arrow hero-slider__arrow--prev"
        onClick={prev}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        className="hero-slider__arrow hero-slider__arrow--next"
        onClick={next}
        aria-label="Next"
      >
        ›
      </button>
      <div className="hero-slider__dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-slider__dot ${i === current ? "hero-slider__dot--active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
