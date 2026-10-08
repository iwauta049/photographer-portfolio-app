import { Link } from "react-router-dom";
import { getProfile } from "../data/store";

export default function About() {
  const profile = getProfile();
  const aboutPhoto = profile.profileImage || profile.heroImage;

  return (
    <div className="min-h-screen bg-background px-8 pb-24 pt-32 md:px-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:gap-20">
        <div className="relative min-h-[28rem] overflow-hidden bg-card lg:min-h-[70vh]">
          {aboutPhoto && (
            <img
              src={aboutPhoto}
              alt="Poojan Gohil at work"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>

        <div>
          <h1 className="font-['DM_Serif_Display'] text-5xl leading-tight text-foreground md:text-6xl">
            About
          </h1>
          <p className="mt-8 text-base font-light leading-relaxed text-secondary-foreground">
            {profile.description}
          </p>

          {/* <div className="mt-10 border-t border-border pt-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Currently based in
            </p>
            <p className="mt-2 text-sm font-light text-secondary-foreground">
              {profile.location}
            </p>
          </div> */}

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/?category=All"
              className="bg-primary px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground hover:bg-foreground"
            >
              View Portfolio
            </Link>
            <Link
              to="/contact"
              className="border border-border px-6 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:border-primary hover:text-primary"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
