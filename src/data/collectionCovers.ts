const STORAGE_KEY = "portfolio-collection-covers";

/**
 * The cover for one collection: which photograph, plus how it is framed.
 * x and y are the focal point (0-100%), zoom is 1-3x. Framing is stored
 * instead of a cropped copy, so the original photograph is never altered.
 */
export type CollectionCover = {
  photoId: string;
  x: number;
  y: number;
  zoom: number;
};

/** Maps a collection name (e.g. "Birds") to its chosen cover. */
export type CollectionCovers = Record<string, CollectionCover>;

export const DEFAULT_FRAMING = { x: 50, y: 50, zoom: 1 } as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function finiteOr(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalize(entry: unknown): CollectionCover | null {
  // Earlier versions stored just the photo id as a string.
  if (typeof entry === "string" && entry) {
    return { photoId: entry, ...DEFAULT_FRAMING };
  }

  if (entry && typeof entry === "object") {
    const record = entry as Record<string, unknown>;
    if (typeof record.photoId === "string" && record.photoId) {
      return {
        photoId: record.photoId,
        x: clamp(finiteOr(record.x, DEFAULT_FRAMING.x), 0, 100),
        y: clamp(finiteOr(record.y, DEFAULT_FRAMING.y), 0, 100),
        zoom: clamp(finiteOr(record.zoom, DEFAULT_FRAMING.zoom), 1, 3),
      };
    }
  }

  return null;
}

export function getCollectionCovers(): CollectionCovers {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const covers: CollectionCovers = {};
    for (const [collection, entry] of Object.entries(parsed)) {
      const cover = normalize(entry);
      if (cover) covers[collection] = cover;
    }
    return covers;
  } catch {
    return {};
  }
}

/**
 * Saves (or clears, when cover is null) the cover for a collection and
 * returns the updated map so callers can update state without re-reading.
 */
export function saveCollectionCover(
  collection: string,
  cover: CollectionCover | null,
): CollectionCovers {
  const covers = { ...getCollectionCovers() };

  if (cover) covers[collection] = cover;
  else delete covers[collection];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(covers));
  } catch {
    // Storage unavailable or full: the in-memory result is still returned.
  }

  return covers;
}
