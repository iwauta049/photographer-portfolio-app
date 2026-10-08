import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isAdmin, adminLogin, getPhotos, getBlogs, getUploadedAt, deletePhoto, deleteBlog, type Photo, type BlogPost } from "../data/store";

export default function Admin() {
  const [authed, setAuthed] = useState(isAdmin());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState(getPhotos);
  const [blogs, setBlogs] = useState(getBlogs);
  const [photoSearch, setPhotoSearch] = useState("");
  const [photoSort, setPhotoSort] = useState("Recently uploaded");
  const [articleSearch, setArticleSearch] = useState("");
  const [articleSort, setArticleSort] = useState("Recently uploaded");
  const [activeTab, setActiveTab] = useState<"photos" | "articles">("photos");
  const [photoPage, setPhotoPage] = useState(1);
  const [articlePage, setArticlePage] = useState(1);
  const [photoPageSize, setPhotoPageSize] = useState(20);
  const [articlePageSize, setArticlePageSize] = useState(10);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <p className="text-xs tracking-[0.25em] uppercase text-primary mb-4 text-center">Studio Access</p>
          <h1 className="font-['DM_Serif_Display'] text-4xl text-foreground text-center mb-10">Sign In</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (adminLogin(password)) {
                setAuthed(true);
                setError("");
              } else {
                setError("Incorrect password.");
              }
            }}
            className="space-y-4"
          >
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm font-light px-4 py-3 focus:outline-none focus:border-ring transition-colors"
            />
            {error && <p className="text-xs text-primary">{error}</p>}
            <button
              type="submit"
              className="w-full text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground py-3 hover:bg-foreground transition-colors font-medium"
            >
              Enter
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">Demo password: portfolio2024</p>
        </div>
      </div>
    );
  }

  function handleDeletePhoto(id: string) {
    if (window.confirm("Delete this photograph?")) {
      deletePhoto(id);
      setPhotos(getPhotos());
    }
  }

  function handleDeleteBlog(id: string) {
    if (window.confirm("Delete this article?")) {
      deleteBlog(id);
      setBlogs(getBlogs());
    }
  }

  const normalizedPhotoSearch = photoSearch.trim().toLowerCase();
  const filteredPhotos = photos
    .filter((photo) =>
      !normalizedPhotoSearch ||
      [photo.title, photo.location, ...photo.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedPhotoSearch),
    )
    .sort((a, b) => sortAdminPhotos(a, b, photoSort));
  const normalizedArticleSearch = articleSearch.trim().toLowerCase();
  const filteredBlogs = blogs
    .filter((post) =>
      !normalizedArticleSearch ||
      [post.title, post.excerpt, ...(post.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedArticleSearch),
    )
    .sort((a, b) => sortAdminArticles(a, b, articleSort));
  const photoPageCount = Math.max(1, Math.ceil(filteredPhotos.length / photoPageSize));
  const articlePageCount = Math.max(1, Math.ceil(filteredBlogs.length / articlePageSize));
  const currentPhotoPage = Math.min(photoPage, photoPageCount);
  const currentArticlePage = Math.min(articlePage, articlePageCount);
  const visiblePhotos = filteredPhotos.slice(
    (currentPhotoPage - 1) * photoPageSize,
    currentPhotoPage * photoPageSize,
  );
  const visibleBlogs = filteredBlogs.slice(
    (currentArticlePage - 1) * articlePageSize,
    currentArticlePage * articlePageSize,
  );

  return (
    <div className="min-h-screen bg-background pt-28 px-8 md:px-16 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-primary mb-2">Owner</p>
            <h1 className="font-['DM_Serif_Display'] text-4xl text-foreground">Studio</h1>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <Link
            to="/admin/profile"
            className="group border border-border hover:border-primary p-8 transition-colors"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 group-hover:text-primary transition-colors">Profile</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl text-foreground">Edit Profile</h2>
            <p className="mt-2 text-sm text-muted-foreground font-light">Update the homepage image, location and introduction</p>
          </Link>
          <Link
            to="/admin/upload"
            className="group border border-border hover:border-primary p-8 transition-colors"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 group-hover:text-primary transition-colors">Add</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl text-foreground">Upload Photograph</h2>
            <p className="mt-2 text-sm text-muted-foreground font-light">Add a new image to the gallery</p>
          </Link>
          <Link
            to="/admin/blog"
            className="group border border-border hover:border-primary p-8 transition-colors"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 group-hover:text-primary transition-colors">Write</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl text-foreground">New Article</h2>
            <p className="mt-2 text-sm text-muted-foreground font-light">Publish a new essay or note</p>
          </Link>
        </div>

        <div
          role="tablist"
          aria-label="Studio content"
          className="mb-8 flex border-b border-border"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "photos"}
            onClick={() => setActiveTab("photos")}
            className={`border-b-2 px-6 py-4 text-xs uppercase tracking-[0.18em] ${
              activeTab === "photos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Photographs <span className="ml-2 opacity-60">{photos.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "articles"}
            onClick={() => setActiveTab("articles")}
            className={`border-b-2 px-6 py-4 text-xs uppercase tracking-[0.18em] ${
              activeTab === "articles"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Articles <span className="ml-2 opacity-60">{blogs.length}</span>
          </button>
        </div>

        {activeTab === "photos" ? (
        <section>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h2 className="font-['DM_Serif_Display'] text-2xl text-foreground">Photographs</h2>
            <span className="text-xs text-muted-foreground">
              {filteredPhotos.length} of {photos.length}
            </span>
          </div>
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              type="search"
              value={photoSearch}
              onChange={(event) => {
                setPhotoSearch(event.target.value);
                setPhotoPage(1);
              }}
              placeholder="Search photos by title, location or tag…"
              className="border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
            <select
              value={photoSort}
              onChange={(event) => {
                setPhotoSort(event.target.value);
                setPhotoPage(1);
              }}
              aria-label="Sort photographs"
              className="border border-border bg-card px-4 py-3 text-sm text-muted-foreground outline-none focus:border-ring"
            >
              <option>Recently uploaded</option>
              <option>Oldest uploaded</option>
              <option>Recently taken</option>
              <option>Oldest taken</option>
              <option>Title A–Z</option>
              <option>Title Z–A</option>
            </select>
            <select
              value={photoPageSize}
              onChange={(event) => {
                setPhotoPageSize(Number(event.target.value));
                setPhotoPage(1);
              }}
              aria-label="Photographs per page"
              className="border border-border bg-card px-4 py-3 text-sm text-muted-foreground outline-none focus:border-ring"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div className="space-y-0">
            {visiblePhotos.map((photo, i) => (
              <div key={photo.id}>
                {i > 0 && <div className="border-t border-secondary" />}
                <div className="flex items-center gap-6 py-4">
                  <img src={photo.thumb} alt={photo.title} className="w-16 h-12 object-cover flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary-foreground font-light truncate">{photo.title}</p>
                    <p className="text-xs text-muted-foreground">{photo.location} · {formatDate(photo.date)}</p>
                  </div>
                  <div className="flex gap-4 flex-shrink-0">
                    <Link to={`/photo/${photo.id}`} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">View</Link>
                    <Link to={`/admin/upload?edit=${photo.id}`} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Edit</Link>
                    <button onClick={() => handleDeletePhoto(photo.id)} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredPhotos.length === 0 && (
              <p className="py-12 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
                No photographs match your search.
              </p>
            )}
          </div>
          <Pagination
            page={currentPhotoPage}
            pageCount={photoPageCount}
            onPrevious={() => setPhotoPage(Math.max(1, currentPhotoPage - 1))}
            onNext={() => setPhotoPage(Math.min(photoPageCount, currentPhotoPage + 1))}
          />
        </section>
        ) : (
        <section>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h2 className="font-['DM_Serif_Display'] text-2xl text-foreground">Articles</h2>
            <span className="text-xs text-muted-foreground">
              {filteredBlogs.length} of {blogs.length}
            </span>
          </div>
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              type="search"
              value={articleSearch}
              onChange={(event) => {
                setArticleSearch(event.target.value);
                setArticlePage(1);
              }}
              placeholder="Search articles by title, summary or tag…"
              className="border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
            <select
              value={articleSort}
              onChange={(event) => {
                setArticleSort(event.target.value);
                setArticlePage(1);
              }}
              aria-label="Sort articles"
              className="border border-border bg-card px-4 py-3 text-sm text-muted-foreground outline-none focus:border-ring"
            >
              <option>Recently uploaded</option>
              <option>Oldest uploaded</option>
              <option>Newest article date</option>
              <option>Oldest article date</option>
              <option>Title A–Z</option>
              <option>Title Z–A</option>
              <option>Drafts first</option>
            </select>
            <select
              value={articlePageSize}
              onChange={(event) => {
                setArticlePageSize(Number(event.target.value));
                setArticlePage(1);
              }}
              aria-label="Articles per page"
              className="border border-border bg-card px-4 py-3 text-sm text-muted-foreground outline-none focus:border-ring"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div className="space-y-0">
            {visibleBlogs.map((post, i) => (
              <div key={post.id}>
                {i > 0 && <div className="border-t border-secondary" />}
                <div className="flex items-center gap-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary-foreground font-light truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.date)} · {post.readTime} min read ·{" "}
                      <span className={post.status === "draft" ? "text-primary" : ""}>
                        {post.status === "draft" ? "Draft" : "Published"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-4 flex-shrink-0">
                    <Link to={`/blog/${post.slug}`} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">View</Link>
                    <Link to={`/admin/blog?edit=${post.id}`} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Edit</Link>
                    <button onClick={() => handleDeleteBlog(post.id)} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredBlogs.length === 0 && (
              <p className="py-12 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
                No articles match your search.
              </p>
            )}
          </div>
          <Pagination
            page={currentArticlePage}
            pageCount={articlePageCount}
            onPrevious={() => setArticlePage(Math.max(1, currentArticlePage - 1))}
            onNext={() => setArticlePage(Math.min(articlePageCount, currentArticlePage + 1))}
          />
        </section>
        )}
      </div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function sortAdminPhotos(a: Photo, b: Photo, sort: string) {
  if (sort === "Oldest uploaded") {
    return getUploadedAt(a).localeCompare(getUploadedAt(b));
  }
  if (sort === "Recently taken") return b.date.localeCompare(a.date);
  if (sort === "Oldest taken") return a.date.localeCompare(b.date);
  if (sort === "Title A–Z") return a.title.localeCompare(b.title);
  if (sort === "Title Z–A") return b.title.localeCompare(a.title);
  return getUploadedAt(b).localeCompare(getUploadedAt(a));
}

function sortAdminArticles(a: BlogPost, b: BlogPost, sort: string) {
  if (sort === "Oldest uploaded") {
    return getUploadedAt(a).localeCompare(getUploadedAt(b));
  }
  if (sort === "Newest article date") return b.date.localeCompare(a.date);
  if (sort === "Oldest article date") return a.date.localeCompare(b.date);
  if (sort === "Title A–Z") return a.title.localeCompare(b.title);
  if (sort === "Title Z–A") return b.title.localeCompare(a.title);
  if (sort === "Drafts first") {
    return Number(b.status === "draft") - Number(a.status === "draft");
  }
  return getUploadedAt(b).localeCompare(getUploadedAt(a));
}

function Pagination({
  page,
  pageCount,
  onPrevious,
  onNext,
}: {
  page: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-6 border-t border-border pt-6"
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={page === 1}
        aria-label="Previous page"
        className="px-3 py-2 text-lg text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-25"
      >
        ←
      </button>
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page === pageCount}
        aria-label="Next page"
        className="px-3 py-2 text-lg text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-25"
      >
        →
      </button>
    </nav>
  );
}
