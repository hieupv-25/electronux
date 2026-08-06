import Image from "next/image";

type CategoryHeroProps = {
  title: string;
  description: string;
  image: string;
  imageMobile?: string;
};

export default function CategoryHero({ title, description, image, imageMobile }: CategoryHeroProps) {
  return (
    <section className="category-hero">
      <div className="category-hero__image">
        <picture>
          {imageMobile ? (
            <source media="(max-width: 767px)" srcSet={imageMobile} />
          ) : null}
          <Image
            src={image}
            alt={title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </picture>
        <div className="category-hero__overlay" />
      </div>
      <div className="category-hero__content">
        <h1 className="category-hero__title">{title}</h1>
        <p className="category-hero__desc">{description}</p>
      </div>
    </section>
  );
}
