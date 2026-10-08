import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getPhotos,
  getProfile,
  isAdmin,
  saveProfile,
  type Profile,
} from "../data/store";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(getProfile);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const heroNaturalRef = useRef<{ width: number; height: number } | null>(null);
  const heroDragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const photos = getPhotos();

  // Framing is stored as a focal point (0-100%) plus a zoom factor. Profiles
  // saved before this feature existed have no values, so default to centered.
  const heroX = profile.heroX ?? 50;
  const heroY = profile.heroY ?? 50;
  const heroZoom = profile.heroZoom ?? 1;

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Access denied.{" "}
          <Link to="/admin" className="text-primary">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  function update(key: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function updateHeroFraming(
    patch: Partial<Pick<Profile, "heroX" | "heroY" | "heroZoom">>,
  ) {
    setProfile((current) => ({ ...current, ...patch }));
    setSaved(false);
  }

  // A different image needs its own framing, so reset to centered at 1x.
  function changeHeroImage(src: string) {
    setProfile((current) => ({
      ...current,
      heroImage: src,
      heroX: 50,
      heroY: 50,
      heroZoom: 1,
    }));
    setSaved(false);
  }

  function startHeroDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!profile.heroImage) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    heroDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: heroX,
      originY: heroY,
    };
  }

  function moveHeroDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = heroDragRef.current;
    const natural = heroNaturalRef.current;
    const frame = heroFrameRef.current;
    if (!drag || !natural || !frame) return;

    // With object-fit: cover and a zoom about the focal point, moving the focal
    // point by dp shifts the picture by dp * (boxSize - zoom * coveredSize)
    // pixels, so dragging the picture by dx pixels means dp = -dx / overflow.
    const { width: boxWidth, height: boxHeight } = frame.getBoundingClientRect();
    const cover = Math.max(boxWidth / natural.width, boxHeight / natural.height);
    const overflowX = natural.width * cover * heroZoom - boxWidth;
    const overflowY = natural.height * cover * heroZoom - boxHeight;

    updateHeroFraming({
      heroX:
        overflowX > 0.5
          ? clampPercent(drag.originX - ((event.clientX - drag.startX) / overflowX) * 100)
          : drag.originX,
      heroY:
        overflowY > 0.5
          ? clampPercent(drag.originY - ((event.clientY - drag.startY) / overflowY) * 100)
          : drag.originY,
    });
  }

  function endHeroDrag() {
    heroDragRef.current = null;
  }

  function handleHeroKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!profile.heroImage) return;
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
    updateHeroFraming({
      heroX: clampPercent(heroX + move[0]),
      heroY: clampPercent(heroY + move[1]),
    });
  }

  function handleProfilePhotoFile(file: File) {
    setPhotoProcessing(true);
    setPhotoError("");

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        update("profilePhoto", resizeImage(img, 1200, 0.8, 500_000));
      } catch {
        setPhotoError("This image could not be processed. Please try a JPEG, PNG, or WebP file.");
      } finally {
        URL.revokeObjectURL(objectUrl);
        setPhotoProcessing(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setPhotoProcessing(false);
      setPhotoError("This image could not be opened. Please try a JPEG, PNG, or WebP file.");
    };

    img.src = objectUrl;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (photoProcessing) return;

    setSaveError("");
    try {
      saveProfile(profile);
    } catch (err) {
      const storageFull =
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" ||
          err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
          err.code === 22);
      setSaveError(
        storageFull
          ? "Browser storage is full. Use a smaller photo or remove an uploaded photograph, then try again."
          : "The profile could not be saved. Please try again.",
      );
      return;
    }

    setSaved(true);
    setTimeout(() => navigate("/admin"), 700);
  }

  return (
    <div className="min-h-screen bg-background px-8 pb-24 pt-28 md:px-16">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin"
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
        >
          ← Studio
        </Link>

        <div className="mb-12 mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">
            Public profile
          </p>
          <h1 className="font-['DM_Serif_Display'] text-4xl text-foreground">
            Edit Profile
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <section>
            <div
              ref={heroFrameRef}
              role="group"
              aria-label="Homepage image framing. Drag, or use the arrow keys, to reposition."
              tabIndex={profile.heroImage ? 0 : -1}
              onPointerDown={startHeroDrag}
              onPointerMove={moveHeroDrag}
              onPointerUp={endHeroDrag}
              onPointerCancel={endHeroDrag}
              onKeyDown={handleHeroKey}
              style={{ touchAction: profile.heroImage ? "none" : undefined }}
              className={`relative aspect-[16/7] min-h-64 select-none overflow-hidden bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring ${profile.heroImage ? "cursor-grab active:cursor-grabbing" : ""
                }`}
            >
              {profile.heroImage && (
                <img
                  src={profile.heroImage}
                  alt="Homepage background preview"
                  draggable={false}
                  onLoad={(event) => {
                    heroNaturalRef.current = {
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    };
                  }}
                  style={{
                    objectPosition: `${heroX}% ${heroY}%`,
                    transform: `scale(${heroZoom})`,
                    transformOrigin: `${heroX}% ${heroY}%`,
                  }}
                  className="absolute inset-0 h-full w-full object-cover opacity-65"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  Homepage preview
                </p>
              </div>
            </div>

            {profile.heroImage && (
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <p className="text-xs font-light text-muted-foreground">
                  Drag the image to reposition it, or focus it and use the arrow keys.
                </p>
                <label className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Zoom {Math.round(heroZoom * 100)}%
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={heroZoom}
                    onChange={(event) =>
                      updateHeroFraming({ heroZoom: Number(event.target.value) })
                    }
                    aria-label="Zoom homepage image"
                    className="w-40 accent-primary"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => updateHeroFraming({ heroX: 50, heroY: 50, heroZoom: 1 })}
                  disabled={heroX === 50 && heroY === 50 && heroZoom === 1}
                  className="text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted-foreground"
                >
                  Reset framing
                </button>
              </div>
            )}

            <div className="mt-6">
              <FieldLabel>Background image URL</FieldLabel>
              <input
                type="url"
                value={profile.heroImage}
                onChange={(event) => changeHeroImage(event.target.value)}
                placeholder="https://..."
                className="profile-input"
              />
            </div>

            <div className="mt-6">
              <FieldLabel>Or choose a portfolio photograph</FieldLabel>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                {photos.map((photo) => {
                  const selected =
                    profile.heroImage === photo.src || profile.heroImage === photo.thumb;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      aria-label={`Use ${photo.title} as homepage background`}
                      aria-pressed={selected}
                      onClick={() => changeHeroImage(photo.src)}
                      className={`aspect-square overflow-hidden border-2 transition-colors ${selected
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={photo.thumb}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <FieldLabel>About page photo</FieldLabel>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,16rem)_1fr]">
              <div className="relative aspect-[4/5] overflow-hidden bg-card">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="About page photo preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    No photo yet
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <p className="text-xs font-light text-muted-foreground">
                  Shown beside your description on the About page. This is separate from the homepage background.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => photoFileRef.current?.click()}
                    disabled={photoProcessing}
                    className="border border-primary px-5 py-2 text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                  >
                    {photoProcessing ? "Processing…" : "Upload photo"}
                  </button>
                  <input
                    ref={photoFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleProfilePhotoFile(file);
                      event.target.value = "";
                    }}
                  />
                  {profile.profilePhoto && (
                    <button
                      type="button"
                      onClick={() => update("profilePhoto", "")}
                      className="text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-primary"
                    >
                      Remove photo
                    </button>
                  )}
                </div>

                <div>
                  <FieldLabel>Or paste an image URL</FieldLabel>
                  <input
                    type="url"
                    value={(profile.profilePhoto ?? "").startsWith("data:") ? "" : profile.profilePhoto ?? ""}
                    onChange={(event) => {
                      update("profilePhoto", event.target.value);
                      setPhotoError("");
                    }}
                    placeholder="https://..."
                    className="profile-input"
                  />
                </div>

                {photoError && (
                  <p role="alert" className="text-xs text-primary">
                    {photoError}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <FieldLabel>Current location</FieldLabel>
              <input
                value={profile.location}
                onChange={(event) => update("location", event.target.value)}
                className="profile-input"
                placeholder="e.g. Nairobi, Kenya"
                required
              />
            </div>
            <div>
              <FieldLabel>Short bio</FieldLabel>
              <textarea
                value={profile.bio}
                onChange={(event) => update("bio", event.target.value)}
                className="profile-input resize-none"
                placeholder="A short introduction to your work"
                maxLength={240}
                rows={4}
                required
              />
              <p className="mt-2 text-right text-xs text-muted-foreground">
                {profile.bio.length}/240
              </p>
            </div>
            {/* <div>
              <FieldLabel>About you</FieldLabel>
              <textarea
                value={profile.description}
                onChange={(event) => update("description", event.target.value)}
                className="profile-input"
                placeholder="A full description of your work, experience and background"
                maxLength={3000}
                rows={4}
                required
              />
              <p className="mt-2 text-right text-xs text-muted-foreground">
                {profile.description.length}/3000
              </p>
            </div> */}
          </div>

          <div>
            <FieldLabel>About you</FieldLabel>
            <textarea
              value={profile.description}
              onChange={(event) => update("description", event.target.value)}
              className="profile-input"
              placeholder="A full description of your work, experience and background"
              maxLength={3000}
              rows={4}
              required
            />
            <p className="mt-2 text-right text-xs text-muted-foreground">
              {profile.description.length}/3000
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 md:grid-cols-3">
            <div>
              <FieldLabel>Instagram URL</FieldLabel>
              <input
                type="url"
                value={profile.instagramUrl}
                onChange={(event) => update("instagramUrl", event.target.value)}
                className="profile-input"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <FieldLabel>Facebook URL</FieldLabel>
              <input
                type="url"
                value={profile.facebookUrl}
                onChange={(event) => update("facebookUrl", event.target.value)}
                className="profile-input"
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <FieldLabel>eBird URL</FieldLabel>
              <input
                type="url"
                value={profile.ebirdUrl}
                onChange={(event) => update("ebirdUrl", event.target.value)}
                className="profile-input"
                placeholder="https://ebird.org/profile/..."
              />
            </div>
          </div>

          <div className="flex gap-4 border-t border-border pt-8">
            <button
              type="submit"
              disabled={saved}
              className="bg-primary px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground hover:bg-foreground disabled:opacity-50"
            >
              {saved ? "Saved ✓" : "Save Profile"}
            </button>
            <Link
              to="/admin"
              className="border border-border px-8 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:border-muted-foreground"
            >
              Cancel
            </Link>
          </div>
          {saveError && (
            <p role="alert" className="text-sm text-primary">
              {saveError}
            </p>
          )}
        </form>
      </div>

      <style>{`
        .profile-input {
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
        .profile-input::placeholder { color: var(--muted-foreground); }
        .profile-input:focus { border-color: var(--ring); }
      `}</style>
    </div>
  );
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}
