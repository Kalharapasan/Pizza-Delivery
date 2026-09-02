import React from "react";
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

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(255, 250, 242, 0.85)",
        backdropFilter: "blur(6px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", gap: 28, height: 68 }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          <PizzaMark />
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "1.25rem" }}>
            Forno
          </span>
        </Link>

        {user && (
          <nav style={{ display: "flex", gap: 20 }}>
            <NavLink to="/menu" className="muted" style={navStyle}>
              Order
            </NavLink>
            <NavLink to="/my-orders" className="muted" style={navStyle}>
              My orders
            </NavLink>
            {user.is_staff && (
              <NavLink to="/admin" className="muted" style={navStyle}>
                Kitchen (staff)
              </NavLink>
            )}
          </nav>
        )}

        <div className="spacer" />

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="muted">
              Hi, <strong style={{ color: "var(--text)" }}>{user.username}</strong>
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
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
