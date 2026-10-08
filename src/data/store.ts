export interface Photo {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  src: string;
  thumb: string;
  tags: string[];
  camera?: string;
  lens?: string;
  settings?: string;
  width: number;
  height: number;
  uploadedAt?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  coverImage: string;
  readTime: number;
  status?: "draft" | "published";
  tags?: string[];
  uploadedAt?: string;
}

export interface Profile {
  heroImage: string;
  profileImage?: string;
  location: string;
  bio: string;
  description: string;
  instagramUrl: string;
  facebookUrl: string;
  ebirdUrl: string;
}

export function getUploadedAt(item: {
  id: string;
  date: string;
  uploadedAt?: string;
}) {
  if (item.uploadedAt) return item.uploadedAt;

  const timestamp = Number(item.id.slice(1));
  if (Number.isFinite(timestamp) && timestamp > 1_000_000_000_000) {
    return new Date(timestamp).toISOString();
  }

  return item.date;
}

const PHOTOS_KEY = "portfolio_photos";
const BLOGS_KEY = "portfolio_blogs";
const ADMIN_KEY = "portfolio_admin_auth";
const PROFILE_KEY = "portfolio_profile";
const CONTENT_VERSION_KEY = "portfolio_content_version";
const CONTENT_VERSION = "2";

const SEED_PHOTOS: Photo[] = [
  {
    id: "p1",
    title: "Ochre Ridgeline",
    description: "The last light of the afternoon catches the mineral face of the ridge, turning it a deep burnt sienna. Shot during a solo traverse of the high desert plateau.",
    location: "Namib Desert, Namibia",
    date: "2023-11-08",
    src: "https://images.unsplash.com/photo-1489493512598-d08130f49bea?w=1600&h=1067&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1489493512598-d08130f49bea?w=800&h=533&fit=crop&auto=format",
    tags: ["landscape", "desert", "golden hour"],
    camera: "Sony A7R V",
    lens: "24-70mm f/2.8 GM",
    settings: "f/8, 1/250s, ISO 100",
    width: 1600,
    height: 1067,
  },
  {
    id: "p2",
    title: "Amber Fields",
    description: "Long late-afternoon shadows roll across harvested grain fields, the low sun pulling warmth from the earth in long diagonal strokes.",
    location: "Tuscany, Italy",
    date: "2023-09-14",
    src: "https://images.unsplash.com/photo-1533139143976-30918502365b?w=1600&h=1067&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1533139143976-30918502365b?w=800&h=533&fit=crop&auto=format",
    tags: ["landscape", "fields", "golden hour"],
    camera: "Leica SL2",
    lens: "50mm Summicron",
    settings: "f/5.6, 1/500s, ISO 200",
    width: 1600,
    height: 1067,
  },
  {
    id: "p3",
    title: "Golden Tide",
    description: "Ancient sea stacks bathed in the hour before dusk — the water turned to hammered copper by the low sun. An image I waited three days for.",
    location: "Algarve Coast, Portugal",
    date: "2023-08-22",
    src: "https://images.unsplash.com/photo-1470329508532-be27fda94658?w=1600&h=1067&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1470329508532-be27fda94658?w=800&h=533&fit=crop&auto=format",
    tags: ["seascape", "coast", "golden hour"],
    camera: "Sony A7R V",
    lens: "16-35mm f/2.8 GM",
    settings: "f/11, 1/60s, ISO 50",
    width: 1600,
    height: 1067,
  },
  {
    id: "p4",
    title: "Monolith at Dusk",
    description: "The sandstone tower catches the last fire of the setting sun against a sky split between day and night — orange below, deep blue above.",
    location: "Monument Valley, Utah",
    date: "2023-06-03",
    src: "https://images.unsplash.com/photo-1614644756940-3a865ed54d7b?w=1600&h=1067&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1614644756940-3a865ed54d7b?w=800&h=533&fit=crop&auto=format",
    tags: ["landscape", "desert", "dusk"],
    camera: "Hasselblad X2D",
    lens: "45mm",
    settings: "f/8, 1/125s, ISO 100",
    width: 1600,
    height: 1067,
  },
  {
    id: "p5",
    title: "Bare Winter",
    description: "A single tree stripped of leaves against a flat winter sky — the silhouette becomes pure geometry. Shot in monochrome from the outset.",
    location: "Black Forest, Germany",
    date: "2024-01-17",
    src: "https://images.unsplash.com/photo-1610621062045-ef5f7201bb3f?w=1067&h=1067&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1610621062045-ef5f7201bb3f?w=600&h=600&fit=crop&auto=format",
    tags: ["monochrome", "trees", "winter"],
    camera: "Leica M11 Monochrom",
    lens: "35mm Summilux",
    settings: "f/4, 1/500s, ISO 400",
    width: 1067,
    height: 1067,
  },
  {
    id: "p6",
    title: "Perpetual Ice",
    description: "The summit ridge disappears into cloud, leaving only the glaciated face visible — an abstraction of white and shadow that dissolves perspective.",
    location: "Chamonix, French Alps",
    date: "2023-12-28",
    src: "https://images.unsplash.com/photo-1482203460252-be3456f7c8d8?w=1600&h=1067&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1482203460252-be3456f7c8d8?w=800&h=533&fit=crop&auto=format",
    tags: ["mountain", "snow", "alpine"],
    camera: "Sony A7R V",
    lens: "70-200mm f/2.8 GM",
    settings: "f/6.3, 1/800s, ISO 200",
    width: 1600,
    height: 1067,
  },
  {
    id: "p7",
    title: "Highland Mist",
    description: "Morning fog settles in the valley between ridges, erasing the middle ground entirely. The layers of the landscape compress into soft tonal bands.",
    location: "Scottish Highlands",
    date: "2024-03-11",
    src: "https://images.unsplash.com/photo-1620841374140-2d0e37f9872b?w=1600&h=1003&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1620841374140-2d0e37f9872b?w=800&h=533&fit=crop&auto=format",
    tags: ["landscape", "mist", "highland"],
    camera: "Leica SL2",
    lens: "90-280mm APO",
    settings: "f/5.6, 1/250s, ISO 400",
    width: 1600,
    height: 1003,
  },
  {
    id: "p8",
    title: "Ridge Light",
    description: "Three ridgelines recede in the evening haze, each a slightly lighter tone — a natural gradient from deep violet to pale lavender.",
    location: "Dolomites, Italy",
    date: "2023-10-05",
    src: "https://images.unsplash.com/photo-1473503993293-84743f5fda84?w=1600&h=900&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1473503993293-84743f5fda84?w=800&h=450&fit=crop&auto=format",
    tags: ["mountain", "landscape", "dusk"],
    camera: "Hasselblad X2D",
    lens: "90mm",
    settings: "f/8, 1/200s, ISO 100",
    width: 1600,
    height: 900,
  },
  {
    id: "p9",
    title: "Still Gaze",
    description: "The model's gaze is quiet but direct — the image lives in the tension between the pale eyes and the warm afternoon spilling through the window behind.",
    location: "Studio, Tokyo",
    date: "2024-02-14",
    src: "https://images.unsplash.com/photo-1563170446-9c3c0622d8a9?w=1067&h=1600&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1563170446-9c3c0622d8a9?w=534&h=800&fit=crop&auto=format",
    tags: ["portrait", "studio", "natural light"],
    camera: "Leica M11",
    lens: "75mm Summilux",
    settings: "f/1.4, 1/500s, ISO 400",
    width: 1067,
    height: 1600,
  },
  {
    id: "p10",
    title: "Monochrome Study",
    description: "Removing color forces attention to light itself — the way it falls across the cheekbone, softens into the neck, disappears into the shoulder.",
    location: "Studio, Berlin",
    date: "2024-04-02",
    src: "https://images.unsplash.com/photo-1518611540400-6b85a0704342?w=1067&h=1600&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1518611540400-6b85a0704342?w=534&h=800&fit=crop&auto=format",
    tags: ["portrait", "monochrome", "studio"],
    camera: "Leica M11 Monochrom",
    lens: "50mm Noctilux",
    settings: "f/0.95, 1/250s, ISO 800",
    width: 1067,
    height: 1600,
  },
  {
    id: "p11",
    title: "Saturated Noon",
    description: "The red is almost confrontational in direct midday sun. I waited until the subject crossed the light before I clicked — one frame.",
    location: "Old City, Marrakech",
    date: "2023-07-19",
    src: "https://images.unsplash.com/photo-1626775550407-c09be28b6053?w=1067&h=1357&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1626775550407-c09be28b6053?w=600&h=762&fit=crop&auto=format",
    tags: ["portrait", "color", "street"],
    camera: "Leica Q3",
    lens: "28mm Summilux",
    settings: "f/5.6, 1/1000s, ISO 100",
    width: 1067,
    height: 1357,
  },
  {
    id: "p12",
    title: "Winter Interior",
    description: "The knit becomes a landscape in itself — every stitch a ridge, the negative space between folds a valley. Light from a single north-facing window.",
    location: "Studio, Oslo",
    date: "2024-01-29",
    src: "https://images.unsplash.com/photo-1637325262485-5cf1abb98c05?w=1067&h=1600&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1637325262485-5cf1abb98c05?w=534&h=800&fit=crop&auto=format",
    tags: ["portrait", "studio", "fashion"],
    camera: "Hasselblad X2D",
    lens: "65mm",
    settings: "f/2.8, 1/200s, ISO 400",
    width: 1067,
    height: 1600,
  },
  {
    id: "p13",
    title: "A Flash of Blue",
    description: "A small forest bird pauses in open light for a fraction of a second before disappearing back into the canopy.",
    location: "Uttarakhand, India",
    date: "2024-05-18",
    src: "https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=1600&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=800&fit=crop&auto=format",
    tags: ["bird", "wildlife", "favorite"],
    camera: "Sony A1",
    lens: "600mm f/4",
    settings: "f/5.6, 1/2000s, ISO 800",
    width: 900,
    height: 1600,
  },
  {
    id: "p14",
    title: "The Watcher",
    description: "A lion rests above the plain, still and attentive, as the last warm light moves across the rock.",
    location: "Maasai Mara, Kenya",
    date: "2024-02-09",
    src: "https://images.unsplash.com/photo-1665844092826-515257903c4c?w=1600&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1665844092826-515257903c4c?w=800&fit=crop&auto=format",
    tags: ["mammal", "wildlife", "favorite"],
    camera: "Nikon Z9",
    lens: "400mm f/2.8",
    settings: "f/4, 1/1600s, ISO 640",
    width: 1067,
    height: 1600,
  },
  {
    id: "p15",
    title: "Emerald Stillness",
    description: "A tiny frog holds perfectly still against the curve of a leaf, its world reduced to green, texture, and rain.",
    location: "Monteverde, Costa Rica",
    date: "2024-04-21",
    src: "https://images.unsplash.com/photo-1649656909369-617620472119?w=1600&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1649656909369-617620472119?w=800&fit=crop&auto=format",
    tags: ["wildlife", "amphibian", "macro"],
    camera: "Canon EOS R5",
    lens: "100mm f/2.8 Macro",
    settings: "f/8, 1/250s, ISO 1000",
    width: 900,
    height: 1600,
  },
];

const DEFAULT_PROFILE: Profile = {
  heroImage: SEED_PHOTOS[0].src,
  location: "North America",
  bio: "Wildlife, landscape and street photography. Working with available light across the natural and human world.",
  description: "My name is Poojan Gohil, and I am a photographer based in North America. I specialize in wildlife, landscape, and street photography, capturing the world as it is with a focus on natural light. My work aims to tell stories through images, highlighting the beauty and complexity of both nature and human life.",
  instagramUrl: "https://www.instagram.com/poojan_gohil/?hl=ja",
  facebookUrl: "",
  ebirdUrl: "https://ebird.org/profile/NjUzNTk0/CA-AB",
};

const SEED_BLOGS: BlogPost[] = [
  {
    id: "b1",
    slug: "on-waiting-for-light",
    title: "On Waiting for Light",
    excerpt: "The image I almost didn't make — three days in Algarve, studying tide charts and cloud cover, learning to read the quality of light before it arrives.",
    content: `There is a photograph I have of the Portuguese coast that I almost didn't make. I had driven to the Algarve specifically for the sea stacks at Ponta da Piedade — I had seen other photographers' work from that location and wanted to understand what I might do differently. The first evening, the sky turned a flat steel gray an hour before sunset, and the light died without ceremony. The second day, a warm fog moved in from the Atlantic and stayed.

By the third afternoon I had started doubting the trip. I had hiked down the cliff path four times with the camera bag digging into my shoulder, and I had made almost nothing worth keeping. My host at the guesthouse, an old fisherman named João who had lived in Lagos his whole life, told me over dinner that the afternoon looked promising. He had a way of reading the sky that I won't pretend to understand.

He was right. Forty minutes before the sun reached the horizon, the cloud bank offshore broke open at exactly the right angle. The light that came through wasn't the obvious postcard gold — it was something more complicated, a mixture of warm direct light and cool reflected light off the remaining cloud, and it landed on the sea stacks and the water in a way that made the water look like hammered copper.

I had maybe eight minutes. I made thirty frames. Three of them are worth anything. One is the image I will print large.

What I learned, or rather what I was reminded of: patience is not passive. Waiting for light means studying it, understanding its logic, learning to predict where it will fall and at what angle and at what color temperature. It means being in position before the moment arrives rather than scrambling when it does. The three days weren't wasted time — they were three days of education.

I think about this often when I am tempted to manufacture conditions rather than wait for them. The controlled studio has its value, but there is a particular quality to light that happens without you, light that the world makes regardless of your presence, that I have never been able to replicate artificially. You can only be there for it.`,
    date: "2024-03-28",
    coverImage: "https://images.unsplash.com/photo-1470329508532-be27fda94658?w=1200&h=600&fit=crop&auto=format",
    readTime: 5,
  },
  {
    id: "b2",
    slug: "the-leica-monochrom-decision",
    title: "The Monochrom Decision",
    excerpt: "Why I bought a camera that can only shoot in black and white, and what it changed about how I see — and don't see — color.",
    content: `When I tell photographers that I bought the Leica M11 Monochrom, the camera that captures only in black and white with no color filter array, I usually get one of two reactions: either they understand immediately, or they think it is an inexplicable extravagance. I want to try to explain it.

The sensor in a conventional camera covers each photosite with a red, green, or blue filter. The camera then interpolates the color information to reconstruct a full-color image — a process called demosaicing. In a monochrome sensor, there are no filters. Every photosite captures luminance information only. The result is a significantly sharper image with genuinely more detail, because you are not interpolating. But more importantly, you are working with light directly.

When I pick up the Monochrom, something shifts in how I look at a scene. I stop seeing color and start seeing tonality — the relationship between light and dark, the way shadows fall, the separation between planes. Color is seductive and often misleading. It pulls the eye. It tells you things about a scene that are true but are not always the most important true things. In monochrome, you are forced to ask: is the structure there? Is the light there? Does this image have a reason to exist beyond its surface?

I have made portraits with the Monochrom that I could not have made with a color camera — not because the technical quality is better (though it is), but because the monochrome constraint changed what I noticed and what I chose to frame.

The photographs are not better because they are black and white. Black and white is not inherently more serious or artistic than color — that is a sentimental assumption. But working within a constraint that removes one of the most powerful pictorial elements forces a specific kind of attention that has made me a better photographer when I return to color work. That is, ultimately, what I paid for.`,
    date: "2024-02-11",
    coverImage: "https://images.unsplash.com/photo-1518611540400-6b85a0704342?w=1200&h=600&fit=crop&auto=format",
    readTime: 6,
  },
  {
    id: "b3",
    slug: "on-printing",
    title: "On Printing",
    excerpt: "The photograph does not exist until it is printed. Every other form is a preview. Notes from two years of learning to print my own work.",
    content: `I spent two years thinking I understood my photographs before I learned to print them. The screen is a convenient lie — bright, backlit, calibrated to make images look their best regardless of what the image actually is. It hides tonal problems, conceals noise, and flatters color relationships that would be embarrassing on paper.

Printing forces honesty. The print is a fixed object. It does not adjust to ambient light. It does not correct for your monitor's white point or your viewing angle. It simply is what it is, and if there are problems, they are visible to anyone who looks.

I print on a large-format inkjet, using a combination of matte cotton rag and glossy baryta papers depending on the image. Matte papers suit landscapes and portraits where the image texture should feel continuous with the paper surface — where the grain of the photograph and the grain of the cotton want to be part of the same thing. Baryta papers, which have a surface similar to traditional darkroom fiber-based paper, suit images where I want deep blacks and separation in the highlights — they have a luminosity that matte papers cannot match.

The workflow matters. Soft proofing — simulating the output profile on screen before you print — is not optional. Different papers have different gamuts, and what looks saturated on screen may print muted, or worse, may shift hue entirely. I use ICC profiles provided by the paper manufacturers and verify them against test prints before I commit to final paper.

But beyond the technical: printing taught me which of my photographs actually have content. There are images I was attached to for bad reasons — because I like the place they were made, because the technical execution pleased me, because the moment felt significant when I pressed the shutter. Printing sorts these from the images that actually work. The print does not know why you like an image. It only shows you what is there.`,
    date: "2024-01-05",
    coverImage: "https://images.unsplash.com/photo-1489493512598-d08130f49bea?w=1200&h=600&fit=crop&auto=format",
    readTime: 7,
  },
];

function init() {
  const storedPhotos = localStorage.getItem(PHOTOS_KEY);
  if (!storedPhotos) {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(SEED_PHOTOS));
  } else if (localStorage.getItem(CONTENT_VERSION_KEY) !== CONTENT_VERSION) {
    const photos: Photo[] = JSON.parse(storedPhotos);
    const newPhotos = SEED_PHOTOS.filter(
      (seedPhoto) =>
        ["p13", "p14", "p15"].includes(seedPhoto.id) &&
        !photos.some((photo) => photo.id === seedPhoto.id),
    );
    localStorage.setItem(PHOTOS_KEY, JSON.stringify([...photos, ...newPhotos]));
  }
  localStorage.setItem(CONTENT_VERSION_KEY, CONTENT_VERSION);
  if (!localStorage.getItem(BLOGS_KEY)) {
    localStorage.setItem(BLOGS_KEY, JSON.stringify(SEED_BLOGS));
  }
}

export function getPhotos(): Photo[] {
  init();
  return JSON.parse(localStorage.getItem(PHOTOS_KEY) || "[]");
}

export function getPhoto(id: string): Photo | undefined {
  return getPhotos().find((p) => p.id === id);
}

export function savePhoto(photo: Photo) {
  const photos = getPhotos();
  const idx = photos.findIndex((p) => p.id === photo.id);
  if (idx >= 0) {
    photos[idx] = photo;
  } else {
    photos.unshift(photo);
  }
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

export function deletePhoto(id: string) {
  const photos = getPhotos().filter((p) => p.id !== id);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

export function getBlogs(): BlogPost[] {
  init();
  return JSON.parse(localStorage.getItem(BLOGS_KEY) || "[]");
}

export function getBlog(slug: string): BlogPost | undefined {
  return getBlogs().find((b) => b.slug === slug);
}

export function saveBlog(post: BlogPost) {
  const blogs = getBlogs();
  const idx = blogs.findIndex((b) => b.id === post.id);
  if (idx >= 0) {
    blogs[idx] = post;
  } else {
    blogs.unshift(post);
  }
  localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
}

export function deleteBlog(id: string) {
  const blogs = getBlogs().filter((b) => b.id !== id);
  localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
}

export function getProfile(): Profile {
  const storedProfile = localStorage.getItem(PROFILE_KEY);
  return storedProfile
    ? { ...DEFAULT_PROFILE, ...JSON.parse(storedProfile) }
    : DEFAULT_PROFILE;
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function isAdmin(): boolean {
  return localStorage.getItem(ADMIN_KEY) === "true";
}

export function adminLogin(password: string): boolean {
  if (password === "portfolio2024") {
    localStorage.setItem(ADMIN_KEY, "true");
    return true;
  }
  return false;
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_KEY);
}
