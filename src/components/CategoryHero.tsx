import Image from "next/image";

type CategoryHeroProps = {
  title: string;
  description: string;
  image: string;
};

export default function CategoryHero({ title, description, image }: CategoryHeroProps) {
  return (
    <section className="category-hero">
      <div className="category-hero__image">
        <Image
          src={image}
          alt={title}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="category-hero__overlay" />
      </div>
      <div className="category-hero__content">
        <h1 className="category-hero__title">{title}</h1>
        <p className="category-hero__desc">{description}</p>
      </div>
    </section>
  );
}
