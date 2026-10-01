import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPhoto, getPhotos, deletePhoto, isAdmin, type Photo } from "../data/store";

export default function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      <div className="min-h-screen flex items-center justify-center text-[#5a5248] text-sm tracking-widest uppercase">
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

  return (
    <div className="min-h-screen bg-[#0a0908]">
      {/* Full-width image */}
      <div className={`w-full ${isPortrait ? "flex justify-center pt-24 px-4 md:px-16" : ""}`}>
        {isPortrait ? (
          <img
            src={photo.src}
            alt={photo.title}
            className="max-h-[85vh] w-auto object-contain"
            style={{ maxWidth: "min(600px, 100%)" }}
          />
        ) : (
          <img
            src={photo.src}
            alt={photo.title}
            className="w-full object-cover pt-0"
            style={{ maxHeight: "90vh", objectPosition: "center" }}
          />
        )}
      </div>

      {/* Metadata section */}
      <div className="px-8 md:px-16 py-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left — title + description */}
        <div className="md:col-span-2">
          <h1 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-[#e8ddd0] leading-tight mb-6">
            {photo.title}
          </h1>
          <p className="text-[#c4b89e] text-base leading-relaxed font-light max-w-xl">
            {photo.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {photo.tags.map((tag) => (
              <span key={tag} className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] border border-[#2a2620] px-3 py-1">
                {tag}
              </span>
            ))}
          </div>

          {admin && (
            <div className="mt-10 flex gap-4">
              <Link
                to={`/admin/upload?edit=${photo.id}`}
                className="text-xs tracking-[0.18em] uppercase text-[#c9a87c] border border-[#c9a87c] px-5 py-2 hover:bg-[#c9a87c] hover:text-[#0a0908] transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="text-xs tracking-[0.18em] uppercase text-[#5a5248] border border-[#2a2620] px-5 py-2 hover:border-[#c9a87c] hover:text-[#c9a87c] transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Right — technical details */}
        <div className="border-l border-[#2a2620] pl-8 space-y-6">
          <MetaItem label="Location" value={photo.location} />
          <MetaItem label="Date" value={formatDate(photo.date)} />
          {photo.camera && <MetaItem label="Camera" value={photo.camera} />}
          {photo.lens && <MetaItem label="Lens" value={photo.lens} />}
          {photo.settings && <MetaItem label="Exposure" value={photo.settings} />}
        </div>
      </div>

      {/* Prev / next navigation */}
      <div className="border-t border-[#2a2620] grid grid-cols-2">
        {adjacent.prev ? (
          <Link to={`/photo/${adjacent.prev.id}`} className="group flex items-center gap-5 p-8 hover:bg-[#111009] transition-colors">
            <img src={adjacent.prev.thumb} alt={adjacent.prev.title} className="w-20 h-14 object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-1">← Previous</p>
              <p className="font-['DM_Serif_Display'] text-lg text-[#c4b89e] group-hover:text-[#e8ddd0] transition-colors">{adjacent.prev.title}</p>
            </div>
          </Link>
        ) : <div />}

        {adjacent.next ? (
          <Link to={`/photo/${adjacent.next.id}`} className="group flex items-center justify-end gap-5 p-8 hover:bg-[#111009] transition-colors border-l border-[#2a2620] text-right">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-1">Next →</p>
              <p className="font-['DM_Serif_Display'] text-lg text-[#c4b89e] group-hover:text-[#e8ddd0] transition-colors">{adjacent.next.title}</p>
            </div>
            <img src={adjacent.next.thumb} alt={adjacent.next.title} className="w-20 h-14 object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : <div />}
      </div>

      {/* Back */}
      <div className="px-8 md:px-16 py-8">
        <Link to="/" className="text-xs tracking-[0.18em] uppercase text-[#5a5248] hover:text-[#c9a87c] transition-colors">
          ← All Work
        </Link>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a5248] mb-1">{label}</p>
      <p className="text-sm text-[#c4b89e] font-light">{value}</p>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}
