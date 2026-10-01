import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAdmin, adminLogout } from "../data/store";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const admin = isAdmin();

  const links = [
    { to: "/", label: "Work" },
    { to: "/blog", label: "Writing" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  function handleLogout() {
    adminLogout();
    navigate("/");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 md:px-16"
      style={{ background: "linear-gradient(to bottom, rgba(10,9,8,0.95) 0%, rgba(10,9,8,0) 100%)" }}>
      <Link to="/" className="font-['DM_Serif_Display'] text-lg tracking-widest uppercase text-[#e8ddd0] hover:text-[#c9a87c]">
        Marco Levi
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-10">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`text-xs tracking-[0.18em] uppercase transition-colors ${
              isActive(l.to)
                ? "text-[#c9a87c]"
                : "text-[#7a7062] hover:text-[#e8ddd0]"
            }`}
          >
            {l.label}
          </Link>
        ))}
        {admin ? (
          <>
            <Link
              to="/admin"
              className={`text-xs tracking-[0.18em] uppercase transition-colors ${
                isActive("/admin") ? "text-[#c9a87c]" : "text-[#7a7062] hover:text-[#e8ddd0]"
              }`}
            >
              Studio
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs tracking-[0.18em] uppercase text-[#5a5248] hover:text-[#c9a87c]"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/admin"
            className="text-xs tracking-[0.18em] uppercase text-[#2a2620] hover:text-[#5a5248] transition-colors"
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
        <span className={`block w-6 h-px bg-[#e8ddd0] transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block w-6 h-px bg-[#e8ddd0] transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-px bg-[#e8ddd0] transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0a0908] border-b border-[#2a2620] px-8 py-8 flex flex-col gap-6 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`text-sm tracking-[0.18em] uppercase ${
                isActive(l.to) ? "text-[#c9a87c]" : "text-[#7a7062]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {admin && (
            <>
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm tracking-[0.18em] uppercase text-[#7a7062]">Studio</Link>
              <button onClick={handleLogout} className="text-sm tracking-[0.18em] uppercase text-[#5a5248] text-left">Sign out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
