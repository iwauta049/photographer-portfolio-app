import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isAdmin, adminLogin, adminLogout, getPhotos, getBlogs, deletePhoto, deleteBlog } from "../data/store";

export default function Admin() {
  const [authed, setAuthed] = useState(isAdmin());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState(getPhotos);
  const [blogs, setBlogs] = useState(getBlogs);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0908] flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <p className="text-xs tracking-[0.25em] uppercase text-[#c9a87c] mb-4 text-center">Studio Access</p>
          <h1 className="font-['DM_Serif_Display'] text-4xl text-[#e8ddd0] text-center mb-10">Sign In</h1>
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
              className="w-full bg-[#111009] border border-[#2a2620] text-[#e8ddd0] placeholder:text-[#3a3630] text-sm font-light px-4 py-3 focus:outline-none focus:border-[#c9a87c] transition-colors"
            />
            {error && <p className="text-xs text-[#c9a87c]">{error}</p>}
            <button
              type="submit"
              className="w-full text-xs tracking-[0.2em] uppercase bg-[#c9a87c] text-[#0a0908] py-3 hover:bg-[#e8ddd0] transition-colors font-medium"
            >
              Enter
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-[#3a3630]">Demo password: portfolio2024</p>
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

  return (
    <div className="min-h-screen bg-[#0a0908] pt-28 px-8 md:px-16 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#c9a87c] mb-2">Owner</p>
            <h1 className="font-['DM_Serif_Display'] text-4xl text-[#e8ddd0]">Studio</h1>
          </div>
          <button
            onClick={() => { adminLogout(); setAuthed(false); }}
            className="text-xs tracking-[0.18em] uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          <Link
            to="/admin/upload"
            className="group border border-[#2a2620] hover:border-[#c9a87c] p-8 transition-colors"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-3 group-hover:text-[#c9a87c] transition-colors">Add</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl text-[#e8ddd0]">Upload Photograph</h2>
            <p className="mt-2 text-sm text-[#5a5248] font-light">Add a new image to the gallery</p>
          </Link>
          <Link
            to="/admin/blog"
            className="group border border-[#2a2620] hover:border-[#c9a87c] p-8 transition-colors"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-3 group-hover:text-[#c9a87c] transition-colors">Write</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl text-[#e8ddd0]">New Article</h2>
            <p className="mt-2 text-sm text-[#5a5248] font-light">Publish a new essay or note</p>
          </Link>
        </div>

        {/* Photos list */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2a2620]">
            <h2 className="font-['DM_Serif_Display'] text-2xl text-[#e8ddd0]">Photographs</h2>
            <span className="text-xs text-[#5a5248]">{photos.length} total</span>
          </div>
          <div className="space-y-0">
            {photos.map((photo, i) => (
              <div key={photo.id}>
                {i > 0 && <div className="border-t border-[#1c1a15]" />}
                <div className="flex items-center gap-6 py-4">
                  <img src={photo.thumb} alt={photo.title} className="w-16 h-12 object-cover flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#c4b89e] font-light truncate">{photo.title}</p>
                    <p className="text-xs text-[#5a5248]">{photo.location} · {formatDate(photo.date)}</p>
                  </div>
                  <div className="flex gap-4 flex-shrink-0">
                    <Link to={`/photo/${photo.id}`} className="text-xs tracking-widest uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">View</Link>
                    <Link to={`/admin/upload?edit=${photo.id}`} className="text-xs tracking-widest uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">Edit</Link>
                    <button onClick={() => handleDeletePhoto(photo.id)} className="text-xs tracking-widest uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blogs list */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2a2620]">
            <h2 className="font-['DM_Serif_Display'] text-2xl text-[#e8ddd0]">Articles</h2>
            <span className="text-xs text-[#5a5248]">{blogs.length} total</span>
          </div>
          <div className="space-y-0">
            {blogs.map((post, i) => (
              <div key={post.id}>
                {i > 0 && <div className="border-t border-[#1c1a15]" />}
                <div className="flex items-center gap-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#c4b89e] font-light truncate">{post.title}</p>
                    <p className="text-xs text-[#5a5248]">{formatDate(post.date)} · {post.readTime} min read</p>
                  </div>
                  <div className="flex gap-4 flex-shrink-0">
                    <Link to={`/blog/${post.slug}`} className="text-xs tracking-widest uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">View</Link>
                    <Link to={`/admin/blog?edit=${post.id}`} className="text-xs tracking-widest uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">Edit</Link>
                    <button onClick={() => handleDeleteBlog(post.id)} className="text-xs tracking-widest uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}
