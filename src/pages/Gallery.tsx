import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPhotos, type Photo } from "../data/store";

const TAGS = ["All", "landscape", "portrait", "monochrome", "seascape", "mountain", "street"];

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    setPhotos(getPhotos());
  }, []);

  const filtered = activeTag === "All"
    ? photos
    : photos.filter((p) => p.tags.includes(activeTag));

  return (
    <div className="min-h-screen bg-[#0a0908]">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-end pb-16 px-8 md:px-16 overflow-hidden">
        {photos[0] && (
          <img
            src={photos[0].src}
            alt={photos[0].title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0908 0%, rgba(10,9,8,0.3) 60%, transparent 100%)" }} />
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs tracking-[0.25em] uppercase text-[#c9a87c] mb-4">Photography</p>
          <h1 className="font-['DM_Serif_Display'] text-5xl md:text-7xl text-[#e8ddd0] leading-tight">
            Poojan Gohil
          </h1>
          <p className="mt-4 text-[#7a7062] text-sm tracking-wide max-w-md leading-relaxed">
            Landscape & portrait photographer. Working with available light across Europe, Asia, and the Americas.
          </p>
        </div>
      </div>

      {/* Filter tags */}
      <div className="px-8 md:px-16 py-6 border-y border-[#2a2620] flex gap-6 overflow-x-auto">
        {TAGS.filter((t) => t === "All" || photos.some((p) => p.tags.includes(t))).map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`text-xs tracking-[0.18em] uppercase whitespace-nowrap transition-colors ${
              activeTag === tag
                ? "text-[#c9a87c]"
                : "text-[#5a5248] hover:text-[#e8ddd0]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="px-4 md:px-8 py-10">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3">
          {filtered.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-32 text-[#5a5248] text-sm tracking-widest uppercase">
          No photographs in this series yet.
        </div>
      )}
    </div>
  );
}

function PhotoCard({ photo }: { photo: Photo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/photo/${photo.id}`}
      className="block mb-3 relative overflow-hidden group bg-[#111009]"
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
        style={{ background: "linear-gradient(to top, rgba(10,9,8,0.85) 0%, transparent 60%)", opacity: hovered ? 1 : 0 }}
      >
        <p className="font-['DM_Serif_Display'] text-lg text-[#e8ddd0] leading-tight">{photo.title}</p>
        <p className="text-xs text-[#7a7062] mt-1 tracking-wide">{photo.location}</p>
      </div>
    </Link>
  );
}
