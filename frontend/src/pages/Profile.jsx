import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(user?.email || "");
  const [emailError, setEmailError] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setEmailError("");
    setSavingEmail(true);
    try {
      await updateProfile({ email });
      showToast("Email updated");
    } catch (err) {
      setEmailError(err.response?.data?.detail || "Couldn't update your email.");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError("");
    setSavingPw(true);
    try {
      await changePassword(pwForm);
      setPwForm({ current_password: "", new_password: "" });
      showToast("Password updated");
    } catch (err) {
      setPwError(err.response?.data?.detail || "Couldn't update your password.");
    } finally {
      setSavingPw(false);
    }
  }

  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 72, maxWidth: 560 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>Your profile</h1>
      <p style={{ marginBottom: 32 }}>
        Signed in as <strong style={{ color: "var(--text)" }}>{user.username}</strong>
        {user.is_staff && <span className="badge badge-in-transit" style={{ marginLeft: 10 }}>Staff</span>}
      </p>

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <h3>Email address</h3>
        {emailError && <div className="alert alert-error">{emailError}</div>}
        <form onSubmit={handleEmailSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-sm" disabled={savingEmail}>
            {savingEmail ? "Saving\u2026" : "Save email"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <h3>Change password</h3>
        {pwError && <div className="alert alert-error">{pwError}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="field">
            <label htmlFor="current_password">Current password</label>
            <input
              id="current_password"
              type="password"
              value={pwForm.current_password}
              onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="new_password">New password</label>
            <input
              id="new_password"
              type="password"
              minLength={6}
              value={pwForm.new_password}
              onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
              required
            />
          </div>
          <button className="btn btn-primary btn-sm" disabled={savingPw}>
            {savingPw ? "Updating\u2026" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
