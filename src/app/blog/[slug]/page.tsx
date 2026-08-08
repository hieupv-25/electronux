import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  blogPosts,
  getBlogCategory,
  getBlogPost,
  getRelatedBlogPosts,
} from "@/data/blog";
import { footerSections, navItems } from "@/data/siteData";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Không tìm thấy bài viết | Electrolux Blog",
    };
  }

  return {
    title: `${post.title} | Electrolux Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const category = getBlogCategory(post.category);
  const relatedPosts = getRelatedBlogPosts(post);

  return (
    <>
      <Header navItems={navItems} />

      <main className="blog-detail">
        <section className="blog-detail-hero">
          <div className="blog-detail-hero__content">
            <Link href="/blog" className="blog-back-link">
              Quay lại Blog
            </Link>
            <div className="blog-post-meta">
              <span>{category?.name}</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.readTime}</span>
            </div>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
            <div className="blog-detail-author">
              <span>Biên tập bởi</span>
              <strong>{post.author}</strong>
            </div>
          </div>
          <div className="blog-detail-hero__media">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
          </div>
        </section>

        <section className="blog-detail-layout">
          <aside className="blog-toc">
            <span>Nội dung chính</span>
            {post.sections.map((section, index) => (
              <a key={section.heading} href={`#muc-${index + 1}`}>
                {section.heading}
              </a>
            ))}
          </aside>

          <article className="blog-article">
            {post.sections.map((section, index) => (
              <section key={section.heading} id={`muc-${index + 1}`}>
                <h2>{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}

            <div className="blog-tag-row blog-tag-row--article">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        </section>

        {relatedPosts.length > 0 && (
          <section className="blog-section blog-section--related">
            <div className="blog-section__header">
              <span className="blog-eyebrow">Đọc thêm</span>
              <h2>Bài viết liên quan</h2>
            </div>

            <div className="blog-list blog-list--related">
              {relatedPosts.map((related) => (
                <article key={related.slug} className="blog-card">
                  <Link href={`/blog/${related.slug}`} className="blog-card__media">
                    <Image
                      src={related.coverImage}
                      alt={related.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="blog-card__body">
                    <div className="blog-post-meta">
                      <span>{formatDate(related.publishedAt)}</span>
                      <span>{related.readTime}</span>
                    </div>
                    <h3>
                      <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                    </h3>
                    <p>{related.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}
