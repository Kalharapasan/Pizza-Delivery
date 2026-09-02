import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div style={{ maxWidth: 620 }}>
        <span className="badge badge-pending">Stone-fired since forever</span>
        <h1 style={{ fontSize: "3rem", marginTop: 16, lineHeight: 1.08 }}>
          Real pizza, <span style={{ color: "var(--tomato)" }}>delivered honest.</span>
        </h1>
        <p style={{ fontSize: "1.05rem", marginTop: 16, marginBottom: 32 }}>
          Pick a size, place the order, and watch it move from oven to your door &mdash;
          no gimmicks, just dough, sauce, and basil.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          {user ? (
            <Link to="/menu" className="btn btn-primary">
              Order a pizza
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary">
                Get started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                I have an account
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 72,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {[
          { title: "Pick your size", body: "Four sizes, from a 9\u2033 personal pie to an 18\u2033 sharer." },
          { title: "Track it live", body: "Every order moves from pending to in-transit to delivered." },
          { title: "Kitchen-run staff view", body: "Staff accounts see every order and update its status." },
        ].map((item) => (
          <div key={item.title} className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem" }}>{item.title}</h3>
            <p style={{ marginBottom: 0 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
