import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client.js";
import PizzaSizePicker from "../components/PizzaSizePicker.jsx";

const PRICES = { SMALL: 6.5, MEDIUM: 9.5, LARGE: 13, "EXTRA-LARGE": 16.5 };

export default function Menu() {
  const navigate = useNavigate();
  const [size, setSize] = useState("MEDIUM");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = (PRICES[size] * quantity).toFixed(2);

  async function handleOrder() {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await client.post("/orders/order", { quantity, pizza_size: size });
      setSuccess("Order placed! Track it from My Orders.");
      setTimeout(() => navigate("/my-orders"), 900);
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
        {success && <div className="alert alert-success">{success}</div>}

        <label style={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Choose a size
        </label>
        <div style={{ marginTop: 12, marginBottom: 28 }}>
          <PizzaSizePicker value={size} onChange={setSize} />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
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
