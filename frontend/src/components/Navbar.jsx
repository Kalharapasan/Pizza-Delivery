import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function PizzaMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <circle cx="15" cy="15" r="13" fill="var(--crust)" />
      <path d="M15 15 L15 2 A13 13 0 0 1 27.2 10 Z" fill="var(--tomato)" />
      <circle cx="19" cy="8" r="1.4" fill="var(--basil)" />
      <circle cx="12" cy="19" r="1.3" fill="var(--basil)" />
      <circle cx="20" cy="16" r="1.1" fill="var(--basil)" />
    </svg>
  );
}

const navStyle = ({ isActive }) => ({
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.92rem",
  color: isActive ? "var(--tomato-dark)" : "var(--text-muted)",
  paddingBottom: 4,
  borderBottom: isActive ? "2px solid var(--tomato)" : "2px solid transparent",
});

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login");
  }

  const links = user && (
    <>
      <NavLink to="/menu" style={navStyle} onClick={() => setMenuOpen(false)}>
        Order
      </NavLink>
      <NavLink to="/my-orders" style={navStyle} onClick={() => setMenuOpen(false)}>
        My orders
      </NavLink>
      {user.is_staff && (
        <NavLink to="/admin" style={navStyle} onClick={() => setMenuOpen(false)}>
          Kitchen (staff)
        </NavLink>
      )}
      <NavLink to="/profile" style={navStyle} onClick={() => setMenuOpen(false)}>
        Profile
      </NavLink>
    </>
  );

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(255, 250, 242, 0.9)",
        backdropFilter: "blur(6px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 28, height: 68 }}>
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--text)" }}
          onClick={() => setMenuOpen(false)}
        >
          <PizzaMark />
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "1.25rem" }}>Forno</span>
        </Link>

        {/* desktop nav */}
        <nav className="nav-desktop" style={{ display: "flex", gap: 20 }}>
          {links}
        </nav>

        <div className="spacer" />

        {/* desktop auth actions */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {user ? (
            <>
              <span className="muted">
                Hi, <strong style={{ color: "var(--text)" }}>{user.username}</strong>
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* mobile hamburger */}
        <button
          className="nav-mobile-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="M6 6L18 18M18 6L6 18" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7H20M4 12H20M4 17H20" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* mobile dropdown */}
      {menuOpen && (
        <div
          className="nav-mobile-panel"
          style={{
            display: "none",
            flexDirection: "column",
            gap: 4,
            padding: "8px 24px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "14px 0" }}>{links}</div>
          {user ? (
            <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ width: "100%" }}>
              Log out
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: inline-flex !important; }
          .nav-mobile-panel { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
