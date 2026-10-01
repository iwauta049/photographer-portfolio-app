import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlog, deleteBlog, isAdmin, type BlogPost } from "../data/store";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | undefined>();
  const admin = isAdmin();

  useEffect(() => {
    if (!slug) return;
    setPost(getBlog(slug));
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#5a5248] text-sm tracking-widest uppercase">
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
    <div className="min-h-screen bg-[#0a0908]">
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative w-full h-[50vh] overflow-hidden bg-[#111009]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0908 0%, transparent 60%)" }} />
        </div>
      )}

      {/* Article */}
      <div className="max-w-2xl mx-auto px-8 py-16">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#5a5248] mb-6">
          {formatDate(post.date)} &nbsp;·&nbsp; {post.readTime} min read
        </p>
        <h1 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-[#e8ddd0] leading-tight mb-10">
          {post.title}
        </h1>

        <p className="text-[#c4b89e] text-base font-light italic leading-relaxed mb-10 border-l-2 border-[#c9a87c] pl-6">
          {post.excerpt}
        </p>

        <div className="prose-custom space-y-6">
          {post.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-[#c4b89e] text-base font-light leading-[1.85] tracking-[0.01em]">
              {para.trim()}
            </p>
          ))}
        </div>

        {admin && (
          <div className="mt-16 flex gap-4 border-t border-[#2a2620] pt-8">
            <Link
              to={`/admin/blog?edit=${post.id}`}
              className="text-xs tracking-[0.18em] uppercase text-[#c9a87c] border border-[#c9a87c] px-5 py-2 hover:bg-[#c9a87c] hover:text-[#0a0908] transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="text-xs tracking-[0.18em] uppercase text-[#5a5248] border border-[#2a2620] px-5 py-2 hover:border-[#c9a87c] hover:text-[#c9a87c] transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-[#2a2620]">
          <Link to="/blog" className="text-xs tracking-[0.18em] uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">
            ← All Writing
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}
