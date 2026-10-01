import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs, isAdmin, deleteBlog, type BlogPost } from "../data/store";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const admin = isAdmin();

  useEffect(() => {
    setPosts(getBlogs());
  }, []);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    if (window.confirm("Delete this article?")) {
      deleteBlog(id);
      setPosts(getBlogs());
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0908] pt-32 px-8 md:px-16 pb-24">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs tracking-[0.25em] uppercase text-[#c9a87c] mb-4">Writing</p>
        <h1 className="font-['DM_Serif_Display'] text-5xl md:text-6xl text-[#e8ddd0] mb-16 leading-tight">
          Notes & Essays
        </h1>

        {admin && (
          <div className="mb-12">
            <Link
              to="/admin/blog"
              className="text-xs tracking-[0.18em] uppercase text-[#c9a87c] border border-[#c9a87c] px-5 py-2 hover:bg-[#c9a87c] hover:text-[#0a0908] transition-colors"
            >
              + New Article
            </Link>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-[#5a5248] text-sm tracking-widest uppercase">No articles yet.</p>
        ) : (
          <div className="space-y-0">
            {posts.map((post, i) => (
              <article key={post.id}>
                {i > 0 && <div className="border-t border-[#2a2620]" />}
                <Link to={`/blog/${post.slug}`} className="group block py-10">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {post.coverImage && (
                      <div className="md:w-40 md:flex-shrink-0 overflow-hidden bg-[#111009]">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-28 md:h-24 object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-3">
                        {formatDate(post.date)} &nbsp;·&nbsp; {post.readTime} min read
                      </p>
                      <h2 className="font-['DM_Serif_Display'] text-2xl md:text-3xl text-[#e8ddd0] group-hover:text-[#c9a87c] transition-colors mb-3 leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-[#7a7062] text-sm leading-relaxed font-light">
                        {post.excerpt}
                      </p>
                      <p className="mt-4 text-xs tracking-[0.15em] uppercase text-[#c9a87c] group-hover:text-[#e8ddd0] transition-colors">
                        Read →
                      </p>
                    </div>
                  </div>
                </Link>
                {admin && (
                  <div className="pb-8 flex gap-4">
                    <Link
                      to={`/admin/blog?edit=${post.id}`}
                      className="text-xs tracking-[0.15em] uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={(e) => handleDelete(post.id, e)}
                      className="text-xs tracking-[0.15em] uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}
