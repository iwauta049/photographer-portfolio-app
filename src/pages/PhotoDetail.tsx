import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { getPhoto, getPhotos, deletePhoto, isAdmin, type Photo } from "../data/store";

export default function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [photo, setPhoto] = useState<Photo | undefined>();
  const [adjacent, setAdjacent] = useState<{ prev?: Photo; next?: Photo }>({});
  const admin = isAdmin();

  useEffect(() => {
    if (!id) return;
    const p = getPhoto(id);
    setPhoto(p);
    const all = getPhotos();
    const idx = all.findIndex((x) => x.id === id);
    setAdjacent({
      prev: idx > 0 ? all[idx - 1] : undefined,
      next: idx < all.length - 1 ? all[idx + 1] : undefined,
    });
    window.scrollTo(0, 0);
  }, [id]);

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm tracking-widest uppercase">
        Photograph not found.
      </div>
    );
  }

  function handleDelete() {
    if (!photo) return;
    if (window.confirm("Delete this photograph?")) {
      deletePhoto(photo.id);
      navigate("/");
    }
  }

  const isPortrait = photo.height > photo.width;
  const fromCategory = (location.state as { fromCategory?: string } | null)?.fromCategory;
  const backPath = fromCategory
    ? `/?category=${encodeURIComponent(fromCategory)}`
    : "/";
  const backLabel = fromCategory ? `← ${fromCategory}` : "← Portfolio";

  return (
    <div className="min-h-screen bg-background">
      {/* Photograph and details */}
      <div className="relative pt-24 lg:grid lg:h-screen lg:grid-cols-[minmax(0,2fr)_minmax(22rem,1fr)]">
        <Link
          to={backPath}
          className="absolute z-10 h-fit w-fit bg-background/65 px-3 py-2 text-xs tracking-[0.18em] uppercase text-foreground backdrop-blur-sm hover:text-accent transition-colors"
          style={{ top: "90px", right: "564px", bottom: "441px", left: "10px" }}
        >
          {backLabel}
        </Link>
        <div
          className={`w-full lg:flex lg:h-[calc(100vh-6rem)] lg:items-center lg:justify-center lg:p-8 ${isPortrait ? "flex justify-center px-4 md:px-16" : ""
            }`}
        >
          {isPortrait ? (
            <img
              src={photo.src}
              alt={photo.title}
              className="max-h-[85vh] w-auto object-contain lg:max-h-full"
              style={{ maxWidth: "min(600px, 100%)" }}
            />
          ) : (
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full object-cover lg:max-h-full lg:object-contain"
              style={{ maxHeight: "90vh", objectPosition: "center" }}
            />
          )}
        </div>

        <aside className="px-8 py-16 md:px-16 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:accent-l lg:accent-accent lg:px-10 lg:py-10">
          <div>
            <h1 className="font-['DM_Serif_Display'] text-4xl text-foreground leading-tight mb-6 xl:text-5xl">
              {photo.title}
            </h1>
            <p className="text-card-foreground text-base leading-relaxed font-light">
              {photo.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {photo.tags.map((tag) => (
                <span key={tag} className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground accent accent-accent px-3 py-1 border border-border">
                  {tag}
                </span>
              ))}
            </div>

            {admin && (
              <div className="mt-10 flex gap-4">
                <Link
                  to={`/admin/upload?edit=${photo.id}`}
                  className="text-xs tracking-[0.18em] uppercase text-accent accent accent-accent px-5 py-2 hover:bg-accent hover:text-background transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="text-xs tracking-[0.18em] uppercase text-muted-foreground accent accent-accent px-5 py-2 hover:accent-accent hover:text-accent transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 accent-t accent-accent pt-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <MetaItem label="Location" value={photo.location} />
            <MetaItem label="Date" value={formatDate(photo.date)} />
            {photo.camera && <MetaItem label="Camera" value={photo.camera} />}
            {photo.lens && <MetaItem label="Lens" value={photo.lens} />}
            {photo.settings && <MetaItem label="Exposure" value={photo.settings} />}
          </div>
        </aside>
      </div>

      {/* Prev / next navigation */}
      <div className="accent-t accent-accent grid grid-cols-2">
        {adjacent.prev ? (
          <Link
            to={`/photo/${adjacent.prev.id}`}
            state={{ fromCategory }}
            className="group flex items-center gap-5 p-8 hover:bg-secondary-foreground transition-colors"
          >
            <img src={adjacent.prev.thumb} alt={adjacent.prev.title} className="w-20 h-14 object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">← Previous</p>
              <p className="font-['DM_Serif_Display'] text-lg text-card-foreground group-hover:text-foreground transition-colors">{adjacent.prev.title}</p>
            </div>
          </Link>
        ) : <div />}

        {adjacent.next ? (
          <Link
            to={`/photo/${adjacent.next.id}`}
            state={{ fromCategory }}
            className="group flex items-center justify-end gap-5 p-8 hover:bg-secondary-foreground transition-colors accent-l accent-accent text-right"
          >
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Next →</p>
              <p className="font-['DM_Serif_Display'] text-lg text-card-foreground group-hover:text-foreground transition-colors">{adjacent.next.title}</p>
            </div>
            <img src={adjacent.next.thumb} alt={adjacent.next.title} className="w-20 h-14 object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : <div />}
      </div>

      {/* Back */}
      <div className="px-8 md:px-16 py-8">
        <Link to={backPath} className="text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-accent transition-colors">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-card-foreground font-light">{value}</p>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}
