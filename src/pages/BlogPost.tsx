import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlog, deleteBlog, isAdmin, type BlogPost } from "../data/store";
import { sanitizeRichText, toRichTextHtml } from "../utils/richText";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | undefined>();
  const admin = isAdmin();

  useEffect(() => {
    if (!slug) return;
    const foundPost = getBlog(slug);
    setPost(foundPost?.status === "draft" && !admin ? undefined : foundPost);
    if (foundPost) {
      document.title = `${foundPost.title} · Poojan Gohil`;
      setMetaContent("description", foundPost.excerpt);
      setMetaContent("keywords", (foundPost.tags || []).join(", "));
    }
    window.scrollTo(0, 0);

    return () => {
      document.title = "Poojan Gohil";
      setMetaContent("description", "");
      setMetaContent("keywords", "");
    };
  }, [slug, admin]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm tracking-widest uppercase">
        Article not found.
      </div>
    );
  }

  function handleDelete() {
    if (!post) return;
    if (window.confirm("Delete this article?")) {
      deleteBlog(post.id);
      navigate("/blog");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative w-full h-[50vh] overflow-hidden bg-background">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,9,8,0.85) 10%, transparent 60%)" }} />
        </div>
      )}

      {/* Article */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="mt-16 pb-8 border-t border-secondary-foreground">
          <Link to="/blog" className="text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-primary transition-colors">
            ← All Blog Posts
          </Link>
        </div>

        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-6">
          {formatDate(post.date)} &nbsp;·&nbsp; {post.readTime} min read
        </p>
        <h1 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-foreground leading-tight mb-10">
          {post.title}
        </h1>

        <p className="text-accent text-base font-light italic leading-relaxed mb-10 border-l-2 border-primary pl-6">
          {post.excerpt}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border border-secondary-foreground px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="article-rich-text"
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(toRichTextHtml(post.content)),
          }}
        />

        {admin && (
          <div className="mt-16 flex gap-4 border-t border-secondary-foreground pt-8">
            <Link
              to={`/admin/blog?edit=${post.id}`}
              className="text-xs tracking-[0.18em] uppercase text-primary border border-primary px-5 py-2 hover:bg-primary hover:text-background transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="text-xs tracking-[0.18em] uppercase text-muted-foreground border border-secondary-foreground px-5 py-2 hover:border-primary hover:text-primary transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-secondary-foreground">
          <Link to="/blog" className="text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-primary transition-colors">
            ← All Blog Posts
          </Link>
        </div>
      </div>
      <style>{`
        .article-rich-text {
          color: #c4b89e;
          font-size: 1rem;
          font-weight: 300;
          line-height: 1.85;
          letter-spacing: 0.01em;
        }
        .article-rich-text p { margin: 0 0 1.5rem; }
        .article-rich-text h2 {
          margin: 2.75rem 0 1rem;
          color: #e8ddd0;
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          font-weight: 400;
          line-height: 1.2;
        }
        .article-rich-text h3 {
          margin: 2.25rem 0 0.85rem;
          color: #e8ddd0;
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem;
          font-weight: 400;
          line-height: 1.3;
        }
        .article-rich-text strong,
        .article-rich-text b { color: #e8ddd0; font-weight: 600; }
        .article-rich-text em,
        .article-rich-text i { font-style: italic; }
        .article-rich-text u { text-decoration: underline; text-underline-offset: 0.15em; }
        .article-rich-text ul,
        .article-rich-text ol { margin: 1.5rem 0; padding-left: 1.5rem; }
        .article-rich-text ul { list-style: disc; }
        .article-rich-text ol { list-style: decimal; }
        .article-rich-text li { margin: 0.5rem 0; padding-left: 0.35rem; }
        .article-rich-text a {
          color: #c9a87c;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 0.2em;
        }
        .article-rich-text a:hover { color: #e8ddd0; }
        .article-rich-text figure { margin: 2.5rem 0; }
        .article-rich-text figure img { width: 100%; height: auto; object-fit: contain; }
        .article-rich-text figcaption {
          margin-top: 0.75rem;
          color: #7a7062;
          font-size: 0.75rem;
          font-weight: 300;
          line-height: 1.6;
          letter-spacing: 0.025em;
        }
      `}</style>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

function setMetaContent(name: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}
