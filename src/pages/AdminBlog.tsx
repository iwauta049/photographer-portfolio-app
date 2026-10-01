import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getBlog, getBlogs, saveBlog, isAdmin, type BlogPost } from "../data/store";

export default function AdminBlog() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const admin = isAdmin();

  const [form, setForm] = useState<Partial<BlogPost>>({
    title: "", slug: "", excerpt: "", content: "",
    date: new Date().toISOString().slice(0, 10), coverImage: "", readTime: 5,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editId) {
      const post = getBlogs().find((b) => b.id === editId);
      if (post) setForm(post);
    }
  }, [editId]);

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#5a5248] text-sm">Access denied. <Link to="/admin" className="text-[#c9a87c]">Sign in</Link></p>
      </div>
    );
  }

  function set(key: keyof BlogPost, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function handleTitleChange(val: string) {
    set("title", val);
    if (!editId) {
      set("slug", generateSlug(val));
    }
  }

  function estimateReadTime(text: string) {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const post: BlogPost = {
      id: editId || `b${Date.now()}`,
      title: form.title || "Untitled",
      slug: form.slug || generateSlug(form.title || "untitled"),
      excerpt: form.excerpt || "",
      content: form.content || "",
      date: form.date || new Date().toISOString().slice(0, 10),
      coverImage: form.coverImage || "",
      readTime: estimateReadTime(form.content || ""),
    };
    saveBlog(post);
    setSaved(true);
    setTimeout(() => navigate(`/blog/${post.slug}`), 800);
  }

  const wordCount = (form.content || "").trim().split(/\s+/).filter(Boolean).length;
  const estRead = estimateReadTime(form.content || "");

  return (
    <div className="min-h-screen bg-[#0a0908] pt-28 px-8 md:px-16 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Link to="/admin" className="text-xs tracking-[0.18em] uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">
            ← Studio
          </Link>
          <h1 className="font-['DM_Serif_Display'] text-4xl text-[#e8ddd0] mt-6">
            {editId ? "Edit Article" : "New Article"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Field label="Title" required>
            <input
              value={form.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="field-input text-xl font-['DM_Serif_Display']"
              placeholder="Article title"
            />
          </Field>

          <Field label="Slug (URL)">
            <input
              value={form.slug || ""}
              onChange={(e) => set("slug", e.target.value)}
              className="field-input font-mono text-sm"
              placeholder="auto-generated-from-title"
            />
          </Field>

          <Field label="Cover Image URL">
            <input
              type="url"
              value={form.coverImage || ""}
              onChange={(e) => set("coverImage", e.target.value)}
              className="field-input"
              placeholder="https://..."
            />
            {form.coverImage && (
              <img src={form.coverImage} alt="Cover preview" className="mt-3 w-full h-32 object-cover opacity-60" />
            )}
          </Field>

          <Field label="Excerpt (shown on blog list)">
            <textarea
              value={form.excerpt || ""}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              className="field-input resize-none"
              placeholder="A short description of the article..."
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={form.date || ""}
              onChange={(e) => set("date", e.target.value)}
              className="field-input"
            />
          </Field>

          <Field label={`Body  —  ${wordCount} words · ~${estRead} min read`}>
            <textarea
              value={form.content || ""}
              onChange={(e) => set("content", e.target.value)}
              rows={20}
              className="field-input resize-y"
              placeholder="Write your article here. Separate paragraphs with a blank line."
            />
          </Field>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saved}
              className="text-xs tracking-[0.2em] uppercase bg-[#c9a87c] text-[#0a0908] px-8 py-3 hover:bg-[#e8ddd0] transition-colors font-medium disabled:opacity-50"
            >
              {saved ? "Saved ✓" : editId ? "Save Changes" : "Publish"}
            </button>
            <Link to="/admin" className="text-xs tracking-[0.2em] uppercase border border-[#2a2620] text-[#5a5248] px-8 py-3 hover:border-[#5a5248] transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          background: #111009;
          border: 1px solid #2a2620;
          color: #e8ddd0;
          font-size: 0.875rem;
          font-weight: 300;
          padding: 0.75rem 1rem;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .field-input::placeholder { color: #3a3630; }
        .field-input:focus { border-color: #c9a87c; }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-2">
        {label}{required && <span className="text-[#c9a87c] ml-1">*</span>}
      </p>
      {children}
    </div>
  );
}
