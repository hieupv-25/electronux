import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogCategories, blogPosts, getBlogCategory } from "@/data/blog";
import { footerSections, navItems } from "@/data/siteData";

export const metadata: Metadata = {
  title: "Blog Electrolux | Mẹo chăm sóc nhà cửa và thiết bị gia dụng",
  description:
    "Khám phá mẹo giặt sấy, bảo quản thực phẩm, chọn mua và sử dụng thiết bị gia dụng Electrolux hiệu quả hơn.",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const latestPosts = blogPosts.filter((post) => !post.featured);
  const heroPost = featuredPosts[0] ?? blogPosts[0];

  return (
    <>
      <Header navItems={navItems} />

      <main className="blog-page">
        <section className="blog-hero">
          <Image
            src={heroPost.coverImage}
            alt={heroPost.title}
            fill
            priority
            className="blog-hero__image"
            sizes="100vw"
          />
          <div className="blog-hero__overlay" />
          <div className="blog-hero__content">
            <span className="blog-eyebrow">Blog Electrolux</span>
            <h1>Gợi ý chăm sóc tổ ấm thông minh hơn mỗi ngày</h1>
            <p>
              Từ giặt sấy, bảo quản thực phẩm đến lựa chọn thiết bị, các bài viết
              giúp bạn dùng đồ gia dụng hiệu quả và nhẹ nhàng hơn.
            </p>
            <Link href={`/blog/${heroPost.slug}`} className="blog-hero__cta">
              Đọc bài nổi bật
            </Link>
          </div>
        </section>

        <section className="blog-section blog-section--intro">
          <div className="blog-section__header">
            <span className="blog-eyebrow">Chủ đề</span>
            <h2>Khám phá theo nhu cầu của bạn</h2>
          </div>

          <div className="blog-category-grid">
            {blogCategories.map((category) => (
              <a key={category.slug} href="#blog-posts" className="blog-category-card">
                <strong>{category.name}</strong>
                <span>{category.description}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="blog-section">
          <div className="blog-section__header">
            <span className="blog-eyebrow">Bài viết nổi bật</span>
            <h2>Được đọc nhiều gần đây</h2>
          </div>

          <div className="blog-featured-grid">
            {featuredPosts.map((post) => {
              const category = getBlogCategory(post.category);

              return (
                <article key={post.slug} className="blog-featured-card">
                  <Link href={`/blog/${post.slug}`} className="blog-featured-card__media">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Link>
                  <div className="blog-featured-card__body">
                    <div className="blog-post-meta">
                      <span>{category?.name}</span>
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`} className="blog-text-link">
                      Đọc tiếp
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="blog-section">
          <div className="blog-section__header">
            <span className="blog-eyebrow">Tất cả bài viết</span>
            <h2>Mẹo hữu ích cho từng khu vực trong nhà</h2>
          </div>

          <div id="blog-posts" className="blog-list">
            {latestPosts.map((post) => {
              const category = getBlogCategory(post.category);

              return (
                <article key={post.slug} className="blog-card">
                  <Link href={`/blog/${post.slug}`} className="blog-card__media">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="blog-card__body">
                    <div className="blog-post-meta">
                      <span>{category?.name}</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <h3>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt}</p>
                    <div className="blog-tag-row">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}
