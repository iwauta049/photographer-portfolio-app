import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  getBlogs,
  getPhotos,
  getUploadedAt,
  saveBlog,
  isAdmin,
  type BlogPost,
} from "../data/store";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import {
  richTextWordCount,
  sanitizeRichText,
  toRichTextHtml,
} from "../utils/richText";

const BLOG_IMAGE_UPLOAD_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ce8aba1b/blog-images`;
const COVER_GALLERY_FILTERS = [
  "All",
  "Favorites",
  "Birds",
  "Mammals",
  "Other Wildlife",
  "Landscape",
  "Street",
] as const;

// Text colours the author can apply inside an article. These are stored as
// literal hex values in the saved article HTML, so they cannot be CSS variables.
// They are chosen to stay readable on the light background.
const EDITOR_TEXT_COLORS = [
  "#1f1a14",
  "#8a6a3b",
  "#4a4034",
  "#9a5b3c",
  "#4f6b53",
  "#3f6580",
];

function matchesCoverCategory(tags: string[], category: string) {
  if (category === "All") return true;

  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  const categoryTags: Record<string, string[]> = {
    Favorites: ["favorite", "favorites"],
    Birds: ["bird", "birds"],
    Mammals: ["mammal", "mammals"],
    "Other Wildlife": ["wildlife", "reptile", "amphibian", "insect"],
    Landscape: ["landscape"],
    Street: ["street"],
  };

  if (category === "Other Wildlife") {
    const isBirdOrMammal = ["bird", "birds", "mammal", "mammals"].some((tag) =>
      normalizedTags.includes(tag),
    );
    if (isBirdOrMammal) return false;
  }

  return (categoryTags[category] || []).some((tag) => normalizedTags.includes(tag));
}

export default function AdminBlog() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const admin = isAdmin();
  const [galleryPhotos] = useState(getPhotos);

  const [form, setForm] = useState<Partial<BlogPost>>({
    title: "", slug: "", excerpt: "", content: "",
    date: new Date().toISOString().slice(0, 10), coverImage: "", readTime: 5, status: "draft",
  });
  const [savingAs, setSavingAs] = useState<"draft" | "published" | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageError, setImageError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [showCoverGallery, setShowCoverGallery] = useState(false);
  const [coverSearch, setCoverSearch] = useState("");
  const [coverCategory, setCoverCategory] = useState("All");
  const [coverResultLimit, setCoverResultLimit] = useState(12);
  const [showImageTools, setShowImageTools] = useState(false);
  const [showLinkTools, setShowLinkTools] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkError, setLinkError] = useState("");
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    block: "p",
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editId) {
      const post = getBlogs().find((b) => b.id === editId);
      if (post) {
        const content = toRichTextHtml(post.content);
        setForm({ ...post, content });
        setTagInput((post.tags || []).join(", "));
        requestAnimationFrame(() => {
          if (editorRef.current) editorRef.current.innerHTML = content;
        });
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
    return Math.max(1, Math.round(richTextWordCount(text) / 200));
  }

  function handleSave(status: "draft" | "published") {
    setSavingAs(status);
    const post: BlogPost = {
      id: editId || `b${Date.now()}`,
      title: form.title || "Untitled",
      slug: form.slug || generateSlug(form.title || "untitled"),
      excerpt: form.excerpt || "",
      content: sanitizeRichText(form.content || ""),
      date: form.date || new Date().toISOString().slice(0, 10),
      coverImage: form.coverImage || "",
      readTime: estimateReadTime(form.content || ""),
      status,
      tags: tagInput
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag, index, tags) => tag && tags.indexOf(tag) === index),
      uploadedAt: editId
        ? getUploadedAt({
          id: editId,
          date: form.date || new Date().toISOString().slice(0, 10),
          uploadedAt: form.uploadedAt,
        })
        : new Date().toISOString(),
    };
    saveBlog(post);
    setTimeout(
      () => navigate(status === "published" ? `/blog/${post.slug}` : "/admin"),
      800,
    );
  }

  function insertImage() {
    const url = imageUrl.trim();
    if (!url) {
      setImageError("Enter an image URL first.");
      return;
    }

    const editor = editorRef.current;
    if (!editor) return;

    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = url;
    image.alt = imageCaption.trim();
    image.loading = "lazy";
    figure.appendChild(image);

    if (imageCaption.trim()) {
      const caption = document.createElement("figcaption");
      caption.textContent = imageCaption.trim();
      figure.appendChild(caption);
    }

    const trailingParagraph = document.createElement("p");
    trailingParagraph.appendChild(document.createElement("br"));
    const selection = window.getSelection();
    const range = savedRangeRef.current;

    if (selection && range && editor.contains(range.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(range);
      range.deleteContents();
      range.insertNode(figure);
      figure.after(trailingParagraph);
    } else {
      editor.append(figure, trailingParagraph);
    }

    const nextRange = document.createRange();
    nextRange.setStart(trailingParagraph, 0);
    nextRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(nextRange);

    set("content", editor.innerHTML);
    setImageUrl("");
    setImageCaption("");
    setImageError("");
    setShowImageTools(false);
    savedRangeRef.current = null;
    editor.focus();
  }

  function insertLink() {
    const editor = editorRef.current;
    const url = normalizeLinkUrl(linkUrl);
    if (!editor || !url) {
      setLinkError("Enter a valid web or email link.");
      return;
    }

    const selection = window.getSelection();
    const savedRange = savedRangeRef.current;
    if (selection && savedRange && editor.contains(savedRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (range && editor.contains(range.commonAncestorContainer) && !range.collapsed) {
      document.execCommand("createLink", false, url);
      const anchor = selection?.anchorNode?.parentElement?.closest("a");
      anchor?.setAttribute("target", "_blank");
      anchor?.setAttribute("rel", "noopener noreferrer");
    } else {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = linkText.trim() || url;

      if (range && editor.contains(range.commonAncestorContainer)) {
        range.insertNode(anchor);
        range.setStartAfter(anchor);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        editor.appendChild(anchor);
      }
    }

    set("content", editor.innerHTML);
    setLinkUrl("");
    setLinkText("");
    setLinkError("");
    setShowLinkTools(false);
    savedRangeRef.current = null;
    editor.focus();
  }

  function saveEditorSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function applyFormat(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(
      "styleWithCSS",
      false,
      command === "foreColor" ? "true" : "false",
    );
    document.execCommand(command, false, value);
    if (editorRef.current) set("content", editorRef.current.innerHTML);
    updateActiveFormats();
  }

  function applyBlockFormat(block: "p" | "h2" | "h3") {
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (selection && range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    applyFormat("formatBlock", block);
  }

  function updateActiveFormats() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      block: normalizeBlockType(document.queryCommandValue("formatBlock")),
    });
  }

  async function uploadImage(file: File) {
    setUploadingImage(true);
    setImageError("");

    try {
      setImageUrl(await uploadBlogImage(file));
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "The image could not be uploaded.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function uploadCover(file: File) {
    setUploadingCover(true);
    setCoverError("");

    try {
      set("coverImage", await uploadBlogImage(file));
    } catch (error) {
      setCoverError(
        error instanceof Error ? error.message : "The cover image could not be uploaded.",
      );
    } finally {
      setUploadingCover(false);
    }
  }

  async function uploadBlogImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(BLOG_IMAGE_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });
    const result = await response.json();

    if (!response.ok || !result.url) {
      throw new Error(result.error || "The image could not be uploaded.");
    }

    return result.url as string;
  }

  const wordCount = richTextWordCount(form.content || "");
  const estRead = estimateReadTime(form.content || "");
  const normalizedCoverSearch = coverSearch.trim().toLowerCase();
  const coverGalleryResults = galleryPhotos.filter((photo) => {
    const matchesSearch =
      !normalizedCoverSearch ||
      [photo.title, photo.location, ...photo.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedCoverSearch);
    return matchesSearch && matchesCoverCategory(photo.tags, coverCategory);
  });
  const visibleCoverPhotos = coverGalleryResults.slice(0, coverResultLimit);

  return (
    <div className="min-h-screen bg-background pt-28 px-8 md:px-16 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Link to="/admin" className="text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-primary transition-colors">
            ← Studio
          </Link>
          <h1 className="font-['DM_Serif_Display'] text-4xl text-foreground mt-6">
            {editId ? "Edit Article" : "New Article"}
          </h1>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSave("published");
          }}
          className="space-y-8"
        >
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

          <Field label="Cover image">
            <input
              type="url"
              value={form.coverImage || ""}
              onChange={(e) => set("coverImage", e.target.value)}
              className="field-input"
              placeholder="https://..."
            />
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="cursor-pointer border border-primary px-5 py-2 text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-primary-foreground">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingCover}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadCover(file);
                    event.target.value = "";
                  }}
                />
                {uploadingCover ? "Uploading cover…" : "Upload cover"}
              </label>
              {form.coverImage && (
                <button
                  type="button"
                  onClick={() => set("coverImage", "")}
                  className="text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-primary"
                >
                  Remove cover
                </button>
              )}
            </div>
            {coverError && (
              <p className="mt-3 text-xs text-primary">{coverError}</p>
            )}
            {form.coverImage && (
              <img src={form.coverImage} alt="Cover preview" className="mt-4 h-48 w-full object-cover opacity-70" />
            )}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCoverGallery((visible) => !visible)}
                aria-expanded={showCoverGallery}
                className="border border-border px-5 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:border-primary hover:text-primary"
              >
                {showCoverGallery ? "Close gallery" : "Choose from gallery"}
              </button>

              {showCoverGallery && (
                <div className="mt-4 border border-border bg-background p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      type="search"
                      value={coverSearch}
                      onChange={(event) => {
                        setCoverSearch(event.target.value);
                        setCoverResultLimit(12);
                      }}
                      className="field-input"
                      placeholder="Search by title, location or tag…"
                    />
                    <select
                      value={coverCategory}
                      onChange={(event) => {
                        setCoverCategory(event.target.value);
                        setCoverResultLimit(12);
                      }}
                      className="border border-border bg-card px-4 py-3 text-sm text-secondary-foreground outline-none focus:border-ring"
                    >
                      {COVER_GALLERY_FILTERS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="my-4 text-xs text-muted-foreground">
                    {coverGalleryResults.length}{" "}
                    {coverGalleryResults.length === 1 ? "photograph" : "photographs"}
                  </p>

                  {visibleCoverPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {visibleCoverPhotos.map((photo) => {
                        const selected =
                          form.coverImage === photo.src ||
                          form.coverImage === photo.thumb;
                        return (
                          <button
                            key={photo.id}
                            type="button"
                            aria-label={`Use ${photo.title} as cover`}
                            aria-pressed={selected}
                            onClick={() => {
                              set("coverImage", photo.src);
                              setCoverError("");
                              setShowCoverGallery(false);
                            }}
                            className={`overflow-hidden border-2 bg-card text-left transition ${selected
                                ? "border-primary"
                                : "border-transparent opacity-70 hover:opacity-100"
                              }`}
                          >
                            <img
                              src={photo.thumb}
                              alt=""
                              className="aspect-[4/3] w-full object-cover"
                              loading="lazy"
                            />
                            <span className="block truncate px-2 py-2 text-xs text-secondary-foreground">
                              {photo.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-10 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      No matching photographs
                    </p>
                  )}

                  {visibleCoverPhotos.length < coverGalleryResults.length && (
                    <button
                      type="button"
                      onClick={() => setCoverResultLimit((limit) => limit + 12)}
                      className="mt-5 w-full border border-border py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      Show 12 more
                    </button>
                  )}
                </div>
              )}
            </div>
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

          <Field label="Additional tags">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              className="field-input"
              placeholder="wildlife, field notes, photography technique"
            />
            <p className="mt-2 text-xs font-light text-muted-foreground">
              Separate tags with commas. They are used for article metadata and discovery.
            </p>
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
            <div className="overflow-hidden border border-border bg-card focus-within:border-ring">
              <div className="flex flex-wrap items-center gap-1 border-b border-border bg-background p-2">
                <select
                  value={activeFormats.block}
                  aria-label="Text size"
                  title="Text size"
                  onMouseDown={saveEditorSelection}
                  onChange={(event) =>
                    applyBlockFormat(event.target.value as "p" | "h2" | "h3")
                  }
                  className="mr-1 border border-border bg-card px-3 py-2 text-xs text-secondary-foreground outline-none hover:border-primary focus:border-ring"
                >
                  <option value="p">Body text</option>
                  <option value="h2">Section title</option>
                  <option value="h3">Subheading</option>
                </select>
                <span className="mx-1 h-5 w-px bg-border" />
                <ToolbarButton
                  label="Bold"
                  active={activeFormats.bold}
                  onPress={() => applyFormat("bold")}
                >
                  <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                  label="Italic"
                  active={activeFormats.italic}
                  onPress={() => applyFormat("italic")}
                >
                  <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                  label="Underline"
                  active={activeFormats.underline}
                  onPress={() => applyFormat("underline")}
                >
                  <span className="underline underline-offset-2">U</span>
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-border" />
                <ToolbarButton
                  label="Bulleted list"
                  onPress={() => applyFormat("insertUnorderedList")}
                >
                  • List
                </ToolbarButton>
                <ToolbarButton
                  label="Numbered list"
                  onPress={() => applyFormat("insertOrderedList")}
                >
                  1. List
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-border" />
                <div className="flex items-center gap-1 px-2" aria-label="Text color">
                  {EDITOR_TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      title={`Text color ${color}`}
                      aria-label={`Apply text color ${color}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        applyFormat("foreColor", color);
                      }}
                      className="h-5 w-5 rounded-full border border-border hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="mx-1 h-5 w-px bg-border" />
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    saveEditorSelection();
                    setShowLinkTools(false);
                    setShowImageTools((visible) => !visible);
                  }}
                  className={`px-3 py-2 text-xs uppercase tracking-[0.12em] ${showImageTools
                      ? "bg-primary text-primary-foreground"
                      : "text-primary hover:bg-secondary"
                    }`}
                >
                  {uploadingImage ? "Uploading…" : "+ Image"}
                </button>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    saveEditorSelection();
                    setShowImageTools(false);
                    setShowLinkTools((visible) => !visible);
                  }}
                  className={`px-3 py-2 text-xs uppercase tracking-[0.12em] ${showLinkTools
                      ? "bg-primary text-primary-foreground"
                      : "text-primary hover:bg-secondary"
                    }`}
                >
                  + Link
                </button>
              </div>

              {showImageTools && (
                <div className="border-b border-border bg-background p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer border border-primary px-4 py-2 text-xs uppercase tracking-[0.15em] text-primary hover:bg-primary hover:text-primary-foreground">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadImage(file);
                          event.target.value = "";
                        }}
                      />
                      Upload image
                    </label>
                    <span className="text-xs text-muted-foreground">or</span>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(event) => {
                        setImageUrl(event.target.value);
                        setImageError("");
                      }}
                      className="min-w-56 flex-1 border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                      placeholder="Paste image URL"
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={imageCaption}
                      onChange={(event) => setImageCaption(event.target.value)}
                      className="min-w-0 flex-1 border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                      placeholder="Caption (optional)"
                    />
                    <button
                      type="button"
                      onClick={insertImage}
                      disabled={uploadingImage || !imageUrl}
                      className="bg-primary px-5 py-2 text-xs uppercase tracking-[0.15em] text-primary-foreground hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Insert image
                    </button>
                  </div>
                  {imageError && (
                    <p className="mt-3 text-xs text-primary">{imageError}</p>
                  )}
                </div>
              )}

              {showLinkTools && (
                <div className="border-b border-border bg-background p-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Selected text will be linked. If nothing is selected, enter the text to display.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(event) => {
                        setLinkUrl(event.target.value);
                        setLinkError("");
                      }}
                      className="border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                      placeholder="https://example.com"
                    />
                    <input
                      value={linkText}
                      onChange={(event) => setLinkText(event.target.value)}
                      className="border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                      placeholder="Display text (optional)"
                    />
                  </div>
                  {linkError && (
                    <p className="mt-3 text-xs text-primary">{linkError}</p>
                  )}
                  <button
                    type="button"
                    onClick={insertLink}
                    disabled={!linkUrl}
                    className="mt-3 bg-primary px-5 py-2 text-xs uppercase tracking-[0.15em] text-primary-foreground hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Insert link
                  </button>
                </div>
              )}

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                data-placeholder="Write your article here…"
                onInput={(event) => {
                  set("content", event.currentTarget.innerHTML);
                  updateActiveFormats();
                }}
                onBlur={saveEditorSelection}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                className="rich-editor h-[30rem] overflow-y-auto px-5 py-5 text-base font-light leading-[1.85] text-secondary-foreground outline-none md:h-[34rem]"
              />
            </div>
          </Field>

          <div className="flex flex-wrap gap-4 border-t border-border pt-8">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={savingAs !== null}
              className="border border-primary px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
            >
              {savingAs === "draft" ? "Draft Saved ✓" : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={savingAs !== null}
              className="text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-3 hover:bg-foreground transition-colors font-medium disabled:opacity-50"
            >
              {savingAs === "published"
                ? "Published ✓"
                : form.status === "published"
                  ? "Update Published"
                  : "Publish"}
            </button>
            <Link to="/admin" className="text-xs tracking-[0.2em] uppercase border border-border text-muted-foreground px-8 py-3 hover:border-muted-foreground transition-colors">
              Cancel
            </Link>
          </div>
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
          font-family: 'DM Sans', sans-serif;
        }
        .field-input::placeholder { color: var(--muted-foreground); }
        .field-input:focus { border-color: var(--ring); }
        .rich-editor:empty::before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          pointer-events: none;
        }
        .rich-editor p { margin: 0 0 1rem; }
        .rich-editor h2 {
          margin: 1.75rem 0 0.75rem;
          color: var(--foreground);
          font-family: 'DM Serif Display', serif;
          font-size: 1.875rem;
          line-height: 1.2;
        }
        .rich-editor h3 {
          margin: 1.5rem 0 0.65rem;
          color: var(--foreground);
          font-family: 'DM Serif Display', serif;
          font-size: 1.375rem;
          line-height: 1.3;
        }
        .rich-editor ul,
        .rich-editor ol { margin: 1rem 0; padding-left: 1.5rem; }
        .rich-editor ul { list-style: disc; }
        .rich-editor ol { list-style: decimal; }
        .rich-editor a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 0.2em;
        }
        .rich-editor figure {
          margin: 1.75rem auto;
          border: 1px solid var(--border);
          padding: 0.75rem;
        }
        .rich-editor figure img { width: 100%; height: auto; object-fit: contain; }
        .rich-editor figcaption {
          margin-top: 0.75rem;
          color: var(--muted-foreground);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}

function normalizeBlockType(value: string) {
  const normalized = value.toLowerCase().replace(/[<>]/g, "");
  return normalized === "h2" || normalized === "h3" ? normalized : "p";
}

function normalizeLinkUrl(value: string) {
  const trimmed = value.trim();
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function ToolbarButton({
  label,
  active = false,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onPress();
      }}
      aria-pressed={active}
      className={`min-w-10 px-3 py-2 text-xs ${active
          ? "bg-primary text-primary-foreground"
          : "text-secondary-foreground hover:bg-secondary hover:text-foreground"
        }`}
    >
      {children}
    </button>
  );
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
