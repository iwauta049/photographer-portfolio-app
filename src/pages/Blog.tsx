import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs, getUploadedAt, isAdmin, deleteBlog, type BlogPost } from "../data/store";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [articleSearch, setArticleSearch] = useState("");
  const [articleSort, setArticleSort] = useState("Recently uploaded");
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

  const publishedPosts = posts.filter((post) => post.status !== "draft");
  const draftPosts = posts.filter((post) => post.status === "draft");
  const normalizedSearch = articleSearch.trim().toLowerCase();
  const filteredPosts = publishedPosts
    .filter((post) =>
      !normalizedSearch ||
      [post.title, post.excerpt, ...(post.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    )
    .sort((a, b) => sortArticles(a, b, articleSort));

  return (
    <div className="min-h-screen bg-background pt-32 px-8 md:px-16 pb-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-['DM_Serif_Display'] text-5xl md:text-6xl text-foreground mb-16 leading-tight">
          Blog
        </h1>

        {admin && (
          <div className="mb-12">
            <Link
              to="/admin/blog"
              className="text-xs tracking-[0.18em] uppercase text-border-primary border border-border-primary px-5 py-2 hover:bg-border-primary hover:text-background transition-colors"
            >
              + New Article
            </Link>

            {draftPosts.length > 0 && (
              <section className="mt-12 border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-border-primary">
                      Private
                    </p>
                    <h2 className="font-['DM_Serif_Display'] text-2xl text-foreground">
                      Drafts
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{draftPosts.length}</span>
                </div>
                <div>
                  {draftPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className={`flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between ${index > 0 ? "border-t border-border" : ""
                        }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-['DM_Serif_Display'] text-xl text-foreground">
                          {post.title || "Untitled"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Saved {formatDate(post.date)} · {post.readTime} min read
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 gap-4">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-border-primary"
                        >
                          Preview
                        </Link>
                        <Link
                          to={`/admin/blog?edit=${post.id}`}
                          className="text-xs uppercase tracking-[0.15em] text-border-primary hover:text-foreground"
                        >
                          Continue editing
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 border-y border-border py-6 sm:grid-cols-[1fr_auto]">
          <input
            type="search"
            value={articleSearch}
            onChange={(event) => setArticleSearch(event.target.value)}
            placeholder="Search articles by title, summary or tag…"
            className="border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border-primary"
          />
          <select
            value={articleSort}
            onChange={(event) => setArticleSort(event.target.value)}
            aria-label="Sort articles"
            className="border border-border bg-card px-4 py-3 text-sm text-secondary-foreground outline-none focus:border-border-primary"
          >
            <option>Recently uploaded</option>
            <option>Oldest uploaded</option>
            <option>Newest article date</option>
            <option>Oldest article date</option>
            <option>Title A–Z</option>
            <option>Title Z–A</option>
          </select>
        </div>

        {filteredPosts.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground text-sm tracking-widest uppercase">
            {publishedPosts.length > 0 ? "No articles match your search." : "No articles yet."}
          </p>
        ) : (
          <div className="space-y-0">
            {filteredPosts.map((post, i) => (
              <article key={post.id}>
                {i > 0 && <div className="border-t border-border" />}
                <Link to={`/blog/${post.slug}`} className="group block py-10">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {post.coverImage && (
                      <div className="md:w-40 md:flex-shrink-0 overflow-hidden bg-card">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-28 md:h-24 object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                        {formatDate(post.date)} &nbsp;·&nbsp; {post.readTime} min read
                      </p>
                      <h2 className="font-['DM_Serif_Display'] text-2xl md:text-3xl text-foreground group-hover:text-border-primary transition-colors mb-3 leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-secondary-foreground text-sm leading-relaxed font-light">
                        {post.excerpt}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-border px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-4 text-xs tracking-[0.15em] uppercase text-border-primary group-hover:text-foreground transition-colors">
                        Read →
                      </p>
                    </div>
                  </div>
                </Link>
                {admin && (
                  <div className="pb-8 flex gap-4">
                    <Link
                      to={`/admin/blog?edit=${post.id}`}
                      className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-border-primary transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={(e) => handleDelete(post.id, e)}
                      className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-border-primary transition-colors"
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

function sortArticles(a: BlogPost, b: BlogPost, sort: string) {
  if (sort === "Oldest uploaded") {
    return getUploadedAt(a).localeCompare(getUploadedAt(b));
  }
  if (sort === "Newest article date") return b.date.localeCompare(a.date);
  if (sort === "Oldest article date") return a.date.localeCompare(b.date);
  if (sort === "Title A–Z") return a.title.localeCompare(b.title);
  if (sort === "Title Z–A") return b.title.localeCompare(a.title);
  return getUploadedAt(b).localeCompare(getUploadedAt(a));
}
