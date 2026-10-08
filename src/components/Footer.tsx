import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-border bg-background px-8 py-7 md:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-light tracking-wide text-muted-foreground">
          © {new Date().getFullYear()} Poojan Gohil Photography
        </p>
        <nav aria-label="Footer navigation" className="flex items-center gap-6">
          <Link
            to="/"
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
          >
            Portfolio
          </Link>
          <Link
            to="/about"
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
          >
            About
          </Link>
          <Link
            to="/blog"
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
          >
            Blog
          </Link>
          <Link
            to="/contact"
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
