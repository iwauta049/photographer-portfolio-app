import { useState, useEffect, useRef, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPhotos, getProfile, getUploadedAt, isAdmin, type Photo } from "../data/store";
import {
  DEFAULT_FRAMING,
  getCollectionCovers,
  saveCollectionCover,
  type CollectionCover,
} from "../data/collectionCovers";

type ResolvedCover = {
  photo: Photo;
  x: number;
  y: number;
  zoom: number;
  custom: boolean;
};

const CATEGORIES = [
  { name: "All", tags: [] },
  { name: "Favorites", tags: ["favorite", "favorites"] },
  { name: "Birds", tags: ["bird", "birds"] },
  { name: "Mammals and More", tags: ["mammal", "mammals", "wildlife", "reptile", "amphibian", "insect"] },
  { name: "Landscape", tags: ["landscape"] },
  { name: "Street", tags: ["street"] },
] as const;

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [profile] = useState(getProfile);
  const [covers, setCovers] = useState(getCollectionCovers);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [photoSearch, setPhotoSearch] = useState("");
  const [photoSort, setPhotoSort] = useState("Recently uploaded");
  const activeCategory = searchParams.get("category");
  const admin = isAdmin();

  // Hero framing chosen in Edit Profile (focal point in %, plus zoom).
  const heroX = profile.heroX ?? 50;
  const heroY = profile.heroY ?? 50;
  const heroZoom = profile.heroZoom ?? 1;

  useEffect(() => {
    setPhotos(getPhotos());
  }, []);

  const selectedCategory = CATEGORIES.find((category) => category.name === activeCategory);
  const categoryPhotos = selectedCategory
    ? photos.filter((photo) => matchesCategory(photo, selectedCategory))
    : [];
  const normalizedSearch = photoSearch.trim().toLowerCase();
  const filtered = categoryPhotos
    .filter((photo) =>
      !normalizedSearch ||
      [photo.title, photo.location, photo.description, ...photo.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    )
    .sort((a, b) => sortPhotos(a, b, photoSort));

  // Cover resolution: the admin's choice (with its framing) if that photo is
  // still in the collection, otherwise the first photograph, centered.
  function resolveCover(
    categoryName: string,
    collectionPhotos: Photo[],
  ): ResolvedCover | undefined {
    const saved = covers[categoryName];
    const chosen = saved
      ? collectionPhotos.find((photo) => photo.id === saved.photoId)
      : undefined;

    if (saved && chosen) {
      return { photo: chosen, x: saved.x, y: saved.y, zoom: saved.zoom, custom: true };
    }

    const first = collectionPhotos[0];
    return first ? { photo: first, ...DEFAULT_FRAMING, custom: false } : undefined;
  }

  function chooseCover(categoryName: string, cover: CollectionCover | null) {
    setCovers(saveCollectionCover(categoryName, cover));
    setPickerFor(null);
  }

  const pickerCategory = CATEGORIES.find((category) => category.name === pickerFor);
  const pickerPhotos = pickerCategory
    ? photos.filter((photo) => matchesCategory(photo, pickerCategory))
    : [];

  function openCategory(name: string) {
    setSearchParams({ category: name });
    setPhotoSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen bg-background">
      {selectedCategory ? (
        <>
          <header className="px-8 pb-10 pt-32 md:px-16">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="mb-8 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
            >
              ← Collections
            </button>
            <div className="flex flex-col gap-4 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
              <div>
                {/* <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">Collection</p> */}
                <h1 className="font-['DM_Serif_Display'] text-5xl leading-none text-foreground md:text-7xl">
                  {selectedCategory.name}
                </h1>
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "photograph" : "photographs"}
              </p>
            </div>
          </header>

          <nav
            aria-label="Photo collections"
            className="flex gap-6 overflow-x-auto border-b border-border px-8 pb-6 md:px-16"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => openCategory(category.name)}
                className={`whitespace-nowrap text-xs uppercase tracking-[0.18em] ${selectedCategory.name === category.name
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </nav>

          <div className="grid grid-cols-1 gap-3 border-b border-border px-8 py-6 md:grid-cols-[1fr_auto] md:px-16">
            <input
              type="search"
              value={photoSearch}
              onChange={(event) => setPhotoSearch(event.target.value)}
              placeholder="Search photographs by title, location or tag…"
              className="border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <select
              value={photoSort}
              onChange={(event) => setPhotoSort(event.target.value)}
              aria-label="Sort photographs"
              className="border border-border bg-card px-4 py-3 text-sm text-muted-foreground outline-none focus:border-primary"
            >
              <option>Recently uploaded</option>
              <option>Oldest uploaded</option>
              <option>Recently taken</option>
              <option>Oldest taken</option>
              <option>Title A–Z</option>
              <option>Title Z–A</option>
            </select>
          </div>

          <main className="px-4 py-10 md:px-8">
            {filtered.length > 0 ? (
              <div className="columns-1 gap-3 sm:columns-3 lg:columns-3 xl:columns-4">
                {filtered.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    category={selectedCategory.name}
                    photoIds={filtered.map((item) => item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center text-sm uppercase tracking-widest text-muted-foreground">
                {categoryPhotos.length > 0
                  ? "No photographs match your search."
                  : "No photographs in this collection yet."}
              </div>
            )}
          </main>
        </>
      ) : (
        <>
          <header className="relative flex h-[60vh] items-end overflow-hidden px-8 pb-16 md:px-16">
            {(profile.heroImage || photos[0]) && (
              <img
                src={profile.heroImage || photos[0].src}
                alt=""
                style={
                  profile.heroImage
                    ? {
                      objectPosition: `${heroX}% ${heroY}%`,
                      transform: `scale(${heroZoom})`,
                      transformOrigin: `${heroX}% ${heroY}%`,
                    }
                    : undefined
                }
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="relative z-10 max-w-3xl">
              <p className="mb-4 text-[15px] italic uppercase tracking-[2.5px] text-primary">
                Photography · {profile.location}
              </p>
              <h1 className="font-['DM_Serif_Display'] text-5xl leading-tight text-foreground md:text-7xl">
                Poojan Gohil
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed tracking-wide text-muted-foreground">
                {profile.bio}
              </p>
              {(profile.instagramUrl || profile.facebookUrl || profile.ebirdUrl) && (
                <div className="mt-6 flex items-center gap-3">
                  {profile.instagramUrl && (
                    <a
                      href={profile.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <InstagramIcon />
                    </a>
                  )}
                  {profile.facebookUrl && (
                    <a
                      href={profile.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <FacebookIcon />
                    </a>
                  )}
                  {profile.ebirdUrl && (
                    <a
                      href={profile.ebirdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="eBird"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <EBirdIcon />
                    </a>
                  )}
                </div>
              )}
            </div>
          </header>

          <main className="px-8 py-16 md:px-16 md:py-24">
            <div className="mb-10 flex items-end justify-between border-b border-border pb-6">
              <div>
                <h2 className="font-['DM_Serif_Display'] text-4xl text-foreground md:text-5xl">
                  Collections
                </h2>
              </div>
              <p className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Select a series
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {CATEGORIES.map((category, index) => {
                const collectionPhotos = photos.filter((photo) => matchesCategory(photo, category));
                const fallbackPhoto = photos[index % Math.max(photos.length, 1)];
                const cover: ResolvedCover | undefined =
                  resolveCover(category.name, collectionPhotos) ??
                  (fallbackPhoto
                    ? { photo: fallbackPhoto, ...DEFAULT_FRAMING, custom: false }
                    : undefined);

                return (
                  <div
                    key={category.name}
                    className="group relative aspect-[1/1] overflow-hidden bg-card sm:aspect-[3/2]"
                  >
                    <button
                      type="button"
                      onClick={() => openCategory(category.name)}
                      className="relative block h-full w-full text-left"
                    >
                      {cover && (
                        // The hover zoom lives on this wrapper so it never fights
                        // the inline framing transform on the image itself.
                        <span className="absolute inset-0 block transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-90">
                          <img
                            src={cover.photo.thumb || cover.photo.src}
                            alt=""
                            style={coverImageStyle(cover)}
                            className="h-full w-full object-cover"
                            loading={index > 2 ? "lazy" : "eager"}
                          />
                        </span>
                      )}
                      <span className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2 md:p-8">
                        <span>
                          {/* <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-primary">
                            {String(index + 1).padStart(2, "0")}
                          </span> */}
                          <span className="block font-['DM_Serif_Display'] text-1xl text-foreground md:text-4xl">
                            {category.name}
                          </span>
                        </span>
                        {/* <span className="pb-1 text-xs uppercase tracking-[0.18em] text-foreground/50">
                          {collectionPhotos.length} {collectionPhotos.length === 1 ? "image" : "images"} →
                        </span> */}
                      </span>
                    </button>

                    {/* Admin only: appears on hover (always visible on touch devices) */}
                    {admin && collectionPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPickerFor(category.name)}
                        className="absolute right-2 top-2 z-10 whitespace-nowrap border border-border bg-card px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-foreground opacity-0 transition-opacity hover:border-primary hover:text-primary focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em] [@media(hover:none)]:opacity-100"
                      >
                        Change cover
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </>
      )}

      {admin && pickerCategory && pickerPhotos.length > 0 && (
        <CoverPicker
          title={pickerCategory.name}
          photos={pickerPhotos}
          current={resolveCover(pickerCategory.name, pickerPhotos)}
          onSave={(cover) => chooseCover(pickerCategory.name, cover)}
          onReset={() => chooseCover(pickerCategory.name, null)}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}

function coverImageStyle(cover: { x: number; y: number; zoom: number }): CSSProperties {
  return {
    objectPosition: `${cover.x}% ${cover.y}%`,
    transform: `scale(${cover.zoom})`,
    transformOrigin: `${cover.x}% ${cover.y}%`,
  };
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}

function CoverPicker({
  title,
  photos,
  current,
  onSave,
  onReset,
  onClose,
}: {
  title: string;
  photos: Photo[];
  current?: ResolvedCover;
  onSave: (cover: CollectionCover) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CollectionCover>(() => ({
    photoId: current?.photo.id ?? photos[0].id,
    x: current?.x ?? DEFAULT_FRAMING.x,
    y: current?.y ?? DEFAULT_FRAMING.y,
    zoom: current?.zoom ?? DEFAULT_FRAMING.zoom,
  }));
  const frameRef = useRef<HTMLDivElement>(null);
  const naturalRef = useRef<{ width: number; height: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const draftPhoto = photos.find((photo) => photo.id === draft.photoId) ?? photos[0];
  const isDefaultFraming =
    draft.x === DEFAULT_FRAMING.x &&
    draft.y === DEFAULT_FRAMING.y &&
    draft.zoom === DEFAULT_FRAMING.zoom;

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function selectPhoto(photo: Photo) {
    if (photo.id === draft.photoId) return;
    naturalRef.current = null;
    // Re-selecting the saved cover restores its saved framing; any other
    // photograph starts centered at 1x.
    setDraft(
      current?.custom && photo.id === current.photo.id
        ? { photoId: photo.id, x: current.x, y: current.y, zoom: current.zoom }
        : { photoId: photo.id, ...DEFAULT_FRAMING },
    );
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: draft.x,
      originY: draft.y,
    };
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const natural = naturalRef.current;
    const frame = frameRef.current;
    if (!drag || !natural || !frame) return;

    // Same maths as the homepage image: with object-fit: cover and a zoom about
    // the focal point, moving the focal point by dp shifts the picture by
    // dp * overflow pixels, so dragging the picture by dx means dp = -dx / overflow.
    const { width: boxWidth, height: boxHeight } = frame.getBoundingClientRect();
    const cover = Math.max(boxWidth / natural.width, boxHeight / natural.height);
    const overflowX = natural.width * cover * draft.zoom - boxWidth;
    const overflowY = natural.height * cover * draft.zoom - boxHeight;

    setDraft((d) => ({
      ...d,
      x:
        overflowX > 0.5
          ? clampPercent(drag.originX - ((event.clientX - drag.startX) / overflowX) * 100)
          : drag.originX,
      y:
        overflowY > 0.5
          ? clampPercent(drag.originY - ((event.clientY - drag.startY) / overflowY) * 100)
          : drag.originY,
    }));
  }

  function endDrag() {
    dragRef.current = null;
  }

  function handleFrameKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 10 : 2;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setDraft((d) => ({
      ...d,
      x: clampPercent(d.x + move[0]),
      y: clampPercent(d.y + move[1]),
    }));
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Choose and frame a cover photograph for ${title}`}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col border border-border bg-background"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-border p-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-primary">
              Collection cover
            </p>
            <h2 className="font-['DM_Serif_Display'] text-3xl text-foreground">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-2 text-2xl leading-none text-muted-foreground hover:text-primary"
          >
            ×
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto p-6">
          <section>
            <div className="mx-auto flex max-w-xl flex-wrap items-end justify-center gap-4">
            <div
              ref={frameRef}
              role="group"
              aria-label="Cover framing. Drag, or use the arrow keys, to reposition."
              tabIndex={0}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={handleFrameKey}
              style={{ touchAction: "none" }}
              className="relative aspect-[3/2] min-w-0 flex-1 basis-72 cursor-grab select-none overflow-hidden bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
            >
              <img
                key={draftPhoto.id}
                src={draftPhoto.thumb || draftPhoto.src}
                alt=""
                draggable={false}
                onLoad={(event) => {
                  naturalRef.current = {
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  };
                }}
                style={coverImageStyle(draft)}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Same overlay and title as the real card, so you can see what the text covers */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
              <span className="pointer-events-none absolute bottom-0 left-0 p-5 font-['DM_Serif_Display'] text-2xl text-foreground">
                {title}
              </span>
            </div>

            {/* Cards are square on phones, so show that crop too (read-only) */}
            <div className="shrink-0" aria-hidden="true">
              <div className="relative aspect-square w-28 overflow-hidden bg-card">
                <img
                  key={draftPhoto.id}
                  src={draftPhoto.thumb || draftPhoto.src}
                  alt=""
                  draggable={false}
                  style={coverImageStyle(draft)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                <span className="absolute bottom-0 left-0 p-2 font-['DM_Serif_Display'] text-sm text-foreground">
                  {title}
                </span>
              </div>
              <p className="mt-1 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Phone
              </p>
            </div>
            </div>

            <div className="mx-auto mt-4 flex max-w-xl flex-wrap items-center gap-x-6 gap-y-3">
              <p className="text-xs font-light text-muted-foreground">
                Drag to reposition, or focus the image and use the arrow keys.
              </p>
              <label className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Zoom {Math.round(draft.zoom * 100)}%
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={draft.zoom}
                  onChange={(event) =>
                    setDraft((d) => ({ ...d, zoom: Number(event.target.value) }))
                  }
                  aria-label="Zoom cover image"
                  className="w-40 accent-primary"
                />
              </label>
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, ...DEFAULT_FRAMING }))}
                disabled={isDefaultFraming}
                className="text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted-foreground"
              >
                Reset framing
              </button>
            </div>
          </section>

          <section>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Choose a photograph
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {photos.map((photo) => {
                const selected = photo.id === draft.photoId;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    aria-label={`Use ${photo.title} as the ${title} cover`}
                    aria-pressed={selected}
                    onClick={() => selectPhoto(photo)}
                    className={`relative aspect-square overflow-hidden border-2 transition-colors ${selected
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={photo.thumb || photo.src}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {selected && (
                      <span className="absolute left-0 top-0 bg-primary px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-primary-foreground">
                        Cover
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border p-6">
          <p className="text-xs text-muted-foreground">
            {current?.custom
              ? "Using your chosen photograph."
              : "Using the first photograph automatically."}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {current?.custom && (
              <button
                type="button"
                onClick={onReset}
                className="border border-border px-5 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:border-primary hover:text-primary"
              >
                Use automatic cover
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="border border-border px-5 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:border-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="bg-primary px-6 py-2 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground hover:bg-foreground"
            >
              Save cover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function matchesCategory(
  photo: Photo,
  category: (typeof CATEGORIES)[number],
) {
  if (category.name === "All") return true;

  const photoTags = photo.tags.map((tag) => tag.toLowerCase());
  if (category.name === "Mammals and More") {
    // Mammals always belong here; the other wildlife tags only count when the
    // photo isn't a bird (birds have their own collection).
    if (photoTags.includes("mammal") || photoTags.includes("mammals")) return true;
    const isBird = photoTags.includes("bird") || photoTags.includes("birds");
    return !isBird && category.tags.some((tag) => photoTags.includes(tag));
  }

  return category.tags.some((tag) => photoTags.includes(tag));
}

function sortPhotos(a: Photo, b: Photo, sort: string) {
  if (sort === "Oldest uploaded") {
    return getUploadedAt(a).localeCompare(getUploadedAt(b));
  }
  if (sort === "Recently taken") return b.date.localeCompare(a.date);
  if (sort === "Oldest taken") return a.date.localeCompare(b.date);
  if (sort === "Title A–Z") return a.title.localeCompare(b.title);
  if (sort === "Title Z–A") return b.title.localeCompare(a.title);
  return getUploadedAt(b).localeCompare(getUploadedAt(a));
}

function PhotoCard({
  photo,
  category,
  photoIds,
}: {
  photo: Photo;
  category: string;
  photoIds: string[];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/photo/${photo.id}`}
      state={{ fromCategory: category, photoIds }}
      className="block mb-3 relative overflow-hidden group bg-primary"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={photo.thumb}
        alt={photo.title}
        className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(10,9,8,0.85) 10%, transparent 60%)", opacity: hovered ? 1 : 0 }}
      >
        <p className="font-['DM_Serif_Display'] text-lg text-muted leading-tight">{photo.title}</p>
        <p className="text-xs text-muted-foreground mt-1 tracking-wide">{photo.location}</p>
      </div>
    </Link>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.4v3h2.8v8h3.4Z" />
    </svg>
  );
}

function EBirdIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Body, head and beak */}
      <path d="M3.6 10.6 L8.2 9.2 C8.6 6.4 10.6 4.4 13.1 4.4 C15.9 4.4 17.5 6.6 17.5 9.4 C17.5 12.4 18.9 15.2 20.4 19.4 L15.4 17.9 C11.8 18.8 8 16.8 8 12.6 C8 12.2 8 11.9 8.1 11.7 Z" />
      {/* Wing */}
      <path d="M11.2 11.8 C13.6 11.8 15.4 13.2 16.2 15.4" />
      {/* Eye, matching Instagram's corner dot */}
      <circle cx="10.9" cy="8.1" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
