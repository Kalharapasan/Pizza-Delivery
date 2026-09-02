import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client.js";
import PizzaSizePicker from "../components/PizzaSizePicker.jsx";
import { useToast } from "../context/ToastContext.jsx";

const PRICES = { SMALL: 6.5, MEDIUM: 9.5, LARGE: 13, "EXTRA-LARGE": 16.5 };

export default function Menu() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [size, setSize] = useState("MEDIUM");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState(() => localStorage.getItem("last_delivery_address") || "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = (PRICES[size] * quantity).toFixed(2);

  async function handleOrder() {
    setError("");

    if (address.trim().length < 5) {
      setError("Please enter a delivery address (at least 5 characters).");
      return;
    }

    setSubmitting(true);
    try {
      await client.post("/orders/order", {
        quantity,
        pizza_size: size,
        delivery_address: address.trim(),
        notes: notes.trim() || null,
      });
      localStorage.setItem("last_delivery_address", address.trim());
      showToast("Order placed! Track it from My Orders.");
      setTimeout(() => navigate("/my-orders"), 500);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 72 }}>
      <div style={{ maxWidth: 620, marginBottom: 40 }}>
        <span className="badge badge-in-transit">Build your order</span>
        <h1 style={{ fontSize: "2.1rem", marginTop: 12 }}>One pizza, your size.</h1>
        <p>Wood-fired, stone-baked, and out the door in under 30 minutes.</p>
      </div>

      <div className="card" style={{ padding: 32, maxWidth: 640 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <label style={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Choose a size
        </label>
        <div style={{ marginTop: 12, marginBottom: 28 }}>
          <PizzaSizePicker value={size} onChange={setSize} />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="quantity">Quantity</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                &minus;
              </button>
              <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>{quantity}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="spacer" />

          <div style={{ textAlign: "right" }}>
            <div className="muted">Estimated total</div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--tomato-dark)" }}>
              ${total}
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="address">Delivery address</label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 12 Galle Road, Colombo 03"
            required
          />
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="notes">Delivery notes (optional)</label>
          <input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Ring the bell twice, leave at the gate"
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 28 }}
          onClick={handleOrder}
          disabled={submitting}
        >
          {submitting ? "Placing order\u2026" : "Place order"}
        </button>
      </div>
    </div>
  );
}
