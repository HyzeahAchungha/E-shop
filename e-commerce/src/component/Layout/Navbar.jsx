import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNav } from "../../context/NavContext";

const NAV_LINKS = ["Collection", "New In", "Modiweek", "Plus Size", "Sustainability"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { count, setIsOpen } = useCart();
  const { goTo } = useNav();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 150,
      background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
      borderBottom: "0.5px solid #e8e5e0",
      padding: "0 48px",
      display: "flex", alignItems: "center", height: 60, gap: 40,
      backdropFilter: scrolled ? "blur(12px)" : "none",
      transition: "all 0.3s ease",
    }}>
      {/* Logo */}
      <div
        onClick={() => goTo("home")}
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, letterSpacing: "0.18em", textTransform: "lowercase", marginRight: "auto", cursor: "pointer" }}
      >
        modimal<span style={{ fontSize: 7, verticalAlign: "super", marginLeft: 2, letterSpacing: 0 }}>®</span>
      </div>

      {/* Nav links */}
      {NAV_LINKS.map((item) => (
        <a
          key={item}
          className="nav-link"
          onClick={() => item === "Collection" ? goTo("shop") : undefined}
          style={{ cursor: "pointer" }}
        >
          {item}
        </a>
      ))}

      {/* Icons */}
      <div style={{ display: "flex", gap: 20, marginLeft: "auto", alignItems: "center" }}>
        {/* Search */}
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        {/* Account */}
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
        {/* Wishlist */}
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {/* Cart with badge */}
        <button
          onClick={() => setIsOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, position: "relative" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {count > 0 && (
            <span style={{
              position: "absolute", top: -7, right: -8,
              background: "#1a1a1a", color: "#fff",
              borderRadius: "50%", width: 17, height: 17,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 500,
              letterSpacing: 0, border: "2px solid #fff",
            }}>
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}