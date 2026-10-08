import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getPhoto, getUploadedAt, savePhoto, isAdmin, type Photo } from "../data/store";

const CATEGORY_OPTIONS = [
  { label: "Favorites", tag: "favorite", aliases: ["favorite", "favorites"] },
  { label: "Birds", tag: "bird", aliases: ["bird", "birds"] },
  { label: "Mammals", tag: "mammal", aliases: ["mammal", "mammals"] },
  { label: "Other Wildlife", tag: "wildlife", aliases: ["wildlife"] },
  { label: "Landscape", tag: "landscape", aliases: ["landscape"] },
  { label: "Street", tag: "street", aliases: ["street"] },
] as const;

const CATEGORY_ALIASES = new Set<string>(CATEGORY_OPTIONS.flatMap((option) => option.aliases));

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editId) {
      const p = getPhoto(editId);
      if (p) {
        const normalizedTags = p.tags.map((tag) => tag.toLowerCase());
        const isBirdOrMammal = normalizedTags.some((tag) =>
          ["bird", "birds", "mammal", "mammals"].includes(tag),
        );
        setForm(p);
        setPreview(p.thumb || p.src);
        setSelectedCategories(
          CATEGORY_OPTIONS.filter(
            (option) =>
              !(option.tag === "wildlife" && isBirdOrMammal) &&
              option.aliases.some((alias) => normalizedTags.includes(alias)),
          ).map((option) => option.tag),
        );
        setTagInput(
          p.tags
            .filter((tag) => !CATEGORY_ALIASES.has(tag.toLowerCase()))
            .join(", "),
        );
      }
    }
  }, [editId]);

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Access denied. <Link to="/admin" className="text-primary">Sign in</Link></p>
      </div>
    );
  }

  function set(key: keyof Photo, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCategory(tag: string) {
    setSelectedCategories((categories) =>
      categories.includes(tag)
        ? categories.filter((category) => category !== tag)
        : [...categories, tag],
    );
  }

  function handleFile(file: File) {
    setUploading(true);
    setError("");

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const src = resizeImage(img, 1400, 0.78, 900_000);
        setForm((current) => ({
          ...current,
          src,
          // Reusing the resized source avoids storing a second base64 copy.
          thumb: src,
          width: img.naturalWidth,
          height: img.naturalHeight,
        }));
        setPreview(src);
      } catch {
        setError("This image could not be processed. Please try a JPEG, PNG, or WebP file.");
      } finally {
        URL.revokeObjectURL(objectUrl);
        setUploading(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);
      setError("This image could not be opened. Please try a JPEG, PNG, or WebP file.");
    };

    img.src = objectUrl;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploading || saving) return;

    setSaving(true);
    setError("");
    const additionalTags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    const tags = [...new Set([...selectedCategories, ...additionalTags])];
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
      uploadedAt: editId
        ? getUploadedAt({
          id: editId,
          date: form.date || new Date().toISOString().slice(0, 10),
          uploadedAt: form.uploadedAt,
        })
        : new Date().toISOString(),
    };
    try {
      savePhoto(photo);
      setSaved(true);
      setTimeout(() => navigate(`/photo/${photo.id}`), 800);
    } catch (err) {
      const storageFull =
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" ||
          err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
          err.code === 22);
      setError(
        storageFull
          ? "Browser storage is full. Remove an existing uploaded photograph, then try again."
          : "Changes could not be saved. Please try again.",
      );
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pt-28 px-8 md:px-16 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Link to="/admin" className="text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-primary transition-colors">
            ← Studio
          </Link>
          <h1 className="font-['DM_Serif_Display'] text-4xl text-foreground mt-6">
            {editId ? "Edit Photograph" : "Upload Photograph"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image upload */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Image</p>
            <div
              className="border border-dashed border-border hover:border-primary transition-colors cursor-pointer relative overflow-hidden"
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
                <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                  <p className="text-sm font-light">Drop image or click to browse</p>
                  <p className="text-xs mt-1">JPEG, PNG, WebP</p>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <p className="text-xs tracking-widest uppercase text-primary">Loading…</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }} />

            <div className="mt-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Or paste image URL</p>
              <input
                type="url"
                placeholder="https://..."
                value={form.src?.startsWith("data:") ? "" : form.src || ""}
                onChange={(e) => {
                  set("src", e.target.value);
                  set("thumb", e.target.value);
                  setPreview(e.target.value);
                  setError("");
                }}
                className="w-full bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm font-light px-4 py-3 focus:outline-none focus:border-ring transition-colors"
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

          <Field label="Categories">
            <div className="flex flex-wrap gap-2">
              <span className="border border-primary bg-primary px-4 py-2 text-xs uppercase tracking-[0.16em] text-primary-foreground">
                All
              </span>
              {CATEGORY_OPTIONS.map((category) => {
                const selected = selectedCategories.includes(category.tag);
                return (
                  <button
                    key={category.tag}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleCategory(category.tag)}
                    className={`border px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors ${selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                      }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs font-light text-muted-foreground">
              Every photograph appears in All. Select any additional collections it belongs to.
            </p>
          </Field>

          <Field label="Additional tags (optional)">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} className="field-input" placeholder="desert, golden hour, macro" />
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
              disabled={saved || uploading || saving}
              className="text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-3 hover:bg-foreground transition-colors font-medium disabled:opacity-50"
            >
              {saved ? "Saved ✓" : saving ? "Saving…" : editId ? "Save Changes" : "Publish"}
            </button>
            <Link to="/admin" className="text-xs tracking-[0.2em] uppercase border border-border text-muted-foreground px-8 py-3 hover:border-muted-foreground transition-colors">
              Cancel
            </Link>
          </div>
          {error && (
            <p role="alert" className="text-sm text-primary">
              {error}
            </p>
          )}
        </form>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          background: var(--card);
          border: 1px solid var(--border);
          color: var(--foreground);
          font-size: 0.875rem;
          font-weight: 300;
          padding: 0.75rem 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .field-input::placeholder { color: var(--muted-foreground); }
        .field-input:focus { border-color: var(--ring); }
      `}</style>
    </div>
  );
}

function resizeImage(
  img: HTMLImageElement,
  maxDimension: number,
  initialQuality: number,
  maxDataLength: number,
) {
  let scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  let quality = initialQuality;
  let dataUrl = "";

  for (let attempt = 0; attempt < 6; attempt += 1) {
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    dataUrl = canvas.toDataURL("image/jpeg", quality);

    if (dataUrl.length <= maxDataLength) return dataUrl;

    scale *= 0.82;
    quality = Math.max(0.58, quality - 0.05);
  }

  return dataUrl;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </p>
      {children}
    </div>
  );
}
