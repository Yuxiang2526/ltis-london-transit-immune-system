import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Story", end: true },
  { to: "/explore", label: "Explorer" },
  { to: "/network", label: "Network Map" },
  { to: "/methodology", label: "Methodology" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <NavLink to="/" className="site-logo" end>
        LTIS
      </NavLink>

      <nav className="site-nav" aria-label="Primary">
        {NAV_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
