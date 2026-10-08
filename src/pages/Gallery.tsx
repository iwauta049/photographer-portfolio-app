import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPhotos, getProfile, getUploadedAt, isAdmin, type Photo } from "../data/store";
import { getCollectionCovers, saveCollectionCover } from "../data/collectionCovers";

const CATEGORIES = [
  { name: "All", tags: [] },
  { name: "Favorites", tags: ["favorite", "favorites"] },
  { name: "Birds", tags: ["bird", "birds"] },
  { name: "Mammals", tags: ["mammal", "mammals"] },
  { name: "Other Wildlife", tags: ["wildlife", "reptile", "amphibian", "insect"] },
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

  // Cover resolution: the admin's choice if that photo is still in the
  // collection, otherwise the collection's first photograph.
  function resolveCover(categoryName: string, collectionPhotos: Photo[]) {
    const chosenId = covers[categoryName];
    const chosen = chosenId
      ? collectionPhotos.find((photo) => photo.id === chosenId)
      : undefined;
    return chosen ?? collectionPhotos[0];
  }

  function chooseCover(categoryName: string, photoId: string | null) {
    setCovers(saveCollectionCover(categoryName, photoId));
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
              <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
                {filtered.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} category={selectedCategory.name} />
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {CATEGORIES.map((category, index) => {
                const collectionPhotos = photos.filter((photo) => matchesCategory(photo, category));
                const cover =
                  resolveCover(category.name, collectionPhotos) ??
                  photos[index % Math.max(photos.length, 1)];

                return (
                  <div
                    key={category.name}
                    className="group relative aspect-[4/5] overflow-hidden bg-card sm:aspect-[3/2]"
                  >
                    <button
                      type="button"
                      onClick={() => openCategory(category.name)}
                      className="relative block h-full w-full text-left"
                    >
                      {cover && (
                        <img
                          src={cover.thumb || cover.src}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-100 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-90"
                          loading={index > 2 ? "lazy" : "eager"}
                        />
                      )}
                      <span className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8">
                        <span>
                          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-primary">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="block font-['DM_Serif_Display'] text-3xl text-foreground md:text-4xl">
                            {category.name}
                          </span>
                        </span>
                        <span className="pb-1 text-xs uppercase tracking-[0.18em] text-foreground/50">
                          {collectionPhotos.length} {collectionPhotos.length === 1 ? "image" : "images"} →
                        </span>
                      </span>
                    </button>

                    {/* Admin only: appears on hover (always visible on touch devices) */}
                    {admin && collectionPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPickerFor(category.name)}
                        className="absolute right-4 top-4 z-10 border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.16em] text-foreground opacity-0 transition-opacity hover:border-primary hover:text-primary focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
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

      {admin && pickerCategory && (
        <CoverPicker
          title={pickerCategory.name}
          photos={pickerPhotos}
          currentCoverId={resolveCover(pickerCategory.name, pickerPhotos)?.id}
          hasCustomCover={Boolean(covers[pickerCategory.name])}
          onSelect={(photoId) => chooseCover(pickerCategory.name, photoId)}
          onReset={() => chooseCover(pickerCategory.name, null)}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}

function CoverPicker({
  title,
  photos,
  currentCoverId,
  hasCustomCover,
  onSelect,
  onReset,
  onClose,
}: {
  title: string;
  photos: Photo[];
  currentCoverId?: string;
  hasCustomCover: boolean;
  onSelect: (photoId: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Choose a cover photograph for ${title}`}
        className="flex max-h-[85vh] w-full max-w-4xl flex-col border border-border bg-background"
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

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {photos.map((photo) => {
              const selected = photo.id === currentCoverId;
              return (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={`Use ${photo.title} as the ${title} cover`}
                  aria-pressed={selected}
                  onClick={() => onSelect(photo.id)}
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
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border p-6">
          <p className="text-xs text-muted-foreground">
            {hasCustomCover
              ? "Using your chosen photograph."
              : "Using the first photograph automatically."}
          </p>
          {hasCustomCover && (
            <button
              type="button"
              onClick={onReset}
              className="border border-border px-5 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:border-primary hover:text-primary"
            >
              Use automatic cover
            </button>
          )}
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
  if (category.name === "Other Wildlife") {
    const isBirdOrMammal = ["bird", "birds", "mammal", "mammals"].some((tag) =>
      photoTags.includes(tag),
    );
    return !isBirdOrMammal && category.tags.some((tag) => photoTags.includes(tag));
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

function PhotoCard({ photo, category }: { photo: Photo; category: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/photo/${photo.id}`}
      state={{ fromCategory: category }}
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
