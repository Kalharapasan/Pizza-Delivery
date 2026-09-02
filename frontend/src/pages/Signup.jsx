import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", is_staff: false });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(form);
      await login(form.username, form.password);
      navigate("/menu");
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: 72, paddingBottom: 72 }}>
      <div className="card" style={{ padding: 36 }}>
        <h1 style={{ fontSize: "1.7rem" }}>Create your account</h1>
        <p style={{ marginBottom: 28 }}>Join Forno to start ordering fresh pizza.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              required
              minLength={3}
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={6}
            />
          </div>
          <label className="checkbox-row" style={{ marginBottom: 22 }}>
            <input
              type="checkbox"
              checked={form.is_staff}
              onChange={(e) => update("is_staff", e.target.checked)}
            />
            Register as kitchen staff (manages all orders)
          </label>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Creating account\u2026" : "Sign up"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 22, textAlign: "center" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
