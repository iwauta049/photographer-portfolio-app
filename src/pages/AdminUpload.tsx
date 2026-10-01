import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getPhoto, savePhoto, isAdmin, type Photo } from "../data/store";

export default function AdminUpload() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const admin = isAdmin();

  const [form, setForm] = useState<Partial<Photo>>({
    title: "", description: "", location: "", date: new Date().toISOString().slice(0, 10),
    src: "", thumb: "", tags: [], camera: "", lens: "", settings: "", width: 1600, height: 1067,
  });
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editId) {
      const p = getPhoto(editId);
      if (p) {
        setForm(p);
        setPreview(p.thumb || p.src);
        setTagInput(p.tags.join(", "));
      }
    }
  }, [editId]);

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#5a5248] text-sm">Access denied. <Link to="/admin" className="text-[#c9a87c]">Sign in</Link></p>
      </div>
    );
  }

  function set(key: keyof Photo, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFile(file: File) {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      set("src", dataUrl);
      set("thumb", dataUrl);
      setPreview(dataUrl);
      // Try to get dimensions
      const img = new Image();
      img.onload = () => {
        set("width", img.naturalWidth);
        set("height", img.naturalHeight);
        setUploading(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    const photo: Photo = {
      id: editId || `p${Date.now()}`,
      title: form.title || "Untitled",
      description: form.description || "",
      location: form.location || "",
      date: form.date || new Date().toISOString().slice(0, 10),
      src: form.src || "",
      thumb: form.thumb || form.src || "",
      tags,
      camera: form.camera,
      lens: form.lens,
      settings: form.settings,
      width: form.width || 1600,
      height: form.height || 1067,
    };
    savePhoto(photo);
    setSaved(true);
    setTimeout(() => navigate(`/photo/${photo.id}`), 800);
  }

  return (
    <div className="min-h-screen bg-[#0a0908] pt-28 px-8 md:px-16 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Link to="/admin" className="text-xs tracking-[0.18em] uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">
            ← Studio
          </Link>
          <h1 className="font-['DM_Serif_Display'] text-4xl text-[#e8ddd0] mt-6">
            {editId ? "Edit Photograph" : "Upload Photograph"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image upload */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-3">Image</p>
            <div
              className="border border-dashed border-[#2a2620] hover:border-[#c9a87c] transition-colors cursor-pointer relative overflow-hidden"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/")) handleFile(file);
              }}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-[#3a3630]">
                  <p className="text-sm font-light">Drop image or click to browse</p>
                  <p className="text-xs mt-1">JPEG, PNG, WebP</p>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0908]/70">
                  <p className="text-xs tracking-widest uppercase text-[#c9a87c]">Loading…</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }} />

            <div className="mt-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-2">Or paste image URL</p>
              <input
                type="url"
                placeholder="https://..."
                value={form.src?.startsWith("data:") ? "" : form.src || ""}
                onChange={(e) => {
                  set("src", e.target.value);
                  set("thumb", e.target.value);
                  setPreview(e.target.value);
                }}
                className="w-full bg-[#111009] border border-[#2a2620] text-[#e8ddd0] placeholder:text-[#3a3630] text-sm font-light px-4 py-3 focus:outline-none focus:border-[#c9a87c] transition-colors"
              />
            </div>
          </div>

          <Field label="Title" required>
            <input value={form.title || ""} onChange={(e) => set("title", e.target.value)} required className="field-input" placeholder="e.g. Ochre Ridgeline" />
          </Field>

          <Field label="Description">
            <textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={4} className="field-input resize-none" placeholder="What story does this image tell?" />
          </Field>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Location">
              <input value={form.location || ""} onChange={(e) => set("location", e.target.value)} className="field-input" placeholder="e.g. Namib Desert, Namibia" />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date || ""} onChange={(e) => set("date", e.target.value)} className="field-input" />
            </Field>
          </div>

          <Field label="Tags (comma-separated)">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} className="field-input" placeholder="landscape, desert, golden hour" />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Camera">
              <input value={form.camera || ""} onChange={(e) => set("camera", e.target.value)} className="field-input" placeholder="Sony A7R V" />
            </Field>
            <Field label="Lens">
              <input value={form.lens || ""} onChange={(e) => set("lens", e.target.value)} className="field-input" placeholder="24-70mm f/2.8" />
            </Field>
            <Field label="Exposure">
              <input value={form.settings || ""} onChange={(e) => set("settings", e.target.value)} className="field-input" placeholder="f/8, 1/250s, ISO 100" />
            </Field>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saved || uploading}
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
