import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAdmin, adminLogout } from "../data/store";

const portfolioCategories = [
  "All",
  "Favorites",
  "Birds",
  "Mammals",
  "Other Wildlife",
  "Landscape",
  "Street",
];

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const admin = isAdmin();

  const links = [
    { to: "/", label: "Portfolio" },
    { to: "/about", label: "About" },
    { to: "/blog", label: "Blog" },
    ...(!admin ? [{ to: "/contact", label: "Contact" }] : []),
  ];

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  function handleLogout() {
    adminLogout();
    navigate("/");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 md:px-16"
      style={{ background: "linear-gradient(to bottom, rgba(250,246,239,0.95) 0%, rgba(250,246,239,0) 100%)" }}>
      <Link to="/" className="font-['DM_Serif_Display'] text-lg tracking-widest uppercase text-card-foreground hover:text-primary">
        Poojan Gohil
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-10">
        {links.map((l) =>
          l.to === "/" ? (
            <div
              key={l.to}
              className="relative"
              onMouseEnter={() => setPortfolioOpen(true)}
              onMouseLeave={() => setPortfolioOpen(false)}
            >
              <Link
                to={l.to}
                onClick={() => setPortfolioOpen(false)}
                className={`text-xs tracking-[0.18em] uppercase transition-colors ${isActive(l.to)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-card-foreground"
                  }`}
              >
                {l.label}
              </Link>
              <div
                className={`absolute left-1/2 top-full z-50 min-w-52 -translate-x-1/2 pt-5 transition-all duration-200 ${portfolioOpen
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0"
                  }`}
              >
                <div className="border border-border bg-primary-foreground/95 p-2 shadow-lg backdrop-blur-md">
                  {portfolioCategories.map((category) => (
                    <Link
                      key={category}
                      to={`/?category=${encodeURIComponent(category)}`}
                      onClick={(event) => {
                        setPortfolioOpen(false);
                        event.currentTarget.blur();
                      }}
                      className="block px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:bg-secondary hover:text-primary"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs tracking-[0.18em] uppercase transition-colors ${isActive(l.to)
                ? "text-primary"
                : "text-muted-foreground hover:text-card-foreground"
                }`}
            >
              {l.label}
            </Link>
          ),
        )}
        {admin ? (
          <>
            <Link
              to="/admin"
              className={`text-xs tracking-[0.18em] uppercase transition-colors ${isActive("/admin") ? "text-primary" : "text-muted-foreground hover:text-card-foreground"
                }`}
            >
              Studio
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-primary"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/admin"
            className="text-xs tracking-[0.18em] uppercase text-border hover:text-muted-foreground transition-colors"
          >
            ·
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-px bg-card-foreground transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block w-6 h-px bg-card-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-px bg-card-foreground transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border px-8 py-8 flex flex-col gap-6 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`text-sm tracking-[0.18em] uppercase ${isActive(l.to) ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {l.label}
            </Link>
          ))}
          {admin && (
            <>
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm tracking-[0.18em] uppercase text-muted-foreground">Studio</Link>
              <button onClick={handleLogout} className="text-sm tracking-[0.18em] uppercase text-muted-foreground text-left">Sign out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
