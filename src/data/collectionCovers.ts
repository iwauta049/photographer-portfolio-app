const STORAGE_KEY = "portfolio-collection-covers";

/** Maps a collection name (e.g. "Birds") to the id of the photograph chosen as its cover. */
export type CollectionCovers = Record<string, string>;

export function getCollectionCovers(): CollectionCovers {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Saves (or clears, when photoId is null) the cover for a collection and
 * returns the updated map so callers can update state without re-reading.
 */
export function saveCollectionCover(
  collection: string,
  photoId: string | null,
): CollectionCovers {
  const covers = { ...getCollectionCovers() };

  if (photoId) covers[collection] = photoId;
  else delete covers[collection];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(covers));
  } catch {
    // Storage unavailable or full: the in-memory result is still returned.
  }

  return covers;
}
